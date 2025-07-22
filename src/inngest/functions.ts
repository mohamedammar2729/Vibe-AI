import { Sandbox } from '@e2b/code-interpreter';
import { getSandbox } from './utils';
import { AzureKeyCredential } from '@azure/core-auth';
import ModelClient, {
  ChatCompletionsOutput,
  ChatRequestMessage,
} from '@azure-rest/ai-inference';

import { inngest } from './client';
import {
  getAzureOpenAIConfig,
  validateInputText,
  formatError,
  logMetrics,
} from '../config/azure-openai.config';

/**
 * Azure OpenAI client configuration for GitHub Marketplace
 * Uses GPT-4.1 model with classic access token authentication
 */
const createAzureOpenAIClient = () => {
  const config = getAzureOpenAIConfig();

  return ModelClient(
    config.baseUrl,
    new AzureKeyCredential(config.githubToken)
  );
};

/**
 * Generate text using Azure OpenAI GPT-4.1
 */
const generateWithAzureOpenAI = async (prompt: string): Promise<string> => {
  const client = createAzureOpenAIClient();
  const config = getAzureOpenAIConfig();
  const startTime = Date.now();

  try {
    const messages: ChatRequestMessage[] = [
      {
        role: 'system',
        content:
          'You are an expert next.js developer. You write readable, maintainable code. Your write simple Next.js & React snippets. You are very good at writing code in tailwind css that is easy to read and understand in style.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ];

    const response = await client.path('/chat/completions').post({
      body: {
        model: config.model,
        messages: messages,
        temperature: config.temperature, // Controls creativity: 0 = super boring, 1 = very creative
        max_tokens: config.maxTokens, // The max number of words/characters the AI can respond with
        top_p: config.topP, // Another setting for randomness (usually keep 1)
      },
    });

    if (response.status !== '200') {
      throw new Error(`Azure OpenAI API error: ${response.status}`);
    }

    const data = response.body as ChatCompletionsOutput;
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content received from Azure OpenAI API');
    }

    const executionTime = Date.now() - startTime;
    logMetrics({
      functionName: 'generateWithAzureOpenAI',
      inputLength: prompt.length,
      outputLength: content.length,
      executionTime,
      success: true,
    });

    return content.trim();
  } catch (error) {
    const executionTime = Date.now() - startTime;
    logMetrics({
      functionName: 'generateWithAzureOpenAI',
      inputLength: prompt.length,
      outputLength: 0,
      executionTime,
      success: false,
    });

    console.error('Azure OpenAI API error:', error);
    throw new Error(
      'Failed to generate response: ' + formatError(error).message
    );
  }
};

export const helloWorld = inngest.createFunction(
  {
    id: 'hello-world',
    name: 'CodeAgent with Azure OpenAI GPT-4.1',
    concurrency: {
      limit: 10, // If 10 users send text at once, all 10 can be processed in parallel
    },
    retries: 3, // If something goes wrong (error), try again up to 3 times.
  },
  { event: 'test/hello.world' },
  async ({ event, step }) => {
    const sandboxId = await step.run('get-sandbox-id', async () => {
      // Create a new sandbox instance for code execution
      const sandbox = await Sandbox.create('vibe-aii-test2');
      return sandbox.sandboxId;
    });

    const codeGeneration = await step.run(
      'azure-openai-code-generation',
      async () => {
        const startTime = Date.now();

        try {
          // Validate and sanitize input
          const inputText = validateInputText(event.data?.value);

          const codeAgent = await generateWithAzureOpenAI(
            `Write the following snippet: "${inputText}"`
          );

          const executionTime = Date.now() - startTime;
          return {
            success: true,
            data: {
              originalText: inputText,
              codeSnippet: codeAgent,
              metadata: {
                model: 'gpt-4.1',
                provider: 'azure-openai-github-marketplace',
                processedAt: new Date().toISOString(),
                executionTimeMs: executionTime,
              },
            },
          };
        } catch (error) {
          const executionTime = Date.now() - startTime;
          const formattedError = formatError(error, 'Azure OpenAI failed');
          return {
            success: false,
            error: {
              message: formattedError.message,
              code: 'AZURE_OPENAI_FAILED',
              timestamp: new Date().toISOString(),
              provider: 'azure-openai-github-marketplace',
              executionTimeMs: executionTime,
            },
          };
        }
      }
    );

    const sandboxUrl = await step.run('get-sandbox-url', async () => {
      const sandbox = await getSandbox(sandboxId);
      const host = sandbox.getHost(3000);
      return `https://${host}`;
    });

    return {
      sandboxUrl,
      ...codeGeneration,
    };
  }
);
