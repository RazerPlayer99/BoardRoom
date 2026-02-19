"use client";

import { useState, useRef, useCallback } from "react";
import { AGENTS } from "@/lib/agents";
import { useChatStore } from "@/lib/chatStore";
import type { TurnMode } from "@/types/chat";

interface Props {
  onSend: (content: string, pingAgentId?: string) => void;
  disabled: boolean;
  turnMode: TurnMode;
}

export default function ChatInput({ onSend, disabled, turnMode }: Props) {
  const [text, setText] = useState("");
  const [pingTarget, setPingTarget] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const roundRobinIndex = useChatStore((s) => s.roundRobinIndex);

  const nextAgent =
    turnMode === "round-robin"
      ? AGENTS[roundRobinIndex % AGENTS.length]
      : null;

  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed, pingTarget ?? undefined);
    setText("");
    setPingTarget(null);
    inputRef.current?.focus();
  }, [text, pingTarget, onSend]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  function getPlaceholder(): string {
    if (disabled) return "Agents are discussing…";
    if (turnMode === "ceo-picks" && !pingTarget)
      return "Select an agent to ping, then type your message…";
    if (turnMode === "round-robin" && nextAgent)
      return `${nextAgent.avatar} ${nextAgent.name} is up next — type your message…`;
    return "Set the agenda, ask a question, or direct an agent…";
  }

  return (
    <div className="border-t border-zinc-800 bg-zinc-950 p-4">
      {/* Ping agent selector */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs text-zinc-500 self-center">
          {turnMode === "ceo-picks" ? "Pick:" : "Ping:"}
        </span>

        {turnMode !== "ceo-picks" && (
          <button
            onClick={() => setPingTarget(null)}
            className={`text-xs px-2 py-1 rounded-full transition-colors ${
              pingTarget === null
                ? "bg-zinc-700 text-white"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            }`}
          >
            Auto
          </button>
        )}

        {AGENTS.map((agent) => {
          const isSelected = pingTarget === agent.id;
          const isNextRR =
            turnMode === "round-robin" &&
            !pingTarget &&
            nextAgent?.id === agent.id;

          return (
            <button
              key={agent.id}
              onClick={() =>
                setPingTarget(isSelected ? null : agent.id)
              }
              className={`text-xs px-2 py-1 rounded-full transition-colors ${
                isSelected
                  ? `${agent.color} text-white`
                  : isNextRR
                    ? `${agent.color}/30 text-white ring-1 ring-white/20`
                    : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
              }`}
            >
              {agent.avatar} {agent.name}
              {isNextRR && " (next)"}
            </button>
          );
        })}
      </div>

      {/* Input area */}
      <div className="flex gap-2">
        <textarea
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={getPlaceholder()}
          rows={1}
          className="flex-1 bg-zinc-800 text-zinc-100 rounded-xl px-4 py-2.5 text-sm resize-none outline-none focus:ring-2 focus:ring-blue-600/50 placeholder-zinc-500 disabled:opacity-50"
        />
        <button
          onClick={handleSend}
          disabled={disabled || !text.trim()}
          className="px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Send
        </button>
      </div>
    </div>
  );
}
