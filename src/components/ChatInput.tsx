"use client";

import { useState, useRef, useCallback } from "react";
import { AGENTS } from "@/lib/agents";

interface Props {
  onSend: (content: string, pingAgentId?: string) => void;
  disabled: boolean;
}

export default function ChatInput({ onSend, disabled }: Props) {
  const [text, setText] = useState("");
  const [pingTarget, setPingTarget] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

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

  return (
    <div className="border-t border-zinc-800 bg-zinc-950 p-4">
      {/* Ping agent selector */}
      <div className="flex gap-2 mb-2">
        <span className="text-xs text-zinc-500 self-center">Ping:</span>
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
        {AGENTS.map((agent) => (
          <button
            key={agent.id}
            onClick={() =>
              setPingTarget(pingTarget === agent.id ? null : agent.id)
            }
            className={`text-xs px-2 py-1 rounded-full transition-colors ${
              pingTarget === agent.id
                ? `${agent.color} text-white`
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            }`}
          >
            {agent.avatar} {agent.name}
          </button>
        ))}
      </div>

      {/* Input area */}
      <div className="flex gap-2">
        <textarea
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={
            disabled
              ? "Agents are discussing…"
              : "Set the agenda, ask a question, or direct an agent…"
          }
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
