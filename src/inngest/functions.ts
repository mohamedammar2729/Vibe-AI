import { Sandbox } from "@e2b/code-interpreter";
import { getSandbox } from "./utils";

import { inngest } from "./client";
import {
  createTool,
  createAgent,
  createNetwork,
  gemini,
  type Tool,
} from "@inngest/agent-kit";
import { z } from "zod";
import { PROMPT } from "../prompt";
import { lastAssistantTextMessageIndex } from "./utils";
import { prisma } from "@/lib/db";

interface AgentState {
  summary: string;
  files: { [path: string]: string };
}

export const codeAgentFunction = inngest.createFunction(
  {
    id: "code-agent",
    // Increase function timeout to 30 minutes
    timeouts: {
      // Function execution timeout
      start: "30m",
    },
  },
  { event: "code-agent/run" },
  async ({ event, step }) => {
    const sandboxId = await step.run("get-sandbox-id", async () => {
      // Create a new sandbox instance for code execution with timeout configuration
      const sandbox = await Sandbox.create("vibe-aii-test2", {
        timeoutMs: 1800000, // 30 minutes in milliseconds
      });
      return sandbox.sandboxId;
    });
    const codeAgent = createAgent<AgentState>({
      name: "code-agent",
      description: "An expert coding agent",
      system: PROMPT,
      model: gemini({
        model: "gemini-2.5-pro",
      }),
      tools: [
        createTool({
          name: "terminal",
          description: "Use the terminal to run commands.",
          // this is the command that will be run in the terminal by the agent (ai)
          parameters: z.object({
            command: z.string(),
          }),
          handler: async ({ command }, { step }) => {
            // it returns the result of the command execution
            // run take the name of tool and a function that will be executed
            return await step?.run("terminal", async () => {
              const buffers = { stdout: "", stderr: "" };
              try {
                // check if the sandbox is available
                const sandbox = await getSandbox(sandboxId);
                // run the command in the sandbox and capture stdout and stderr
                const result = await sandbox.commands.run(command, {
                  timeoutMs: 600000, // 10 minutes timeout for individual commands
                  // When the command prints normal output add it to stdout text.
                  onStdout: (data: string) => {
                    buffers.stdout += data;
                  },
                  // When the command prints error output, add it to stderr text.
                  onStderr: (data: string) => {
                    buffers.stderr += data;
                  },
                });
                return result.stdout;
              } catch (error) {
                console.error(`
              command failed: ${error} \nstdout: ${buffers.stdout} \nstderr: ${buffers.stderr}
            `);
                return `command failed: ${error} \nstdout: ${buffers.stdout} \nstderr: ${buffers.stderr}`;
              }
            });
          },
        }),
        createTool({
          name: "createOrUpdateFiles",
          description: "Create or update a file in the sandbox.",
          // Zod schema: an array of { path, content } objects — file path + text to write.
          parameters: z.object({
            files: z.array(
              z.object({
                path: z.string(),
                content: z.string(),
              })
            ),
          }),
          // When called, we get files array. Also access network shared state.
          handler: async (
            { files },
            { step, network }: Tool.Options<AgentState>
          ) => {
            const newFiles = await step?.run(
              "createOrUpdateFiles",
              async () => {
                try {
                  // start an object that remembers written files across tool calls.
                  const updateFiles = network.state.data.files || {};
                  const sandbox = await getSandbox(sandboxId);
                  // Loop through files: write each file’s content into sandbox.
                  // store the content in updateFiles map.
                  for (const file of files) {
                    await sandbox.files.write(file.path, file.content);
                    updateFiles[file.path] = file.content;
                  }
                  return updateFiles;
                } catch (error) {
                  return "Error creating files: " + error;
                }
              }
            );
            // After step finishes, check: if we actually got an object back,
            // save it into network.state.data.files so all agents/steps can see updated file list.
            if (typeof newFiles === "object") {
              network.state.data.files = newFiles;
            }
          },
        }),
        createTool({
          name: "readFiles",
          description: "Read files from the sandbox.",
          // Needs a list / array of file paths (strings).
          parameters: z.object({
            files: z.array(z.string()),
          }),
          handler: async ({ files }, { step }) => {
            // This tool reads files from the sandbox and returns their contents.
            return await step?.run("readFiles", async () => {
              try {
                const sandbox = await getSandbox(sandboxId);
                const contents = [];
                // Loop through each file path, read its content, and store it in an array.
                for (const file of files) {
                  const content = await sandbox.files.read(file);
                  contents.push({ path: file, content });
                }
                return JSON.stringify(contents);
              } catch (error) {
                return "Error reading files: " + error;
              }
            });
          },
        }),
      ],
      // Lifecycle hooks for the agent. it has access to all tools and network state.
      lifecycle: {
        // Run every time the agent produces a response message.
        // We see what it said & can update shared state.
        onResponse: async ({ result, network }) => {
          // result is the agent response, which includes messages.
          // We want to check if the last message is a text message from the assistant.
          // If it is, we check if it contains a <task_summary> tag.
          const lastAssistantTextMessage =
            lastAssistantTextMessageIndex(result);
          // If the text contains <task_summary> tag, store entire message in network.state.data.summary so other parts can know we’re done / have summary.
          if (lastAssistantTextMessage && network) {
            if (lastAssistantTextMessage.includes("<task_summary>")) {
              network.state.data.summary = lastAssistantTextMessage;
            }
          }
          return result;
        },
      },
    });
    const network = createNetwork<AgentState>({
      name: "code-agent-network",
      agents: [codeAgent],
      maxIter: 30,
      // if we have a summary in the network state, break the loop.
      router: async ({ network }) => {
        const summary = network.state.data.summary;
        if (summary) {
          return;
        }
        // If no summary, continue running the agent. limit to 15 iterations.
        return codeAgent;
      },
    });
    const result = await network.run(event.data.value);
    const isError =
      !result.state.data.summary ||
      Object.keys(result.state.data.files || {}).length === 0;

    const sandboxUrl = await step.run("get-sandbox-url", async () => {
      const sandbox = await getSandbox(sandboxId);
      const host = sandbox.getHost(3000);
      return `https://${host}`;
    });

    await step.run("save-result", async () => {
      if (isError) {
        return await prisma.message.create({
          data: {
            projectId: event.data.projectId,
            content: "Something went wrong. Please try again.",
            role: "ASSISTANT",
            type: "ERROR",
          },
        });
      }
      return await prisma.message.create({
        data: {
          projectId: event.data.projectId,
          content: result.state.data.summary,
          role: "ASSISTANT",
          type: "RESULT",
          Fragment: {
            create: {
              sandboxUrl: sandboxUrl,
              title: "Fragment",
              file: result.state.data.files,
            },
          },
        },
      });
    });

    return {
      url: sandboxUrl,
      title: "Fragment",
      files: result.state.data.files,
      summary: result.state.data.summary,
    };
  }
);
