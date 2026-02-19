"use client";

import { useEffect, useRef } from "react";
import { useChatStore } from "@/lib/chatStore";
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

  const handleSend = (content: string, _pingAgentId?: string) => {
    // Step 1: just add CEO message. No agent responses yet (Step 2+).
    addCeoMessage(content);
  };

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
        <div className="text-xs text-zinc-600">
          Step 1 — Chat Shell
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
