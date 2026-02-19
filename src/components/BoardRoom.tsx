"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useChatStore } from "@/lib/chatStore";
import { runTurn } from "@/lib/engine/turnRunner";
import type { AgentConfig } from "@/types/agent";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import AgentStatus from "./AgentStatus";
import TurnModeSelector from "./TurnModeSelector";

export default function BoardRoom() {
  const messages = useChatStore((s) => s.messages);
  const addCeoMessage = useChatStore((s) => s.addCeoMessage);
  const isProcessing = useChatStore((s) => s.isProcessing);
  const turnMode = useChatStore((s) => s.turnMode);
  const reset = useChatStore((s) => s.reset);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [noPingHint, setNoPingHint] = useState(false);

  // Count CEO turns
  const turnCount = messages.filter((m) => m.role === "ceo").length;

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  // Clear no-ping hint after a short delay
  useEffect(() => {
    if (!noPingHint) return;
    const t = setTimeout(() => setNoPingHint(false), 3000);
    return () => clearTimeout(t);
  }, [noPingHint]);

  const handleSend = useCallback(
    async (content: string, pingAgentId?: string) => {
      setNoPingHint(false);
      addCeoMessage(content);

      const state = useChatStore.getState();
      const result = await runTurn(
        {
          getMessages: () => useChatStore.getState().messages,
          setThinking: (agent: AgentConfig) =>
            useChatStore
              .getState()
              .setThinking(agent.id, agent.name, agent.avatar, agent.color),
          appendToThinking: (agentId: string, chunk: string) =>
            useChatStore.getState().appendToThinking(agentId, chunk),
          resolveThinking: (agentId: string, response: string) =>
            useChatStore.getState().resolveThinking(agentId, response),
          setProcessing: (v: boolean) =>
            useChatStore.getState().setProcessing(v),
          advanceRoundRobin: () =>
            useChatStore.getState().advanceRoundRobin(),
        },
        {
          turnMode: state.turnMode,
          roundRobinIndex: state.roundRobinIndex,
          pingAgentId,
        }
      );

      if (result === "no-ping") {
        setNoPingHint(true);
      }
    },
    [addCeoMessage]
  );

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-zinc-100">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-lg font-bold">
            B
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight">BoardRoom</h1>
            <p className="text-xs text-zinc-500">
              Multi-agent strategy session
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <TurnModeSelector />

          {turnCount > 0 && (
            <span className="text-[11px] text-zinc-600 tabular-nums">
              {turnCount} turn{turnCount !== 1 ? "s" : ""}
            </span>
          )}

          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-600">
              {isProcessing ? "Agents discussing…" : "Awaiting CEO input"}
            </span>
            <div
              className={`w-2 h-2 rounded-full ${
                isProcessing ? "bg-amber-500 animate-pulse" : "bg-emerald-500"
              }`}
            />
          </div>

          {messages.length > 0 && (
            <button
              onClick={reset}
              disabled={isProcessing}
              className="text-[11px] px-2.5 py-1 rounded-md bg-zinc-800 text-zinc-500 hover:bg-red-900/40 hover:text-red-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              New Session
            </button>
          )}
        </div>
      </header>

      {/* Agent status bar */}
      <AgentStatus />

      {/* No-ping hint for ceo-picks mode */}
      {noPingHint && (
        <div className="px-6 py-2 bg-amber-900/20 border-b border-amber-800/30 text-amber-400 text-xs text-center">
          In CEO Picks mode, select an agent to ping before sending your message.
        </div>
      )}

      {/* Message list */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-6 py-4 space-y-4"
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-5xl mb-4">🏛️</div>
            <h2 className="text-xl font-semibold text-zinc-300 mb-2">
              Welcome to the BoardRoom
            </h2>
            <p className="text-sm text-zinc-500 max-w-md">
              You are the CEO. Set the agenda, ask a strategic question, or
              propose an idea. Your executive team will respond.
            </p>
            <p className="text-xs text-zinc-600 mt-3 max-w-sm">
              Tip: Use the ping buttons to direct a specific agent, or let all
              three respond in order (Research → Engineering → Product).
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
      </div>

      {/* Input */}
      <ChatInput
        onSend={handleSend}
        disabled={isProcessing}
        turnMode={turnMode}
      />
    </div>
  );
}
