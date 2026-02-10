import { createServerSupabaseClient } from "@/lib/server-utils";
import { generateResponse, type ChatMessage } from "@/lib/services/species-chat";
import { NextResponse } from "next/server";
import { z } from "zod";

const maxMessageLength = 4000;

const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(20000),
});

const bodySchema = z.object({
  message: z.string().min(1).max(maxMessageLength),
  history: z.array(chatMessageSchema).max(50).optional(),
});

export async function POST(request: Request) {
  const supabase = createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Missing or invalid 'message' field" }, { status: 400 });
  }

  const message = parsed.data.message.trim();
  if (message.length === 0) {
    return NextResponse.json({ error: "Message cannot be empty" }, { status: 400 });
  }

  const history: ChatMessage[] = parsed.data.history ?? [];
  const response = await generateResponse(message, history);
  return NextResponse.json({ response });
}
