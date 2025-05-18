import { db } from "@/db/drizzle";
import { passMessages, passRegistrations, passes } from "@/db/schema";
import { uploadPkpassToR2 } from "@/lib/r2";
import { sendPassPushNotification } from "@/lib/sendPushPass";
import { eq } from "drizzle-orm";
import { Template } from "@walletpass/pass-js";
import path from "path";
import { Buffer } from "buffer";

export async function POST(req: Request) {
  const {
    passId,
    message,
    textColor,
    backgroundColor,
    secondaryLeftLabel,
    secondaryLeftValue,
    secondaryRightLabel,
    secondaryRightValue,
    websiteUrl,
    description,
    headerFieldLabel,
    headerFieldValue,
    barcodeValue,
    barcodeFormat,
    logoUrl,
    stripImage,
  } = await req.json();

  if (!passId || !message) {
    return new Response("Missing fields", { status: 400 });
  }

  const pass = await db
    .select()
    .from(passes)
    .where(eq(passes.id, passId))
    .limit(1)
    .then((data) => data[0]);

  if (!pass) {
    return new Response("Pass not found", { status: 404 });
  }

  // Save the message
  await db.insert(passMessages).values({
    passId: pass.id,
    message,
  });

  await db
    .update(passes)
    .set({ updatedAt: new Date() })
    .where(eq(passes.id, pass.id));

  // Load pass template
  const template = await Template.load(
    path.join(process.cwd(), "public/pass-models/storecard.pass"),
  );

  const logoImageBuffer = await fetchImageBuffer(logoUrl, "logo image");
  const stripImageBuffer = await fetchImageBuffer(stripImage, "strip image");

  if (logoImageBuffer) {
    await template.images.add("logo", Buffer.from(logoImageBuffer), "1x");
    await template.images.add("icon", Buffer.from(logoImageBuffer), "1x");
  }

  if (stripImageBuffer) {
    await template.images.add("strip", Buffer.from(stripImageBuffer), "1x");
  }

  const cert = Buffer.from(process.env.PASS_CERT_PEM!, "base64").toString();
  const key = Buffer.from(process.env.PASS_KEY_PEM!, "base64").toString();

  template.setCertificate(cert);
  template.setPrivateKey(key, process.env.PASS_CERT_PASSPHRASE || "");

  // Create updated pass
  const passInstance = template.createPass({
    serialNumber: pass.serialNumber,
    description: pass.name,
    organizationName: pass.name,
    webServiceURL: `${process.env.NEXT_PUBLIC_APP_URL}/api/passkit`,
    authenticationToken: pass.authenticationToken,
  });

  console.log("💬 Updating message to:", message);

  // Set visual + dynamic fields
  passInstance.foregroundColor = textColor;
  passInstance.labelColor = textColor;
  passInstance.backgroundColor = backgroundColor;

  if (barcodeFormat && barcodeValue) {
    passInstance.barcodes = [
      {
        format: barcodeFormat,
        message: barcodeValue,
        messageEncoding: "iso-8859-1",
      },
    ];
  }

  if (
    secondaryLeftLabel &&
    secondaryLeftValue &&
    secondaryRightLabel &&
    secondaryRightValue
  ) {
    passInstance.secondaryFields.add({
      key: secondaryLeftLabel,
      label: secondaryLeftLabel,
      value: secondaryLeftValue,
    });

    passInstance.secondaryFields.add({
      key: secondaryRightLabel,
      label: secondaryRightLabel,
      value: secondaryRightValue,
    });
  }

  passInstance.backFields.add({
    key: "website",
    label: "Website",
    value: websiteUrl,
  });

  passInstance.backFields.add({
    key: "description",
    label: "Description",
    value: description,
  });

  if (headerFieldLabel && headerFieldValue) {
    passInstance.headerFields.add({
      key: headerFieldLabel,
      label: headerFieldLabel,
      value: headerFieldValue,
    });
  }

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

  console.log("📥 registration:", registration);

  if (!registration) {
    return new Response("No registered device for this pass", { status: 404 });
  }

  // Push silent update
  await sendPassPushNotification(
    process.env.PASS_TYPE_IDENTIFIER!,
    registration.pushToken,
  );

  return new Response(JSON.stringify({ fileUrl }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

async function fetchImageBuffer(
  imageUrl: string | null | undefined,
  imageName: string,
): Promise<ArrayBuffer | null> {
  if (!imageUrl) {
    console.warn(`⚠️ ${imageName} URL is missing or null.`);
    return null;
  }
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `❌ Failed to fetch ${imageName}. Status: ${response.status}, URL: ${imageUrl}, Response: ${errorText}`,
      );
      throw new Error(
        `Failed to fetch ${imageName} from ${imageUrl}: ${response.status} ${response.statusText}`,
      );
    }
    return await response.arrayBuffer();
  } catch (error) {
    console.error(
      `❌ General error fetching ${imageName} (URL: ${imageUrl}):`,
      error,
    );
    throw error;
  }
}
