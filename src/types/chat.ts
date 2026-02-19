export type MessageRole = "ceo" | "agent" | "system";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  agentId: string; // "ceo" for CEO messages, agent id otherwise
  agentName: string;
  avatar: string;
  color: string;
  content: string;
  timestamp: number;
  isThinking?: boolean; // true while waiting for response
}

export type TurnMode = "default-order" | "round-robin" | "ceo-picks";
