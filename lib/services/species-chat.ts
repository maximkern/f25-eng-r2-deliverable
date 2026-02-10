import { z } from "zod";

const apiUrl = "https://g4f.space/api/groq/chat/completions";
const model = "openai/gpt-oss-120b";

const systemPrompt =
  "You are a quirky, enthusiastic species and animal expert who gets genuinely excited about cool animal facts. Sprinkle in fun tidbits and share your passion, but keep things concise. Only answer questions about animals, species, habitats, diets, conservation status, and related biological topics. If someone asks about something unrelated, playfully steer them back to the animal kingdom. Respond in plain text paragraphs only. Do not use markdown, bullet points, numbered lists, tables, or any special formatting.";

const chatResponseSchema = z.object({
  choices: z
    .array(
      z.object({
        message: z.object({
          content: z.string(),
        }),
      }),
    )
    .min(1),
});

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function generateResponse(message: string, history: ChatMessage[] = []): Promise<string> {
  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages: [{ role: "system", content: systemPrompt }, ...history, { role: "user", content: message }],
      }),
      signal: AbortSignal.timeout(60000),
    });

    if (!response.ok) {
      return "Sorry, I couldn't process your request. Please try again.";
    }

    const json: unknown = await response.json();
    const result = chatResponseSchema.safeParse(json);

    if (!result.success) {
      return "Sorry, I received an unexpected response. Please try again.";
    }

    const content = result.data.choices[0]?.message.content;
    return content ?? "Sorry, I received an empty response. Please try again.";
  } catch {
    return "Sorry, I couldn't connect to the service. Please try again.";
  }
}
