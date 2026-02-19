import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import type { ChatMessage } from "@/types/chat";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY ?? "" });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY ?? "" });

interface ProviderCallParams {
  provider: "openai" | "anthropic";
  model: string;
  systemPrompt: string;
  messages: ChatMessage[];
}

/** Convert our ChatMessage[] into the format each provider expects */
function toOpenAIMessages(systemPrompt: string, messages: ChatMessage[]) {
  const formatted: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
  ];
  for (const m of messages) {
    formatted.push({
      role: m.role === "ceo" ? "user" : "assistant",
      content: m.content,
    });
  }
  return formatted;
}

function toAnthropicMessages(messages: ChatMessage[]) {
  const formatted: Anthropic.MessageParam[] = [];
  for (const m of messages) {
    formatted.push({
      role: m.role === "ceo" ? "user" : "assistant",
      content: m.content,
    });
  }
  return formatted;
}

/**
 * Stream a response from the configured provider.
 * Returns a ReadableStream of text chunks.
 */
export async function streamProviderResponse(
  params: ProviderCallParams
): Promise<ReadableStream<string>> {
  // Filter to only messages with content (skip thinking placeholders)
  const contentMessages = params.messages.filter((m) => m.content.length > 0);

  if (params.provider === "openai") {
    return streamOpenAI(params.model, params.systemPrompt, contentMessages);
  } else {
    return streamAnthropic(params.model, params.systemPrompt, contentMessages);
  }
}

async function streamOpenAI(
  model: string,
  systemPrompt: string,
  messages: ChatMessage[]
): Promise<ReadableStream<string>> {
  const stream = await openai.chat.completions.create({
    model,
    messages: toOpenAIMessages(systemPrompt, messages),
    stream: true,
    max_tokens: 1024,
  });

  return new ReadableStream<string>({
    async start(controller) {
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content;
        if (text) {
          controller.enqueue(text);
        }
      }
      controller.close();
    },
  });
}

async function streamAnthropic(
  model: string,
  systemPrompt: string,
  messages: ChatMessage[]
): Promise<ReadableStream<string>> {
  const stream = anthropic.messages.stream({
    model,
    system: systemPrompt,
    messages: toAnthropicMessages(messages),
    max_tokens: 1024,
  });

  return new ReadableStream<string>({
    async start(controller) {
      for await (const event of stream) {
        if (
          event.type === "content_block_delta" &&
          event.delta.type === "text_delta"
        ) {
          controller.enqueue(event.delta.text);
        }
      }
      controller.close();
    },
  });
}
