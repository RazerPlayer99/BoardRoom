import type { ChatMessage } from "./chat";

export interface ProviderRequest {
  agentId: string;
  systemPrompt: string;
  provider: "openai" | "anthropic";
  model: string;
  messages: ChatMessage[];
}

export interface ProviderResponse {
  content: string;
  agentId: string;
}
