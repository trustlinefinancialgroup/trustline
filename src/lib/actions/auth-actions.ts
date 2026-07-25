"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { randomBytes } from "crypto";
import path from "path";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  createSession,
  destroySession,
  getSessionUser,
  hashPassword,
  verifyPassword,
  isAdmin,
} from "@/lib/auth";
import { audit } from "@/lib/audit";
import { sendWelcomeEmail, sendKycReceivedEmail } from "@/lib/email";
import { uploadFile, KYC_BUCKET } from "@/lib/storage";
import { getDict, getLocale } from "@/i18n/server";

export type FormState = { error?: string; ok?: string } | null;

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024; // 8 MB
const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const DOC_TYPES = ["GOVERNMENT_ID", "DRIVERS_LICENSE", "PASSPORT"] as const;

// ---------- signup ----------

export async function signupAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const t = await getDict();
  const locale = await getLocale();

  const schema = z.object({
    firstName: z.string().trim().min(1, t.errors.firstNameRequired).max(60),
    lastName: z.string().trim().min(1, t.errors.lastNameRequired).max(60),
    email: z.string().trim().toLowerCase().email(t.errors.emailInvalid),
    phone: z.string().trim().min(6, t.errors.phoneInvalid).max(20),
    password: z
      .string()
      .min(10, t.errors.passwordWeak)
      .regex(/[a-zA-Z]/, t.errors.passwordWeak)
      .regex(/[0-9]/, t.errors.passwordWeak),
  });

  const parsed = schema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }
  const data = parsed.data;

  const existing = await db.user.findUnique({ where: { email: data.email } });
  if (existing) {
    return { error: t.errors.emailExists };
  }

  const accountTypeRaw = String(formData.get("accountType") ?? "");
  const accountType = accountTypeRaw === "COMMERCIAL" ? "COMMERCIAL" : "PERSONAL";

  const passwordHash = await hashPassword(data.password);
  const verifyToken = randomBytes(32).toString("hex");

  const user = await db.user.create({
    data: {
      email: data.email,
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      accountType,
      locale,
      tokens: {
        create: {
          token: verifyToken,
          purpose: "EMAIL_VERIFY",
          expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 48), // 48h
        },
      },
    },
  });

  await audit({
    actorId: user.id,
    actorLabel: user.email,
    action: "USER_SIGNUP",
    targetType: "USER",
    targetId: user.id,
    details: `New client application: ${data.firstName} ${data.lastName}`,
  });

  await sendWelcomeEmail(user.email, user.firstName, verifyToken, locale);

  await createSession(user.id, user.role);
  redirect("/onboarding");
}

// ---------- resend verification email ----------

export async function resendVerificationAction(
  _prev: FormState,
  _formData: FormData
): Promise<FormState> {
  const t = await getDict();
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.emailVerified) return null;

  const lastToken = await db.verificationToken.findFirst({
    where: { userId: user.id, purpose: "EMAIL_VERIFY" },
    orderBy: { createdAt: "desc" },
  });
  if (lastToken && Date.now() - lastToken.createdAt.getTime() < 60_000) {
    return { error: t.onboarding.resendWait };
  }

  const verifyToken = randomBytes(32).toString("hex");
  await db.verificationToken.create({
    data: {
      userId: user.id,
      token: verifyToken,
      purpose: "EMAIL_VERIFY",
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 48),
    },
  });
  await sendWelcomeEmail(user.email, user.firstName, verifyToken, user.locale);
  return { ok: t.onboarding.resent };
}

// ---------- KYC submission (after email verification) ----------

export async function submitKycAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const t = await getDict();
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (!user.emailVerified || user.status !== "PENDING") redirect("/onboarding");

  const docTypeRaw = String(formData.get("docType") ?? "");
  const docType = (DOC_TYPES as readonly string[]).includes(docTypeRaw)
    ? docTypeRaw
    : "GOVERNMENT_ID";

  const file = formData.get("document");
  if (!(file instanceof File) || file.size === 0) {
    return { error: t.errors.needFile };
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return { error: t.errors.fileTooBig };
  }
  if (!ALLOWED_MIME.includes(file.type)) {
    return { error: t.errors.fileType };
  }

  const ext = path.extname(file.name).toLowerCase() || ".bin";
  const storedName = `${randomBytes(16).toString("hex")}${ext}`;
  await uploadFile(KYC_BUCKET, storedName, Buffer.from(await file.arrayBuffer()), file.type);

  await db.kycDocument.create({
    data: {
      userId: user.id,
      docType,
      fileName: file.name,
      storedName,
      mimeType: file.type,
      sizeBytes: file.size,
    },
  });

  await audit({
    actorId: user.id,
    actorLabel: user.email,
    action: "KYC_SUBMITTED",
    targetType: "USER",
    targetId: user.id,
    details: `Identity document submitted (${docType})`,
  });

  await sendKycReceivedEmail(user.email, user.firstName, user.locale);

  revalidatePath("/onboarding");
  return null;
}

// ---------- login / logout ----------

export async function loginAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const t = await getDict();

  const schema = z.object({
    email: z.string().trim().toLowerCase().email(t.errors.emailInvalid),
    password: z.string().min(1, t.errors.invalidCreds),
  });
  const parsed = schema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const user = await db.user.findUnique({ where: { email: parsed.data.email } });
  // Same message for unknown email and wrong password — don't leak which.
  if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    return { error: t.errors.invalidCreds };
  }

  if (user.status === "BLOCKED") return { error: t.errors.blocked };
  if (user.status === "REJECTED") return { error: t.errors.rejected };

  await createSession(user.id, user.role);
  await audit({
    actorId: user.id,
    actorLabel: user.email,
    action: "USER_LOGIN",
    targetType: "USER",
    targetId: user.id,
  });

  if (isAdmin(user.role)) redirect("/admin");
  if (user.status === "PENDING") redirect("/onboarding");
  redirect("/dashboard");
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}
