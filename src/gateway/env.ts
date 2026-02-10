import type { MoltbotEnv } from '../types';

/**
 * Build environment variables to pass to the Moltbot container process
 *
 * @param env - Worker environment bindings
 * @returns Environment variables record
 */
export function buildEnvVars(env: MoltbotEnv): Record<string, string> {
  const envVars: Record<string, string> = {};

  // Normalize the base URL by removing trailing slashes
  const normalizedGatewayBaseUrl = env.AI_GATEWAY_BASE_URL?.replace(/\/+$/, '');
  const isOpenAIGateway = normalizedGatewayBaseUrl?.endsWith('/openai');

  // AI Gateway vars take precedence
  // Map to the appropriate provider env var based on the gateway endpoint
  if (env.AI_GATEWAY_API_KEY) {
    if (isOpenAIGateway) {
      envVars.OPENAI_API_KEY = env.AI_GATEWAY_API_KEY;
    } else {
      envVars.ANTHROPIC_API_KEY = env.AI_GATEWAY_API_KEY;
    }
  }

  // Fall back to direct provider keys
  if (!envVars.ANTHROPIC_API_KEY && env.ANTHROPIC_API_KEY) {
    envVars.ANTHROPIC_API_KEY = env.ANTHROPIC_API_KEY;
  }
  if (!envVars.OPENAI_API_KEY && env.OPENAI_API_KEY) {
    envVars.OPENAI_API_KEY = env.OPENAI_API_KEY;
  }

  // Pass gateway base URL (used by start-moltbot.sh to determine provider)
  if (normalizedGatewayBaseUrl) {
    envVars.AI_GATEWAY_BASE_URL = normalizedGatewayBaseUrl;

    // Also set the provider-specific base URL env var (for legacy compatibility)
    if (isOpenAIGateway) {
      envVars.OPENAI_BASE_URL = normalizedGatewayBaseUrl;
    } else {
      envVars.ANTHROPIC_BASE_URL = normalizedGatewayBaseUrl;
    }
  } else if (env.ANTHROPIC_BASE_URL) {
    // Direct Anthropic base URL (if set)
    envVars.ANTHROPIC_BASE_URL = env.ANTHROPIC_BASE_URL.replace(/\/+$/, '');
  }

  // IMPORTANT: Always pass direct OPENAI_BASE_URL if set (e.g., DeepSeek direct or CF AI Gateway deepseek/compat)
  // This ensures the container sees OPENAI_BASE_URL even when AI_GATEWAY_BASE_URL is not set.
  if (env.OPENAI_BASE_URL) {
    envVars.OPENAI_BASE_URL = env.OPENAI_BASE_URL.replace(/\/+$/, '');
  }

  // Map MOLTBOT_GATEWAY_TOKEN to CLAWDBOT_GATEWAY_TOKEN (container expects this name)
  if (env.MOLTBOT_GATEWAY_TOKEN) envVars.CLAWDBOT_GATEWAY_TOKEN = env.MOLTBOT_GATEWAY_TOKEN;

  // Pass DEV_MODE as CLAWDBOT_DEV_MODE to container
  if (env.DEV_MODE) envVars.CLAWDBOT_DEV_MODE = env.DEV_MODE;

  if (env.CLAWDBOT_BIND_MODE) envVars.CLAWDBOT_BIND_MODE = env.CLAWDBOT_BIND_MODE;

  // Channels
  if (env.TELEGRAM_BOT_TOKEN) envVars.TELEGRAM_BOT_TOKEN = env.TELEGRAM_BOT_TOKEN;
  if (env.TELEGRAM_DM_POLICY) envVars.TELEGRAM_DM_POLICY = env.TELEGRAM_DM_POLICY;

  if (env.DISCORD_BOT_TOKEN) envVars.DISCORD_BOT_TOKEN = env.DISCORD_BOT_TOKEN;
  if (env.DISCORD_DM_POLICY) envVars.DISCORD_DM_POLICY = env.DISCORD_DM_POLICY;

  if (env.SLACK_BOT_TOKEN) envVars.SLACK_BOT_TOKEN = env.SLACK_BOT_TOKEN;
  if (env.SLACK_APP_TOKEN) envVars.SLACK_APP_TOKEN = env.SLACK_APP_TOKEN;

  // Browser/CDP
  if (env.CDP_SECRET) envVars.CDP_SECRET = env.CDP_SECRET;
  if (env.WORKER_URL) envVars.WORKER_URL = env.WORKER_URL;

  return envVars;
}