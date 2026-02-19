import type { AgentConfig } from "@/types/agent";
import { RESEARCH_SYSTEM_PROMPT } from "./prompts/research";
import { ENGINEERING_SYSTEM_PROMPT } from "./prompts/engineering";
import { PRODUCT_SYSTEM_PROMPT } from "./prompts/product";

export const CEO_AGENT = {
  id: "ceo",
  name: "You (CEO)",
  role: "CEO",
  avatar: "👔",
  color: "bg-blue-600",
} as const;

export const AGENTS: AgentConfig[] = [
  {
    id: "research",
    name: "Riley",
    role: "Head of Research",
    avatar: "🔬",
    color: "bg-emerald-600",
    provider: "anthropic",
    model: "claude-sonnet-4-20250514",
    systemPrompt: RESEARCH_SYSTEM_PROMPT,
  },
  {
    id: "engineering",
    name: "Jordan",
    role: "VP of Engineering",
    avatar: "⚙️",
    color: "bg-amber-600",
    provider: "openai",
    model: "gpt-4o",
    systemPrompt: ENGINEERING_SYSTEM_PROMPT,
  },
  {
    id: "product",
    name: "Morgan",
    role: "Head of Product & UX",
    avatar: "🎯",
    color: "bg-purple-600",
    provider: "anthropic",
    model: "claude-sonnet-4-20250514",
    systemPrompt: PRODUCT_SYSTEM_PROMPT,
  },
];

/** Default turn order: Research → Engineering → Product */
export const DEFAULT_TURN_ORDER = ["research", "engineering", "product"];

export function getAgentById(id: string): AgentConfig | undefined {
  return AGENTS.find((a) => a.id === id);
}
