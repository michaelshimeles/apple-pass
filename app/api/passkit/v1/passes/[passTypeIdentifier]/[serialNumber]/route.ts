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
    const template = new Template();

    try {
        await template.images.add("logo", path.join(process.cwd(), "public/logo.png"), "1x");
        await template.images.add("icon", path.join(process.cwd(), "public/icon.png"), "1x");
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
        organizationName: "Fabrika",
        teamIdentifier: "5S3KCRYBD2",
        passTypeIdentifier,
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
        changeMessage: "New message: %@",
    });

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
