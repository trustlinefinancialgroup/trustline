import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

const COOKIE = "tl_chat";

export async function GET() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return NextResponse.json({ conversation: null, messages: [] });

  const convo = await db.chatConversation.findUnique({
    where: { visitorToken: token },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });
  if (!convo) return NextResponse.json({ conversation: null, messages: [] });

  return NextResponse.json({
    conversation: { status: convo.status },
    messages: convo.messages.map((m) => ({
      sender: m.sender,
      body: m.body,
      at: m.createdAt.toISOString(),
    })),
  });
}
