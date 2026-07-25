import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomBytes } from "crypto";
import { db } from "@/lib/db";

const COOKIE = "tl_chat";

export async function POST(req: Request) {
  const data = await req.json().catch(() => null);
  if (!data) return NextResponse.json({ error: "bad request" }, { status: 400 });

  const name = String(data.name ?? "").trim().slice(0, 80);
  const phone = String(data.phone ?? "").trim().slice(0, 40) || null;
  const email = String(data.email ?? "").trim().slice(0, 120) || null;
  const cardLast4 = String(data.cardLast4 ?? "").replace(/\D/g, "").slice(0, 4) || null;
  const message = String(data.message ?? "").trim().slice(0, 2000);

  if (!name || !message) return NextResponse.json({ error: "missing" }, { status: 400 });
  if (!email && !cardLast4) return NextResponse.json({ error: "contact" }, { status: 400 });

  const visitorToken = randomBytes(24).toString("hex");
  await db.chatConversation.create({
    data: {
      visitorToken,
      name,
      phone,
      email,
      cardLast4,
      unreadForAdmin: true,
      lastMessageAt: new Date(),
      messages: { create: { sender: "VISITOR", body: message } },
    },
  });

  const jar = await cookies();
  jar.set(COOKIE, visitorToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return NextResponse.json({ ok: true });
}
