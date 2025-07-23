/* eslint-disable @typescript-eslint/no-explicit-any */
import { Sandbox } from '@e2b/code-interpreter';
import { getSandbox } from './utils';

import { inngest } from './client';
import {
  createTool,
  createAgent,
  createNetwork,
  gemini,
} from '@inngest/agent-kit';
import { z } from 'zod';
import { PROMPT } from '../prompt';
import { lastAssistantTextMessageIndex } from './utils';

export const helloWorld = inngest.createFunction(
  { id: 'hello-world' },
  { event: 'test/hello.world' },
  async ({ event, step }) => {
    const sandboxId = await step.run('get-sandbox-id', async () => {
      // Create a new sandbox instance for code execution
      const sandbox = await Sandbox.create('vibe-aii-test2');
      return sandbox.sandboxId;
    });
    const codeAgent = createAgent({
      name: 'code-agent',
      description: 'An expert coding agent',
      system: PROMPT,
      model: gemini({
        model: 'gemini-2.5-flash',
      }),
      tools: [
        createTool({
          name: 'terminal',
          description: 'Use the terminal to run commands.',
          // this is the command that will be run in the terminal by the agent (ai)
          parameters: z.object({
            command: z.string(),
          }),
          handler: async ({ command }, { step }) => {
            // it returns the result of the command execution
            // run take the name of tool and a function that will be executed
            return await step?.run('terminal', async () => {
              const buffers = { stdout: '', stderr: '' };
              try {
                // check if the sandbox is available
                const sandbox = await getSandbox(sandboxId);
                // run the command in the sandbox and capture stdout and stderr
                const result = await sandbox.commands.run(command, {
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
          name: 'createOrUpdateFiles',
          description: 'Create or update a file in the sandbox.',
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
          handler: async ({ files }, { step, network }) => {
            const newFiles = await step?.run(
              'createOrUpdateFiles',
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
                  return 'Error creating files: ' + error;
                }
              }
            );
            // After step finishes, check: if we actually got an object back,
            // save it into network.state.data.files so all agents/steps can see updated file list.
            if (typeof newFiles === 'object') {
              network.state.data.files = newFiles;
            }
          },
        }),
        createTool({
          name: 'readFiles',
          description: 'Read files from the sandbox.',
          // Needs a list / array of file paths (strings).
          parameters: z.object({
            files: z.array(z.string()),
          }),
          handler: async ({ files }, { step }) => {
            // This tool reads files from the sandbox and returns their contents.
            return await step?.run('readFiles', async () => {
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
                return 'Error reading files: ' + error;
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
            if (lastAssistantTextMessage.includes('<task_summary>')) {
              network.state.data.summary = lastAssistantTextMessage;
            }
          }
          return result;
        },
      },
    });
    const network = createNetwork({
      name: 'code-agent-network',
      agents: [codeAgent],
      maxIter: 15,
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

    const sandboxUrl = await step.run('get-sandbox-url', async () => {
      const sandbox = await getSandbox(sandboxId);
      const host = sandbox.getHost(3000);
      return `https://${host}`;
    });
    return {
      url: sandboxUrl,
      title: 'Fragment',
      files: result.state.data.files,
      summary: result.state.data.summary,
    };
  }
);
