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

    const { name, description, logoText, backgroundColor, logoUrl, stripImageFrontUrl, stripImageBackUrl, thumbnailUrl, backgroundUrl, primaryFieldLabel, primaryFieldValue, secondaryFieldLabel, secondaryFieldValue, auxiliaryFieldLabel, auxiliaryFieldValue, barcodeValue, barcodeFormat, url } = await req.json();

    if (!name || !description) {
        return NextResponse.json({ message: "Missing fields" }, { status: 400 });
    }

    const slug = nanoid(8);
    const serial = `pass-${Date.now()}`;

    try {
        // Load pass template
        const template = await Template.load(
            path.join(process.cwd(), "public/pass-models/generic.pass")
        );

        // Add logo if needed
        await template.images.add("logo", path.join(process.cwd(), "public/logo.png"), "1x");

        // Load cert and key from base64 env vars
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const cert = Buffer.from(process.env.PASS_CERT_PEM!, "base64").toString();
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const key = Buffer.from(process.env.PASS_KEY_PEM!, "base64").toString();

        template.setCertificate(cert);
        template.setPrivateKey(key, process.env.PASS_CERT_PASSPHRASE || "");

        const authenticationToken = nanoid(32); // or use UUID

        const pass = template.createPass({
            serialNumber: serial,
            description,
            webServiceURL: `${process.env.NEXT_PUBLIC_APP_URL}/api/passkit`,
            authenticationToken
        });
        
        pass.logoText = logoText;
        pass.backgroundColor = backgroundColor;

        pass.primaryFields.add({
            key: "name",
            label: "Name",
            value: name,
        });

        pass.secondaryFields.add({
            key: "desc",
            label: "Description",
            value: description,
        });

        pass.backFields.add({
            key: "message",
            label: "Message",
            value: "Welcome to your pass!", // This will later be dynamic
        });

        const buffer = await pass.asBuffer();

        // Upload to R2
        const fileUrl = await uploadPkpassToR2(buffer, `${slug}.pkpass`);

        // Save in DB
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
            stripImageFrontUrl,
            stripImageBackUrl,
            thumbnailUrl,
            backgroundUrl,
            primaryFieldLabel,
            primaryFieldValue,
            secondaryFieldLabel,
            secondaryFieldValue,
            auxiliaryFieldLabel,
            auxiliaryFieldValue,
            barcodeValue,
            barcodeFormat,
            url,
        });

        return new NextResponse(JSON.stringify({ url: fileUrl }), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
            },
        });
        // eslint-disable-next-line
    } catch (err: any) {
        console.error("Error creating pass:", err);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
