import type { AgentConfig } from "@/types/agent";
import type { ChatMessage } from "@/types/chat";

/**
 * Mock response generator for Step 2.
 * Produces role-appropriate responses that reference the conversation context.
 * Will be replaced by real provider calls in Step 3.
 */

const RESEARCH_RESPONSES = [
  "Looking at the data here — the market for {topic} has grown roughly 34% YoY based on recent analyst reports. Before we commit resources, I'd want to validate our assumptions with at least a small user survey. The risk is building for a segment that's already saturated.",
  "I've been tracking this space. Three key findings: (1) early adopters are mostly technical users, (2) retention drops sharply after week 2 for tools without strong onboarding, and (3) pricing sensitivity is higher than we assumed. I'd recommend we dig into the retention angle before scaling.",
  "Interesting direction. From a research perspective, the competitive landscape shows 4-5 serious players but none with strong moats yet. The window is open, but our differentiation needs to be sharper than \"better UX\" — that claim doesn't survive first contact with users.",
];

const ENGINEERING_RESPONSES = [
  "Technically feasible — I'd estimate about 2-3 sprints for an MVP. The main risk is {topic} integration complexity. I'd push for a thin vertical slice first: one happy path, end-to-end, before we add the bells and whistles. Let's not overengineer this.",
  "I can build this, but let me flag the trade-offs. Going fast means taking on tech debt in the API layer. That's fine if we're validating — not fine if we're planning to scale in Q3. I need to know which mode we're in before I staff this up.",
  "From an architecture standpoint, I'd go with a simple request/response pattern first and avoid premature optimization. We can add streaming, caching, and edge deployment later. Biggest blocker right now is getting alignment on the data model.",
];

const PRODUCT_RESPONSES = [
  "Let me reframe this from the user's perspective. The core question isn't whether we *can* build {topic} — it's whether it solves a real pain point strongly enough that users change their behavior. What's the \"magic moment\" we're designing toward?",
  "I like the direction, but our success metric needs to be crisper. I'd propose: (1) activation rate > 40% in week 1, (2) weekly retention > 25% by month 2. If we can't hit those, the feature isn't sticky enough. We should design the MVP to test exactly these signals.",
  "Before we go deeper — who is the primary persona here? If it's technical power users, the UX can be more dense. If we're going broader, we need serious simplification. This decision cascades into everything: onboarding flow, feature surface, even pricing.",
];

const RESPONSE_MAP: Record<string, string[]> = {
  research: RESEARCH_RESPONSES,
  engineering: ENGINEERING_RESPONSES,
  product: PRODUCT_RESPONSES,
};

function extractTopic(messages: ChatMessage[]): string {
  const lastCeoMessage = [...messages].reverse().find((m) => m.role === "ceo");
  if (!lastCeoMessage) return "this initiative";

  // Grab first few meaningful words as the "topic"
  const words = lastCeoMessage.content.split(/\s+/).slice(0, 6).join(" ");
  return words.length > 40 ? words.slice(0, 40) + "…" : words;
}

export function generateMockResponse(
  agent: AgentConfig,
  messages: ChatMessage[]
): string {
  const pool = RESPONSE_MAP[agent.id] ?? RESEARCH_RESPONSES;
  const topic = extractTopic(messages);

  // Pick a response based on conversation length for variety
  const index = messages.length % pool.length;
  return pool[index].replace(/\{topic\}/g, topic);
}
