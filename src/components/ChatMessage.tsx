"use client";

import type { ChatMessage as ChatMessageType } from "@/types/chat";

interface Props {
  message: ChatMessageType;
}

export default function ChatMessage({ message }: Props) {
  const isCeo = message.role === "ceo";

  return (
    <div className={`flex gap-3 ${isCeo ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg ${message.color} text-white`}
      >
        {message.avatar}
      </div>

      {/* Bubble */}
      <div className={`max-w-[70%] ${isCeo ? "items-end" : "items-start"}`}>
        <div
          className={`text-xs font-medium mb-1 ${
            isCeo ? "text-right" : "text-left"
          } text-zinc-400`}
        >
          {message.agentName}
          {!isCeo && (
            <span className="ml-1 text-zinc-500 text-[10px]">
              ({message.agentId})
            </span>
          )}
        </div>

        <div
          className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
            isCeo
              ? "bg-blue-600 text-white rounded-tr-sm"
              : "bg-zinc-800 text-zinc-100 rounded-tl-sm"
          }`}
        >
          {message.isThinking ? (
            <div className="flex items-center gap-1.5">
              <span className="text-zinc-400">Thinking</span>
              <span className="flex gap-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:300ms]" />
              </span>
            </div>
          ) : (
            <p className="whitespace-pre-wrap">{message.content}</p>
          )}
        </div>
      </div>
    </div>
  );
}
