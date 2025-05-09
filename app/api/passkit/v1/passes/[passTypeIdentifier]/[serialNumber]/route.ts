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
        params: Promise<{
            passTypeIdentifier: string;
            serialNumber: string;
        }>;
    }
) {
    
    const { passTypeIdentifier, serialNumber } = await context.params;
    console.log("📥 Apple requested updated pass for:", passTypeIdentifier, serialNumber);
    console.log("🛬 Received GET /passes");
    console.log("🔍 Params:", { passTypeIdentifier, serialNumber });

    const pass = await db
        .select()
        .from(passes)
        .where(eq(passes.serialNumber, serialNumber))
        .limit(1)
        .then((rows) => rows[0]);

    if (!pass) {
        console.warn("❌ Pass not found in DB for serial:", serialNumber);
        return new NextResponse("Pass not found", { status: 404 });
    }

    console.log("📦 Found pass in DB:", {
        name: pass.name,
        description: pass.description,
        updatedAt: pass.updatedAt,
    });

    const latestMessage = await db
        .select()
        .from(passMessages)
        .where(eq(passMessages.passId, pass.id))
        .orderBy(passMessages.createdAt)
        .then((rows) => rows.at(-1)?.message ?? "No messages yet");

    console.log("💬 Latest message for pass:", latestMessage);

    // Load & create pass
    const template = await Template.load(
        path.join(process.cwd(), "public/pass-models/storecard.pass")
    );

    let logoImageUrl;
    try {
        const imageResponse = await fetch(pass.logoUrl!);
        if (!imageResponse.ok) {
            // Log the status and text for more detailed error information
            const errorText = await imageResponse.text();
            console.error(`Failed to fetch logo image. Status: ${imageResponse.status}, URL: ${pass.logoUrl}, Response: ${errorText}`);
            throw new Error(`Failed to fetch logo image: ${imageResponse.statusText} from ${pass.logoUrl}`);
        }
        logoImageUrl = await imageResponse.arrayBuffer();
    } catch (error) {
        console.error("Error fetching logo image for pass creation:", error);
        // Return a specific error response to the client
        return NextResponse.json({
            message: "Failed to retrieve logo image for the pass. Please ensure the image URL is valid and accessible.",
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }

    let stripImageUrl;

    try {
        const imageResponse = await fetch(pass.stripImageFrontUrl!);
        if (!imageResponse.ok) {
            // Log the status and text for more detailed error information
            const errorText = await imageResponse.text();
            console.error(`Failed to fetch strip image. Status: ${imageResponse.status}, URL: ${pass.stripImageFrontUrl}, Response: ${errorText}`);
            throw new Error(`Failed to fetch strip image: ${imageResponse.statusText} from ${pass.stripImageFrontUrl}`);
        }
        stripImageUrl = await imageResponse.arrayBuffer();
    } catch (error) {
        console.error("Error fetching strip image for pass creation:", error);
        // Return a specific error response to the client
        return NextResponse.json({
            message: "Failed to retrieve strip image for the pass. Please ensure the image URL is valid and accessible.",
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }

    try {
        const imageBuffer = Buffer.from(logoImageUrl);

        await template.images.add("logo", imageBuffer, "1x");

        const stripImageBuffer = Buffer.from(stripImageUrl);
        await template.images.add("strip", stripImageBuffer, "1x");

        console.log("🖼️ Images added successfully");
    } catch (err) {
        console.error("❌ Error adding images:", err);
        return new NextResponse("Image error", { status: 500 });
    }

    try {
        const cert = Buffer.from(process.env.PASS_CERT_PEM!, "base64").toString("utf-8");
        const key = Buffer.from(process.env.PASS_KEY_PEM!, "base64").toString("utf-8");
        template.setCertificate(cert);
        template.setPrivateKey(key, process.env.PASS_CERT_PASSPHRASE || "");
        console.log("🔐 Certificate and key set");
    } catch (err) {
        console.error("❌ Error setting cert/key:", err);
        return new NextResponse("Cert error", { status: 500 });
    }

    const instance = template.createPass({
        serialNumber: pass.serialNumber,
        description: pass.description,
        webServiceURL: `${process.env.NEXT_PUBLIC_APP_URL}/api/passkit`,
        authenticationToken: pass.authenticationToken,
        passTypeIdentifier, // from URL param, overrides template if different
        // organizationName and teamIdentifier will be taken from the loaded template
    });

    // Populate pass instance with data from the database, similar to POST route
    if (pass.logoText) {
        instance.logoText = pass.logoText;
    }

    if (pass.backgroundColor) {
        instance.backgroundColor = pass.backgroundColor;
    }

    if (pass.barcodeFormat && pass.barcodeValue) {
        instance.barcodes = [
            {
                format: pass.barcodeFormat as any, // Ensure this matches WalletPass accepted formats
                message: pass.barcodeValue, // Use dynamic value from DB
                messageEncoding: "iso-8859-1", // Default, adjust if needed
            },
        ];
    }

    instance.primaryFields.add({
        key: "name",
        label: "Name",
        value: pass.name,
    });

    instance.secondaryFields.add({
        key: "msg",
        label: "Message",
        value: latestMessage,
        changeMessage: "New message: %@",
    });

    instance.secondaryFields.add({
        key: "desc",
        label: "Access",
        value: pass.description,
    });

    instance.backFields.add({
        key: "message",
        label: "Message",
        value: "Welcome to your pass!", // This will later be dynamic
        changeMessage: "New message: %@",
    });

    if (pass.auxiliaryFieldLabel && pass.auxiliaryFieldValue) {
        instance.auxiliaryFields.add({
            key: pass.auxiliaryFieldLabel,
            label: pass.auxiliaryFieldLabel,
            value: pass.auxiliaryFieldValue,
        });
    }

    if (pass.url) {
        instance.backFields.add({
            key: "website",
            label: "Website",
            value: pass.url,
        });
    }

    instance.relevantDate = new Date(Date.now() + Math.random() * 1000).toISOString();
    console.log("🕒 Set relevantDate to:", instance.relevantDate);

    console.log("🔁 Returning pass with message:", latestMessage);
    try {
        const buffer = await instance.asBuffer();
        console.log("📦 Successfully generated .pkpass buffer (size):", buffer.byteLength);

        console.log("🧠 Pass content:", {
            message: latestMessage,
            relevantDate: instance.relevantDate,
        });

        return new NextResponse(buffer, {
            status: 200,
            headers: {
                "Content-Type": "application/vnd.apple.pkpass",
                "Content-Disposition": `attachment; filename=${pass.serialNumber}.pkpass`,
            },
        });
    } catch (err) {
        console.error("❌ Error generating .pkpass buffer:", err);
        return new NextResponse("Buffer error", { status: 500 });
    }
}
