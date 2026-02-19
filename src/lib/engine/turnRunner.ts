import type { AgentConfig } from "@/types/agent";
import type { ChatMessage, TurnMode } from "@/types/chat";
import { DEFAULT_TURN_ORDER, AGENTS, getAgentById } from "@/lib/agents";
import { generateMockResponse } from "./mockResponses";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface TurnCallbacks {
  getMessages: () => ChatMessage[];
  setThinking: (agent: AgentConfig) => void;
  appendToThinking: (agentId: string, chunk: string) => void;
  resolveThinking: (agentId: string, content: string) => void;
  setProcessing: (v: boolean) => void;
  advanceRoundRobin: () => void;
}

export interface TurnOptions {
  turnMode: TurnMode;
  roundRobinIndex: number;
  pingAgentId?: string;
}

/**
 * Resolve which agents respond this turn based on mode + optional ping.
 */
function resolveAgentOrder(options: TurnOptions): AgentConfig[] {
  const { turnMode, roundRobinIndex, pingAgentId } = options;

  // Ping always overrides in any mode
  if (pingAgentId) {
    const agent = getAgentById(pingAgentId);
    return agent ? [agent] : [];
  }

  switch (turnMode) {
    case "round-robin": {
      const agent = AGENTS[roundRobinIndex % AGENTS.length];
      return agent ? [agent] : [];
    }

    case "ceo-picks":
      // No ping was provided — return empty so BoardRoom can show a hint
      return [];

    case "default-order":
    default:
      return DEFAULT_TURN_ORDER.map((id) => getAgentById(id)).filter(
        (a): a is AgentConfig => a !== undefined
      );
  }
}

/**
 * Call /api/respond and stream the result back.
 * Returns true if successful, false if we should fall back to mock.
 */
async function streamFromApi(
  agent: AgentConfig,
  messages: ChatMessage[],
  callbacks: TurnCallbacks
): Promise<boolean> {
  try {
    const res = await fetch("/api/respond", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        provider: agent.provider,
        model: agent.model,
        systemPrompt: agent.systemPrompt,
        messages,
      }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      if (body?.fallback) return false;
      return false;
    }

    if (!res.body) return false;

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let fullText = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      fullText += chunk;
      callbacks.appendToThinking(agent.id, chunk);
    }

    callbacks.resolveThinking(agent.id, fullText);
    return true;
  } catch {
    return false;
  }
}

/**
 * Run a full turn: resolve agents based on mode, call API or fall back to mocks.
 * Returns "no-ping" if ceo-picks mode with no agent selected (caller should show hint).
 */
export async function runTurn(
  callbacks: TurnCallbacks,
  options: TurnOptions
): Promise<"ok" | "no-ping"> {
  const agents = resolveAgentOrder(options);

  if (agents.length === 0) {
    if (options.turnMode === "ceo-picks" && !options.pingAgentId) {
      return "no-ping";
    }
    return "ok";
  }

  callbacks.setProcessing(true);

  for (const agent of agents) {
    callbacks.setThinking(agent);

    const messages = callbacks.getMessages();
    const streamed = await streamFromApi(agent, messages, callbacks);

    if (!streamed) {
      await sleep(1200 + Math.random() * 1600);
      const mockMessages = callbacks.getMessages();
      const response = generateMockResponse(agent, mockMessages);
      callbacks.resolveThinking(agent.id, response);
    }

    if (agent !== agents[agents.length - 1]) {
      await sleep(400);
    }
  }

  // Advance round-robin pointer after the turn completes
  if (options.turnMode === "round-robin" && !options.pingAgentId) {
    callbacks.advanceRoundRobin();
  }

  callbacks.setProcessing(false);
  return "ok";
}
