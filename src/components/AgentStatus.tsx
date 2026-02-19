"use client";

import { AGENTS } from "@/lib/agents";
import { useChatStore } from "@/lib/chatStore";

export default function AgentStatus() {
  const activeAgentId = useChatStore((s) => s.activeAgentId);

  return (
    <div className="flex gap-3 px-4 py-3 border-b border-zinc-800 bg-zinc-950/50">
      {AGENTS.map((agent) => {
        const isActive = activeAgentId === agent.id;
        return (
          <div
            key={agent.id}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs transition-all ${
              isActive
                ? `${agent.color} text-white shadow-lg`
                : "bg-zinc-800/50 text-zinc-400"
            }`}
          >
            <span>{agent.avatar}</span>
            <span className="font-medium">{agent.name}</span>
            <span className="text-[10px] opacity-70">{agent.role}</span>
            {isActive && (
              <span className="ml-1 w-2 h-2 rounded-full bg-white/80 animate-pulse" />
            )}
          </div>
        );
      })}
    </div>
  );
}
