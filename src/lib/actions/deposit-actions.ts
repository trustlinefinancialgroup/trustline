"use server";

import { redirect } from "next/navigation";
import { randomBytes } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { audit } from "@/lib/audit";
import { ensureAccount, formatMoney, newReference } from "@/lib/bank";
import { sendDepositReceivedEmail } from "@/lib/email";
import { getDict } from "@/i18n/server";
import type { FormState } from "./auth-actions";

const UPLOAD_DIR = path.join(process.cwd(), "uploads", "deposits");
const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const MAX_AMOUNT_CENTS = 100_000_000; // $1,000,000

export async function submitDepositAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const t = await getDict();
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.status !== "ACTIVE" || user.role !== "CLIENT") redirect("/login");

  // Parse "12.34" or "12,34" into cents.
  const raw = String(formData.get("amount") ?? "").trim().replace(",", ".");
  const amount = Number(raw);
  const amountCents = Math.round(amount * 100);
  if (!raw || !Number.isFinite(amount) || amountCents <= 0 || amountCents > MAX_AMOUNT_CENTS) {
    return { error: t.bank.amountInvalid };
  }

  const note = String(formData.get("note") ?? "").trim().slice(0, 200) || null;

  // Proof is optional at submission — admins can credit without it and only
  // request proof when they can't match the payment (keeps storage lean).
  const file = formData.get("proof");
  let proof: { fileName: string; storedName: string; mimeType: string } | null = null;
  if (file instanceof File && file.size > 0) {
    if (file.size > MAX_UPLOAD_BYTES) {
      return { error: t.errors.fileTooBig };
    }
    if (!ALLOWED_MIME.includes(file.type)) {
      return { error: t.errors.fileType };
    }
    const ext = path.extname(file.name).toLowerCase() || ".bin";
    const storedName = `${randomBytes(16).toString("hex")}${ext}`;
    await mkdir(UPLOAD_DIR, { recursive: true });
    await writeFile(path.join(UPLOAD_DIR, storedName), Buffer.from(await file.arrayBuffer()));
    proof = { fileName: file.name, storedName, mimeType: file.type };
  }

  const account = await ensureAccount(user.id);
  const reference = newReference("D");

  await db.transaction.create({
    data: {
      accountId: account.id,
      type: "DEPOSIT",
      status: "PENDING",
      amountCents,
      reference,
      note,
      proofFileName: proof?.fileName,
      proofStoredName: proof?.storedName,
      proofMimeType: proof?.mimeType,
    },
  });

  await audit({
    actorId: user.id,
    actorLabel: user.email,
    action: "DEPOSIT_SUBMITTED",
    targetType: "TRANSACTION",
    targetId: reference,
    details: `${user.email} submitted a deposit of ${formatMoney(amountCents)} (${reference})`,
  });

  await sendDepositReceivedEmail(
    user.email,
    user.firstName,
    user.locale,
    formatMoney(amountCents, user.locale),
    reference
  );

  redirect("/dashboard?submitted=1");
}
