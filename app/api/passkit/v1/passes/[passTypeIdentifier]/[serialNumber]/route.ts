import { db } from "@/db/drizzle";
import { passMessages, passes } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { Template } from "@walletpass/pass-js";
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { Buffer } from "buffer";

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

export async function GET(
  req: NextRequest,
  context: {
    params: Promise<{
      passTypeIdentifier: string;
      serialNumber: string;
    }>;
  },
) {
  const { passTypeIdentifier, serialNumber } = await context.params;
  console.log(
    `🛬 Received GET /api/passkit/v1/passes/${passTypeIdentifier}/${serialNumber}`,
  );

  let pass;
  try {
    pass = await db
      .select()
      .from(passes)
      .where(eq(passes.serialNumber, serialNumber))
      .limit(1)
      .then((rows) => rows[0]);

    if (!pass) {
      console.warn(
        `❌ Pass not found in DB for serial: ${serialNumber} (passTypeIdentifier: ${passTypeIdentifier})`,
      );
      return NextResponse.json({ message: "Pass not found" }, { status: 404 });
    }

    console.log("📦 Found pass in DB:", {
      id: pass.id,
      name: pass.name,
      updatedAt: pass.updatedAt,
      serialNumber: pass.serialNumber,
    });
  } catch (dbError) {
    console.error("❌ Database error fetching pass:", dbError);
    return NextResponse.json(
      {
        message: "Database error fetching pass.",
        details: dbError instanceof Error ? dbError.message : String(dbError),
      },
      { status: 500 },
    );
  }

  let latestMessage;
  try {
    const messageRecord = await db
      .select({ message: passMessages.message })
      .from(passMessages)
      .where(eq(passMessages.passId, pass.id))
      .orderBy(desc(passMessages.createdAt))
      .limit(1)
      .then((rows) => rows[0]);

    latestMessage =
      messageRecord?.message ?? "Welcome to " + pass.name + "'s Apple Pass";
    console.log("💬 Latest message for pass:", latestMessage);
  } catch (dbError) {
    console.error("❌ Database error fetching latest message:", dbError);
    return NextResponse.json(
      {
        message: "Database error fetching pass message.",
        details: dbError instanceof Error ? dbError.message : String(dbError),
      },
      { status: 500 },
    );
  }

  const templatePath = path.join(
    process.cwd(),
    "public/pass-models/storecard.pass",
  );
  let template: Template;

  try {
    template = await Template.load(templatePath);
    console.log("🎟️ Pass template loaded successfully from:", templatePath);
  } catch (templateError) {
    console.error("❌ Error loading pass template:", templateError);
    return NextResponse.json(
      {
        message: "Failed to load pass template.",
        details:
          templateError instanceof Error
            ? templateError.message
            : String(templateError),
      },
      { status: 500 },
    );
  }

  try {
    const logoImageBuffer = await fetchImageBuffer(pass.logoUrl, "logo image");
    if (logoImageBuffer) {
      await template.images.add("logo", Buffer.from(logoImageBuffer), "1x");
    }

    const stripImageBuffer = await fetchImageBuffer(
      pass.stripImage,
      "strip image",
    );
    if (stripImageBuffer) {
      await template.images.add("strip", Buffer.from(stripImageBuffer), "1x");
    }
    console.log("🖼️ Images processed and added to template (if available).");
  } catch (imageError) {
    console.error("❌ Error processing images for pass:", imageError);
    return NextResponse.json(
      {
        message:
          "Failed to retrieve or process an image for the pass. Please ensure image URLs are valid and accessible.",
        details:
          imageError instanceof Error ? imageError.message : String(imageError),
      },
      { status: 500 },
    );
  }

  try {
    const certEnv = process.env.PASS_CERT_PEM;
    const keyEnv = process.env.PASS_KEY_PEM;
    const passphraseEnv = process.env.PASS_CERT_PASSPHRASE;

    if (!certEnv) {
      console.error(
        "❌ Missing pass certificate (PASS_CERT_PEM) in environment variables.",
      );
      throw new Error("Pass certificate not configured on the server.");
    }
    if (!keyEnv) {
      console.error(
        "❌ Missing pass private key (PASS_KEY_PEM) in environment variables.",
      );
      throw new Error("Pass private key not configured on the server.");
    }

    const cert = Buffer.from(certEnv, "base64").toString("utf-8");
    const key = Buffer.from(keyEnv, "base64").toString("utf-8");

    template.setCertificate(cert);
    template.setPrivateKey(key, passphraseEnv);
    console.log("🔐 Certificate and private key set successfully.");
  } catch (certError) {
    console.error("❌ Error setting certificate/key:", certError);
    const message =
      certError instanceof Error
        ? certError.message
        : "Certificate or key setup error.";
    return NextResponse.json(
      { message, details: String(certError) },
      { status: 500 },
    );
  }

  const instance = template.createPass({
    serialNumber: pass.serialNumber,
    description: pass.description,
    webServiceURL: `${process.env.NEXT_PUBLIC_APP_URL}/api/passkit`,
    authenticationToken: pass.authenticationToken,
    passTypeIdentifier,
  });

  if (pass.backgroundColor) {
    instance.backgroundColor = pass.backgroundColor;
  }

  if (pass.textColor) {
    instance.foregroundColor = pass.textColor;
    instance.labelColor = pass.textColor;
  }

  type PKBarcodeFormat =
    | "PKBarcodeFormatQR"
    | "PKBarcodeFormatPDF417"
    | "PKBarcodeFormatAztec"
    | "PKBarcodeFormatCode128";
  const validBarcodeFormats: PKBarcodeFormat[] = [
    "PKBarcodeFormatQR",
    "PKBarcodeFormatPDF417",
    "PKBarcodeFormatAztec",
    "PKBarcodeFormatCode128",
  ];

  // Primary & Secondary Field
  if (
    pass?.secondaryLeftLabel &&
    pass?.secondaryLeftValue &&
    pass.secondaryRightLabel &&
    pass.secondaryRightValue
  ) {
    instance.secondaryFields.add({
      key: pass?.secondaryLeftLabel,
      label: pass?.secondaryLeftLabel,
      value: pass?.secondaryLeftValue,
    });

    instance.secondaryFields.add({
      key: pass.secondaryRightLabel,
      label: pass.secondaryRightLabel,
      value: pass.secondaryRightValue,
    });
  }

  // Back fields
  instance.backFields.add({
    key: "website_link",
    label: "Website",
    value: pass.websiteUrl!,
  });

  instance.backFields.add({
    key: "msg",
    label: "Notification",
    value: latestMessage,
    changeMessage: "New message: %@",
  });

  // Header
  if (pass.headerFieldLabel && pass.headerFieldValue) {
    instance.headerFields.add({
      key: pass.headerFieldLabel,
      label: pass.headerFieldLabel,
      value: pass.headerFieldValue,
    });
  }

  // Barcode
  if (pass.barcodeFormat && pass.barcodeValue) {
    if (validBarcodeFormats.includes(pass.barcodeFormat as PKBarcodeFormat)) {
      instance.barcodes = [
        {
          format: pass.barcodeFormat as PKBarcodeFormat,
          message: pass.barcodeValue,
          messageEncoding: "iso-8859-1",
        },
      ];
    } else {
      console.warn(
        `⚠️ Invalid or unsupported barcode format: ${pass.barcodeFormat}. Barcode will not be added.`,
      );
    }
  }

  instance.relevantDate = pass.updatedAt
    ? new Date(pass.updatedAt).toISOString()
    : new Date().toISOString();
  console.log("🕒 Set relevantDate to:", instance.relevantDate);

  console.log(
    `🔁 Returning updated pass (Serial: ${pass.serialNumber}, Message: "${latestMessage}", RelevantDate: ${instance.relevantDate})`,
  );
  try {
    const buffer = await instance.asBuffer();
    console.log(
      "✅ Successfully generated .pkpass buffer (size):",
      buffer.byteLength,
    );

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.apple.pkpass",
        "Last-Modified": new Date(pass.updatedAt || Date.now()).toUTCString(),
        "Content-Disposition": `attachment; filename="${pass.serialNumber}.pkpass"`,
      },
    });
  } catch (bufferError) {
    console.error("❌ Error generating .pkpass buffer:", bufferError);
    return NextResponse.json(
      {
        message: "Failed to generate pass buffer.",
        details:
          bufferError instanceof Error
            ? bufferError.message
            : String(bufferError),
      },
      { status: 500 },
    );
  }
}
