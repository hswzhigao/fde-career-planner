import { chatStream } from "./client";

/**
 * Run an AI prompt with streaming, returning a ReadableStream for the HTTP response.
 * Saves the full result to ai_summaries after completion.
 */
export async function runStreamingAI(
  systemPrompt: string,
  userPrompt: string,
  summaryType: string,
  relatedId?: number,
  onComplete?: (full: string) => Promise<void>,
): Promise<ReadableStream<Uint8Array>> {
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      try {
        const { full } = await chatStream(systemPrompt, userPrompt, (delta, accumulated) => {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "delta", delta, accumulated })}\n\n`),
          );
        });

        // Save to DB
        if (onComplete) {
          await onComplete(full);
        }

        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: "done", full })}\n\n`),
        );
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Unknown error";
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: "error", error: msg })}\n\n`),
        );
      } finally {
        controller.close();
      }
    },
  });
}
