"use client";

import { useEffect, useRef, useCallback } from "react";
import { useChatStore } from "@/lib/chatStore";
import { runTurn } from "@/lib/engine/turnRunner";
import type { AgentConfig } from "@/types/agent";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import AgentStatus from "./AgentStatus";

export default function BoardRoom() {
  const messages = useChatStore((s) => s.messages);
  const addCeoMessage = useChatStore((s) => s.addCeoMessage);
  const isProcessing = useChatStore((s) => s.isProcessing);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const handleSend = useCallback(
    async (content: string, pingAgentId?: string) => {
      addCeoMessage(content);

      // Kick off the turn — agents respond sequentially
      await runTurn(
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
        },
        pingAgentId
      );
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
        <div className="flex items-center gap-3">
          <span className="text-xs text-zinc-600">
            {isProcessing ? "Agents discussing…" : "Awaiting CEO input"}
          </span>
          <div
            className={`w-2 h-2 rounded-full ${
              isProcessing ? "bg-amber-500 animate-pulse" : "bg-emerald-500"
            }`}
          />
        </div>
      </header>

      {/* Agent status bar */}
      <AgentStatus />

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
      <ChatInput onSend={handleSend} disabled={isProcessing} />
    </div>
  );
}
