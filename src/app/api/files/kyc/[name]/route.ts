import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { db } from "@/lib/db";
import { getSession, isAdmin } from "@/lib/auth";

// Serves KYC uploads from the private uploads/ folder. Only admins and the
// document's owner may view a file.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  const session = await getSession();
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  const { name } = await params;
  // storedName is a hex string + extension; reject anything else to prevent
  // path traversal.
  if (!/^[a-f0-9]{32}\.[a-z0-9]{2,5}$/i.test(name)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const doc = await db.kycDocument.findFirst({ where: { storedName: name } });
  if (!doc) return new NextResponse("Not found", { status: 404 });

  if (!isAdmin(session.role) && doc.userId !== session.userId) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  try {
    const filePath = path.join(process.cwd(), "uploads", "kyc", name);
    const data = await readFile(filePath);
    return new NextResponse(new Uint8Array(data), {
      headers: {
        "Content-Type": doc.mimeType,
        "Content-Disposition": `inline; filename="${doc.fileName.replace(/[^\w.\- ]/g, "_")}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
