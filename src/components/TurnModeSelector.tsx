"use client";

import { useChatStore } from "@/lib/chatStore";
import type { TurnMode } from "@/types/chat";

const MODES: { value: TurnMode; label: string; description: string }[] = [
  {
    value: "default-order",
    label: "All Respond",
    description: "Research → Engineering → Product",
  },
  {
    value: "round-robin",
    label: "Round Robin",
    description: "One agent per turn, cycling",
  },
  {
    value: "ceo-picks",
    label: "CEO Picks",
    description: "Only the pinged agent responds",
  },
];

export default function TurnModeSelector() {
  const turnMode = useChatStore((s) => s.turnMode);
  const setTurnMode = useChatStore((s) => s.setTurnMode);
  const isProcessing = useChatStore((s) => s.isProcessing);

  return (
    <div className="flex items-center gap-1.5">
      {MODES.map((mode) => (
        <button
          key={mode.value}
          onClick={() => setTurnMode(mode.value)}
          disabled={isProcessing}
          title={mode.description}
          className={`text-[11px] px-2.5 py-1 rounded-md transition-colors ${
            turnMode === mode.value
              ? "bg-blue-600/80 text-white"
              : "bg-zinc-800 text-zinc-500 hover:bg-zinc-700 hover:text-zinc-300"
          } disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          {mode.label}
        </button>
      ))}
    </div>
  );
}
