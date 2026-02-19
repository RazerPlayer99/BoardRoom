import { NextRequest } from "next/server";
import { streamProviderResponse } from "@/lib/engine/providers";
import type { ChatMessage } from "@/types/chat";

interface RespondBody {
  provider: "openai" | "anthropic";
  model: string;
  systemPrompt: string;
  messages: ChatMessage[];
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as RespondBody;

  if (!body.provider || !body.model || !body.systemPrompt) {
    return new Response(
      JSON.stringify({ error: "Missing required fields" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // Check that we have the API key for the requested provider
  const keyVar =
    body.provider === "openai" ? "OPENAI_API_KEY" : "ANTHROPIC_API_KEY";
  if (!process.env[keyVar]) {
    return new Response(
      JSON.stringify({
        error: `Missing ${keyVar} — set it in .env.local`,
        fallback: true,
      }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const textStream = await streamProviderResponse({
      provider: body.provider,
      model: body.model,
      systemPrompt: body.systemPrompt,
      messages: body.messages,
    });

    // Convert string stream to byte stream for Response
    const encoder = new TextEncoder();
    const byteStream = textStream.pipeThrough(
      new TransformStream<string, Uint8Array>({
        transform(chunk, controller) {
          controller.enqueue(encoder.encode(chunk));
        },
      })
    );

    return new Response(byteStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "Cache-Control": "no-cache",
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Provider call failed";
    console.error(`[/api/respond] ${body.provider}/${body.model} error:`, err);
    return new Response(
      JSON.stringify({ error: message, fallback: true }),
      { status: 502, headers: { "Content-Type": "application/json" } }
    );
  }
}
