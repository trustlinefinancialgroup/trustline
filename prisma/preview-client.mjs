// Throwaway preview client for UI checks. Never touches real accounts.
//   node --env-file=.env prisma/preview-client.mjs create
//   node --env-file=.env prisma/preview-client.mjs destroy
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { randomInt } from "crypto";

const db = new PrismaClient();
const EMAIL = "preview-check@trustline.local";
const APPLICANT = "preview-applicant@trustline.local";
const PASSWORD = "PreviewCheck123";
const mode = process.argv[2] ?? "create";

if (mode === "destroy") {
  const n = await db.user.deleteMany({ where: { email: { in: [EMAIL, APPLICANT] } } });
  console.log("removed:", n.count);
} else if (mode === "applicant") {
  // A verified-email applicant sitting on the identity step, for KYC checks.
  await db.user.deleteMany({ where: { email: APPLICANT } });
  const user = await db.user.create({
    data: {
      email: APPLICANT,
      passwordHash: await bcrypt.hash(PASSWORD, 10),
      firstName: "Preview",
      lastName: "Applicant",
      phone: "+10000000001",
      role: "CLIENT",
      status: "PENDING",
      emailVerified: true,
    },
  });
  console.log("applicant:", user.email, PASSWORD);
} else {
  await db.user.deleteMany({ where: { email: EMAIL } });
  const user = await db.user.create({
    data: {
      email: EMAIL,
      passwordHash: await bcrypt.hash(PASSWORD, 10),
      firstName: "Preview",
      lastName: "Check",
      phone: "+10000000000",
      role: "CLIENT",
      status: "ACTIVE",
      emailVerified: true,
    },
  });
  const account = await db.account.create({
    data: { userId: user.id, number: `TL-${randomInt(10_000_000, 100_000_000)}`, kind: "CHECKING" },
  });
  const now = new Date();
  const lastMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 12));
  await db.transaction.createMany({
    data: [
      {
        accountId: account.id,
        type: "DEPOSIT",
        status: "POSTED",
        amountCents: 250_000,
        reference: `TL-D-PREV${randomInt(1000, 9999)}`,
        note: "Opening deposit",
        postedAt: lastMonth,
        createdAt: lastMonth,
      },
      {
        accountId: account.id,
        type: "WITHDRAWAL",
        status: "POSTED",
        amountCents: -45_000,
        reference: `TL-W-PREV${randomInt(1000, 9999)}`,
        note: "Rent",
        postedAt: new Date(),
      },
    ],
  });
  console.log("created:", user.email, PASSWORD, account.number);
}
await db.$disconnect();
