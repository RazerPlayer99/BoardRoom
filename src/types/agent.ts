export type Provider = "openai" | "anthropic";

export interface AgentConfig {
  id: string;
  name: string;
  role: string;
  avatar: string; // emoji for MVP
  color: string; // tailwind color class for bubble accent
  provider: Provider;
  model: string;
  systemPrompt: string;
}
