import type { AgentConfig } from "@/types/agent";
import type { ChatMessage } from "@/types/chat";
import { DEFAULT_TURN_ORDER, getAgentById } from "@/lib/agents";
import { generateMockResponse } from "./mockResponses";

/** Simulated thinking delay (ms) — gives a natural pacing feel */
const THINKING_DELAY_MIN = 1200;
const THINKING_DELAY_MAX = 2800;

function randomDelay(): number {
  return (
    THINKING_DELAY_MIN +
    Math.random() * (THINKING_DELAY_MAX - THINKING_DELAY_MIN)
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface TurnCallbacks {
  /** Get current messages snapshot */
  getMessages: () => ChatMessage[];
  /** Show "Thinking…" for this agent */
  setThinking: (agent: AgentConfig) => void;
  /** Replace "Thinking…" with actual response */
  resolveThinking: (agentId: string, content: string) => void;
  /** Mark turn processing as started/finished */
  setProcessing: (v: boolean) => void;
}

/**
 * Resolves the ordered list of agents to invoke this turn.
 * - If pingAgentId is set, only that agent responds.
 * - Otherwise, uses the default order: Research → Engineering → Product.
 */
function resolveAgentOrder(pingAgentId?: string): AgentConfig[] {
  if (pingAgentId) {
    const agent = getAgentById(pingAgentId);
    return agent ? [agent] : [];
  }
  return DEFAULT_TURN_ORDER.map((id) => getAgentById(id)).filter(
    (a): a is AgentConfig => a !== undefined
  );
}

/**
 * Run a full turn: sequence through agents one at a time.
 * Each agent sees the "Thinking…" state, then its mock response replaces it.
 *
 * In Step 3, the mock response will be swapped for a real API call.
 */
export async function runTurn(
  callbacks: TurnCallbacks,
  pingAgentId?: string
): Promise<void> {
  const agents = resolveAgentOrder(pingAgentId);
  if (agents.length === 0) return;

  callbacks.setProcessing(true);

  for (const agent of agents) {
    // Show thinking indicator
    callbacks.setThinking(agent);

    // Simulate thinking time
    await sleep(randomDelay());

    // Generate mock response using current conversation state
    const messages = callbacks.getMessages();
    const response = generateMockResponse(agent, messages);

    // Replace thinking with actual response
    callbacks.resolveThinking(agent.id, response);

    // Small gap between agents for natural pacing
    if (agent !== agents[agents.length - 1]) {
      await sleep(400);
    }
  }

  callbacks.setProcessing(false);
}
