import { create } from "zustand";
import type { ChatMessage, TurnMode } from "@/types/chat";
import { CEO_AGENT, AGENTS } from "./agents";

let messageCounter = 0;
function nextId(): string {
  return `msg-${++messageCounter}-${Date.now()}`;
}

interface ChatState {
  messages: ChatMessage[];
  turnMode: TurnMode;
  activeAgentId: string | null; // who is currently "thinking"
  isProcessing: boolean; // is a turn in progress
  roundRobinIndex: number; // tracks next agent for round-robin mode

  // Actions
  addCeoMessage: (content: string) => void;
  addAgentMessage: (agentId: string, agentName: string, avatar: string, color: string, content: string) => void;
  setThinking: (agentId: string, agentName: string, avatar: string, color: string) => void;
  appendToThinking: (agentId: string, chunk: string) => void;
  resolveThinking: (agentId: string, content: string) => void;
  setTurnMode: (mode: TurnMode) => void;
  setProcessing: (v: boolean) => void;
  advanceRoundRobin: () => void;
  reset: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  turnMode: "default-order",
  activeAgentId: null,
  isProcessing: false,
  roundRobinIndex: 0,

  addCeoMessage: (content) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          id: nextId(),
          role: "ceo",
          agentId: CEO_AGENT.id,
          agentName: CEO_AGENT.name,
          avatar: CEO_AGENT.avatar,
          color: CEO_AGENT.color,
          content,
          timestamp: Date.now(),
        },
      ],
    })),

  addAgentMessage: (agentId, agentName, avatar, color, content) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          id: nextId(),
          role: "agent",
          agentId,
          agentName,
          avatar,
          color,
          content,
          timestamp: Date.now(),
        },
      ],
    })),

  setThinking: (agentId, agentName, avatar, color) =>
    set((state) => ({
      activeAgentId: agentId,
      messages: [
        ...state.messages,
        {
          id: `thinking-${agentId}`,
          role: "agent",
          agentId,
          agentName,
          avatar,
          color,
          content: "",
          timestamp: Date.now(),
          isThinking: true,
        },
      ],
    })),

  appendToThinking: (agentId, chunk) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === `thinking-${agentId}`
          ? { ...m, content: m.content + chunk, isThinking: false }
          : m
      ),
    })),

  resolveThinking: (agentId, content) =>
    set((state) => ({
      activeAgentId: null,
      messages: state.messages.map((m) =>
        m.id === `thinking-${agentId}`
          ? { ...m, content, isThinking: false, id: nextId() }
          : m
      ),
    })),

  setTurnMode: (mode) => set({ turnMode: mode, roundRobinIndex: 0 }),
  setProcessing: (v) => set({ isProcessing: v }),
  advanceRoundRobin: () =>
    set((state) => ({
      roundRobinIndex: (state.roundRobinIndex + 1) % AGENTS.length,
    })),
  reset: () =>
    set({
      messages: [],
      activeAgentId: null,
      isProcessing: false,
      turnMode: "default-order",
      roundRobinIndex: 0,
    }),
}));
