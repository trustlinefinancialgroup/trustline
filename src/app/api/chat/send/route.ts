import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

const COOKIE = "tl_chat";

export async function POST(req: Request) {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return NextResponse.json({ error: "no session" }, { status: 401 });

  const convo = await db.chatConversation.findUnique({ where: { visitorToken: token } });
  if (!convo) return NextResponse.json({ error: "not found" }, { status: 401 });

  const data = await req.json().catch(() => null);
  const body = String(data?.body ?? "").trim().slice(0, 2000);
  if (!body) return NextResponse.json({ error: "empty" }, { status: 400 });

  await db.chatMessage.create({ data: { conversationId: convo.id, sender: "VISITOR", body } });
  await db.chatConversation.update({
    where: { id: convo.id },
    data: { unreadForAdmin: true, lastMessageAt: new Date(), status: "OPEN" },
  });

  return NextResponse.json({ ok: true });
}
