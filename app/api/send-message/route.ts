import { db } from "@/db/drizzle";
import { passMessages, passRegistrations, passes } from "@/db/schema";
import { uploadPkpassToR2 } from "@/lib/r2";
import { sendPassPushNotification } from "@/lib/sendPushPass";
import { eq } from "drizzle-orm";
import { Template } from "@walletpass/pass-js";
import path from "path";
import { Buffer } from "buffer";

export async function POST(req: Request) {
  const { passId, message } = await req.json();

  if (!passId || !message) {
    return new Response("Missing fields", { status: 400 });
  }

  const pass = await db.select().from(passes).where(eq(passes.id, passId)).limit(1).then((data) => data[0]);

  if (!pass) {
    return new Response("Pass not found", { status: 404 });
  }

  // Save the message
  await db.insert(passMessages).values({
    passId: pass.id,
    message,
  });

  await db.update(passes)
    .set({ updatedAt: new Date() })
    .where(eq(passes.id, pass.id));


  // Load pass template
  const template = await Template.load(path.join(process.cwd(), "public/pass-models/generic.pass"));
  await template.images.add("logo", path.join(process.cwd(), "public/logo.png"), "1x");

  const cert = Buffer.from(process.env.PASS_CERT_PEM!, "base64").toString();
  const key = Buffer.from(process.env.PASS_KEY_PEM!, "base64").toString();

  template.setCertificate(cert);
  template.setPrivateKey(key, process.env.PASS_CERT_PASSPHRASE || "");

  // Create updated pass
  const passInstance = template.createPass({
    serialNumber: pass.serialNumber,
    description: pass.description,
    webServiceURL: `${process.env.NEXT_PUBLIC_APP_URL}/api/passkit`,
    authenticationToken: pass.authenticationToken,
  });

  passInstance.primaryFields.add({
    key: "name",
    label: "Name",
    value: pass.name,
  });

  console.log("💬 Updating message to:", message);
  passInstance.secondaryFields.add({
    key: "msg",
    label: "Message",
    value: message,
  });

  passInstance.relevantDate = new Date().toISOString();

  const buffer = await passInstance.asBuffer();
  const fileUrl = await uploadPkpassToR2(buffer, `${pass.slug}.pkpass`);

  console.log("📦 Pass buffer size:", buffer.byteLength);

  const registration = await db
    .select()
    .from(passRegistrations)
    .where(eq(passRegistrations.passId, pass.id))
    .limit(1)
    .then((r) => r[0]);

  if (!registration) {
    return new Response("No registered device for this pass", { status: 404 });
  }

  // Push silent update
  await sendPassPushNotification(process.env.PASS_TYPE_IDENTIFIER!, registration.pushToken);

  return new Response(JSON.stringify({ fileUrl }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
