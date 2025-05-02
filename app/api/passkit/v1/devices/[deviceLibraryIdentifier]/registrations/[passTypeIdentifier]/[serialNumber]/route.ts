// app/api/passkit/v1/passes/[passTypeIdentifier]/[serialNumber]/route.ts

import { db } from "@/db/drizzle";
import { passMessages, passes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Template } from "@walletpass/pass-js";
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { Buffer } from "buffer";

export async function GET(
  req: NextRequest,
  context: {
    params: {
      passTypeIdentifier: string;
      serialNumber: string;
    };
  }
) {
  const { passTypeIdentifier, serialNumber } = context.params;

  // 🧠 Step 1: Get pass by serial
  const pass = await db
    .select()
    .from(passes)
    .where(eq(passes.serialNumber, serialNumber))
    .limit(1)
    .then((rows) => rows[0]);

  if (!pass) {
    return new NextResponse("Pass not found", { status: 404 });
  }

  // 📩 Step 2: Get the latest message
  const latestMessage = await db
    .select()
    .from(passMessages)
    .where(eq(passMessages.passId, pass.id))
    .orderBy(passMessages.createdAt)
    .then((rows) => rows.at(-1)?.message ?? "No messages yet");

  // 🧱 Step 3: Load & build the updated pass
  const template = new Template();
  await template.images.add("logo", path.join(process.cwd(), "public/logo.png"), "1x");

  const cert = Buffer.from(process.env.PASS_CERT_PEM!, "base64").toString();
  const key = Buffer.from(process.env.PASS_KEY_PEM!, "base64").toString();

  template.setCertificate(cert);
  template.setPrivateKey(key, process.env.PASS_CERT_PASSPHRASE || "");

  const instance = template.createPass({
    serialNumber: pass.serialNumber,
    description: pass.description,
    webServiceURL: `${process.env.NEXT_PUBLIC_APP_URL}/api/passkit`,
    authenticationToken: pass.authenticationToken,
    organizationName: "Fabrika",
    teamIdentifier: "5S3KCRYBD2",
    passTypeIdentifier: passTypeIdentifier,
    style: "generic",
  });

  instance.primaryFields.add({
    key: "name",
    label: "Name",
    value: pass.name,
  });

  instance.secondaryFields.add({
    key: "msg",
    label: "Message",
    value: latestMessage,
  });

  const buffer = await instance.asBuffer();

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.apple.pkpass",
      "Content-Disposition": `attachment; filename=${pass.serialNumber}.pkpass`,
    },
  });
}