import { Sandbox } from '@e2b/code-interpreter';
import { AgentResult, TextMessage } from '@inngest/agent-kit';

export async function getSandbox(sandboxId: string) {
  const sandbox = await Sandbox.connect(sandboxId);
  if (!sandbox) {
    throw new Error(`Sandbox with ID ${sandboxId} not found`);
  }
  return sandbox;
}

export function lastAssistantTextMessageIndex(result: AgentResult) {
  const lastAssistantTextMessageIndex = result.output.findLastIndex(
    (message) => message.role === 'assistant'
  );

  const message = result.output[lastAssistantTextMessageIndex] as
    | TextMessage
    | undefined;

  return message?.content
  // If the message content is a string, return it directly.
  // If it's an array, join the text parts together. to get a single string.
    ? typeof message.content === 'string'
      ? message.content
      : message.content.map((m) => m.text).join('')
    : undefined;
}
