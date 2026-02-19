import type { AgentConfig } from "@/types/agent";
import type { ChatMessage } from "@/types/chat";
import { DEFAULT_TURN_ORDER, getAgentById } from "@/lib/agents";
import { generateMockResponse } from "./mockResponses";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface TurnCallbacks {
  /** Get current messages snapshot */
  getMessages: () => ChatMessage[];
  /** Show "Thinking…" for this agent */
  setThinking: (agent: AgentConfig) => void;
  /** Append a streaming text chunk to the thinking message */
  appendToThinking: (agentId: string, chunk: string) => void;
  /** Replace "Thinking…" with actual response (used for mock fallback) */
  resolveThinking: (agentId: string, content: string) => void;
  /** Mark turn processing as started/finished */
  setProcessing: (v: boolean) => void;
}

/**
 * Resolves the ordered list of agents to invoke this turn.
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

    // If the API signals a fallback (missing key, provider error), use mocks
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      if (body?.fallback) return false;
      // Unexpected error — still fall back gracefully
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

    // Finalize — set the final id and clear activeAgent
    callbacks.resolveThinking(agent.id, fullText);
    return true;
  } catch {
    return false;
  }
}

/**
 * Run a full turn: sequence through agents one at a time.
 * Tries real API streaming first, falls back to mock responses.
 */
export async function runTurn(
  callbacks: TurnCallbacks,
  pingAgentId?: string
): Promise<void> {
  const agents = resolveAgentOrder(pingAgentId);
  if (agents.length === 0) return;

  callbacks.setProcessing(true);

  for (const agent of agents) {
    callbacks.setThinking(agent);

    const messages = callbacks.getMessages();
    const streamed = await streamFromApi(agent, messages, callbacks);

    if (!streamed) {
      // Fallback: simulate a delay then use mock response
      await sleep(1200 + Math.random() * 1600);
      const mockMessages = callbacks.getMessages();
      const response = generateMockResponse(agent, mockMessages);
      callbacks.resolveThinking(agent.id, response);
    }

    // Small gap between agents
    if (agent !== agents[agents.length - 1]) {
      await sleep(400);
    }
  }

  callbacks.setProcessing(false);
}
