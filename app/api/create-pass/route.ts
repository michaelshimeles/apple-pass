import { db } from "@/db/drizzle";
import { passes } from "@/db/schema";
import { uploadPkpassToR2 } from "@/lib/r2"; // your R2 upload function
import { auth, currentUser } from "@clerk/nextjs/server";
import { Template } from "@walletpass/pass-js";
import { nanoid } from "nanoid";
import { NextRequest, NextResponse } from "next/server";
import path from "path";

export async function POST(req: NextRequest) {
  await auth.protect();
  const user = await currentUser();

  if (!user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const {
    name,
    description,
    logoText,
    headerFieldLabel,
    headerFieldValue,
    backgroundColor,
    logoUrl,
    thumbnail,
    backgroundUrl,
    primaryFieldLabel,
    primaryFieldValue,
    secondaryFieldLabel,
    secondaryFieldValue,
    auxiliaryFieldLabel,
    auxiliaryFieldValue,
    barcodeValue,
    barcodeFormat,
  } = await req.json();

  if (!name || !description) {
    return NextResponse.json({ message: "Missing fields" }, { status: 400 });
  }

  const slug = nanoid(8);
  const serial = `pass-${Date.now()}`;

  try {
    // Load pass template
    const template = await Template.load(
      path.join(process.cwd(), "public/pass-models/generic.pass"),
    );

    // --- Fetch and convert logo image ---
    let logoImageBuffer: Buffer;
    try {
      const imageResponse = await fetch(logoUrl);
      if (!imageResponse.ok) {
        throw new Error(
          `Failed to fetch logo image: ${imageResponse.statusText}`,
        );
      }
      const arrayBuffer = await imageResponse.arrayBuffer();
      logoImageBuffer = Buffer.from(new Uint8Array(arrayBuffer)); // ✅ proper conversion
    } catch (error) {
      return NextResponse.json(
        {
          message:
            "Failed to retrieve logo image. Please ensure the URL is valid and accessible.",
          details: error instanceof Error ? error.message : String(error),
        },
        { status: 500 },
      );
    }

    // --- Fetch and convert strip image ---
    let thumbnailBuffer: Buffer;
    try {
      const imageResponse = await fetch(thumbnail);
      if (!imageResponse.ok) {
        throw new Error(
          `Failed to fetch strip image: ${imageResponse.statusText}`,
        );
      }
      const arrayBuffer = await imageResponse.arrayBuffer();
      thumbnailBuffer = Buffer.from(new Uint8Array(arrayBuffer)); // ✅ proper conversion
    } catch (error) {
      return NextResponse.json(
        {
          message:
            "Failed to retrieve strip image. Please ensure the URL is valid and accessible.",
          details: error instanceof Error ? error.message : String(error),
        },
        { status: 500 },
      );
    }

    // Add images to template
    await template.images.add("logo", logoImageBuffer, "1x");
    await template.images.add("thumbnail", thumbnailBuffer, "1x");

    // Load cert and key from base64 env vars
    const cert = Buffer.from(process.env.PASS_CERT_PEM!, "base64").toString();
    const key = Buffer.from(process.env.PASS_KEY_PEM!, "base64").toString();

    template.setCertificate(cert);
    template.setPrivateKey(key, process.env.PASS_CERT_PASSPHRASE || "");

    const authenticationToken = nanoid(32);

    const pass = template.createPass({
      serialNumber: serial,
      description,
      webServiceURL: `${process.env.NEXT_PUBLIC_APP_URL}/api/passkit`,
      authenticationToken,
      passTypeIdentifier: process.env.PASS_TYPE_IDENTIFIER,
    });

    // Set visual + dynamic fields
    pass.logoText = logoText;
    pass.backgroundColor = backgroundColor;

    if (barcodeFormat && barcodeValue) {
      pass.barcodes = [
        {
          format: barcodeFormat,
          message: barcodeValue,
          messageEncoding: "iso-8859-1",
        },
      ];
    }

    pass.primaryFields.add({
      key: primaryFieldLabel,
      label: primaryFieldLabel,
      value: primaryFieldValue,
    });

    if (secondaryFieldLabel && secondaryFieldValue) {
      pass.secondaryFields.add({
        key: secondaryFieldLabel + "_mike",
        label: secondaryFieldLabel + "_mike",
        value: secondaryFieldValue + "_mike",
      });

      pass.secondaryFields.add({
        key: secondaryFieldLabel,
        label: secondaryFieldLabel,
        value: secondaryFieldValue,
      });
    }

    pass.backFields.add({
      key: "website",
      label: "Check my website",
      value: "https://www.rasmic.xyz",
    });

    if (auxiliaryFieldLabel && auxiliaryFieldValue) {
      pass.auxiliaryFields.add({
        key: auxiliaryFieldLabel,
        label: auxiliaryFieldLabel,
        value: auxiliaryFieldValue,
      });

      pass.auxiliaryFields.add({
        key: auxiliaryFieldLabel + "_mike",
        label: auxiliaryFieldLabel + "_mike",
        value: auxiliaryFieldValue + "_mike",
      });
    }

    if (headerFieldLabel && headerFieldValue) {
      pass.headerFields.add({
        key: headerFieldLabel,
        label: headerFieldLabel,
        value: headerFieldValue,
      });
    }

    const buffer = await pass.asBuffer();

    // Upload to R2
    const fileUrl = await uploadPkpassToR2(buffer, `${slug}.pkpass`);

    const passShareId = nanoid(12).toLowerCase();

    // Save to DB
    await db.insert(passes).values({
      name,
      description,
      slug,
      serialNumber: serial,
      fileUrl,
      userId: user.id,
      authenticationToken,
      logoText,
      backgroundColor,
      logoUrl,
      thumbnailUrl: thumbnail,
      backgroundUrl,
      primaryFieldLabel,
      primaryFieldValue,
      secondaryFieldLabel,
      secondaryFieldValue,
      auxiliaryFieldLabel,
      auxiliaryFieldValue,
      headerFieldLabel,
      headerFieldValue,
      barcodeValue,
      barcodeFormat,
      passShareId,
    });

    return new NextResponse(JSON.stringify({ url: fileUrl }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (err: unknown) {
    console.error("Error creating pass:", err);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
