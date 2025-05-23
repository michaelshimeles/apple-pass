import { db } from "@/db/drizzle";
import { passes } from "@/db/schema";
import { uploadPkpassToR2 } from "@/lib/r2"; // your R2 upload function
import { Template } from "@walletpass/pass-js";
import { nanoid } from "nanoid";
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { organizations } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";

export async function POST(req: NextRequest) {
  const result = await auth.api.getSession({
    headers: await headers(), // you need to pass the headers object.
  });

  if (!result?.session?.userId) {
    throw new Error("Unauthorized");
  }

  const {
    name,
    description,
    header_field_label,
    header_field_value,
    background_color,
    text_color,
    logo_url,
    strip_image,
    secondary_left_label,
    secondary_left_value,
    secondary_right_label,
    secondary_right_value,
    barcode_value,
    barcode_format,
    website_url,
  } = await req.json();

  if (!name || !description) {
    return NextResponse.json({ message: "Missing fields" }, { status: 400 });
  }

  const slug = nanoid(8);
  const serial = `pass-${Date.now()}`;

  try {
    // Load pass template
    const template = await Template.load(
      path.join(process.cwd(), "public/pass-models/storecard.pass"),
    );

    // --- Fetch and convert logo image ---
    let logoImageBuffer: Buffer;
    try {
      const imageResponse = await fetch(logo_url);
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
    let stripImageBuffer: Buffer;
    try {
      const imageResponse = await fetch(strip_image);
      if (!imageResponse.ok) {
        throw new Error(
          `Failed to fetch strip image: ${imageResponse.statusText}`,
        );
      }
      const arrayBuffer = await imageResponse.arrayBuffer();
      stripImageBuffer = Buffer.from(new Uint8Array(arrayBuffer)); // ✅ proper conversion
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
    await template.images.add("icon", logoImageBuffer, "1x");

    // Add strip image in both 1x and 2x densities
    await template.images.add("strip", stripImageBuffer, "1x");

    // Load cert and key from base64 env vars
    const cert = Buffer.from(process.env.PASS_CERT_PEM!, "base64").toString();
    const key = Buffer.from(process.env.PASS_KEY_PEM!, "base64").toString();

    template.setCertificate(cert);
    template.setPrivateKey(key, process.env.PASS_CERT_PASSPHRASE || "");

    const authenticationToken = nanoid(32);

    const pass = template.createPass({
      serialNumber: serial,
      description: name,
      organizationName: name,
      webServiceURL: `${process.env.NEXT_PUBLIC_APP_URL}/api/passkit`,
      authenticationToken,
      passTypeIdentifier: process.env.PASS_TYPE_IDENTIFIER,
    });

    // Set visual + dynamic fields
    pass.foregroundColor = text_color;
    pass.labelColor = text_color;
    pass.backgroundColor = background_color;

    if (barcode_format && barcode_value) {
      pass.barcodes = [
        {
          format: barcode_format,
          message: barcode_value,
          messageEncoding: "iso-8859-1",
        },
      ];
    }

    if (
      secondary_left_label &&
      secondary_left_value &&
      secondary_right_label &&
      secondary_right_value
    ) {
      pass.secondaryFields.add({
        key: secondary_left_label,
        label: secondary_left_label,
        value: secondary_left_value,
      });

      pass.secondaryFields.add({
        key: secondary_right_label,
        label: secondary_right_label,
        value: secondary_right_value,
      });
    }

    pass.backFields.add({
      key: "website",
      label: "Website",
      value: website_url,
    });

    pass.backFields.add({
      key: "description",
      label: "Description",
      value: description,
    });

    if (header_field_label && header_field_value) {
      pass.headerFields.add({
        key: header_field_label,
        label: header_field_label,
        value: header_field_value,
      });
    }

    const buffer = await pass.asBuffer();

    // Upload to R2
    const fileUrl = await uploadPkpassToR2(buffer, `${slug}.pkpass`);

    const passShareId = nanoid(12).toLowerCase();

    const result = await db
      .select()
      .from(organizations)
      .where(eq(organizations.admin_user_id, result.session.userId));

    // after fetching:
    const [org] = result;
    if (!org) {
      return NextResponse.json(
        { message: "Organization not found" },
        { status: 400 },
      );
    }

    // Save to DB
    await db.insert(passes).values({
      name,
      description,
      slug,
      serial_number: serial,
      file_url: fileUrl,
      user_id: result.session.userId,
      authentication_token: authenticationToken,
      text_color: text_color,
      background_color: background_color,
      logo_url: logo_url,
      website_url: website_url,
      strip_image: strip_image,
      secondary_left_label: secondary_left_label,
      secondary_left_value: secondary_left_value,
      secondary_right_label: secondary_right_label,
      secondary_right_value: secondary_right_value,
      header_field_label: header_field_label,
      header_field_value: header_field_value,
      barcode_value: barcode_value,
      barcode_format: barcode_format,
      pass_share_id: passShareId,
      organization_id: org.id,
    });

    return new NextResponse(JSON.stringify({ url: fileUrl }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (err: unknown) {
    console.log(err);
    return NextResponse.json(
      { message: (err as Error).message },
      { status: 500 },
    );
  }
}
