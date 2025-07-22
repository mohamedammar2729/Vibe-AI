/**
 * Azure OpenAI Configuration
 * Centralized configuration for Azure OpenAI integration with proper validation
 */

export interface AzureOpenAIConfig {
  githubToken: string;
  baseUrl: string;
  model: string;
  maxTokens: number;
  temperature: number;
  topP: number;
}



/**
 * Validates environment variables and returns configuration
 */
export function getAzureOpenAIConfig(): AzureOpenAIConfig {
  const githubToken = process.env.GITHUB_TOKEN;
  
  if (!githubToken) {
    throw new Error(
      'GITHUB_TOKEN environment variable is required.'
    );
  }
  
  return {
    githubToken,
    baseUrl: 'https://models.github.ai/inference',
    model: 'gpt-4.1',
    maxTokens: 100, // Optimized for 2-word summaries
    temperature: 0.7,
    topP: 1.0,
  };
}

/**
 * Validation utility for input text
 */
export function validateInputText(text: unknown): string {
  if (typeof text !== 'string') {
    throw new Error('Input must be a string');
  }
  
  if (!text.trim()) {
    throw new Error('Input text cannot be empty');
  }
  
  if (text.length > 10000) {
    console.warn('⚠️  Warning: Input text is very long. Consider chunking for better performance.');
  }
  
  return text.trim();
}

/**
 * Utility to format error messages consistently
 */
export function formatError(error: unknown, context?: string): {
  message: string;
  code: string;
  context?: string;
} {
  const baseMessage = error instanceof Error ? error.message : 'Unknown error occurred';
  
  return {
    message: context ? `${context}: ${baseMessage}` : baseMessage,
    code: 'AZURE_OPENAI_ERROR',
    context,
  };
}

/**
 * Utility to log function execution metrics
 */
export function logMetrics(metrics: {
  functionName: string;
  inputLength: number;
  outputLength: number;
  executionTime: number;
  success: boolean;
}) {
  console.log('📊 Function Metrics:', {
    ...metrics,
    timestamp: new Date().toISOString(),
    provider: 'azure-openai-github-marketplace',
  });
}

/**
 * Default configuration export
 */
const azureOpenAIConfig = {
  getAzureOpenAIConfig,
  validateInputText,
  formatError,
  logMetrics,
};

export default azureOpenAIConfig;
