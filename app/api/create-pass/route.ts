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

    const { name, description, logoText, headerFieldLabel, headerFieldValue, backgroundColor, logoUrl, stripImageFrontUrl, stripImageBackUrl, backgroundUrl, secondaryFieldLabel, secondaryFieldValue, auxiliaryFieldLabel, auxiliaryFieldValue, barcodeValue, barcodeFormat, url } = await req.json();

    if (!name || !description) {
        return NextResponse.json({ message: "Missing fields" }, { status: 400 });
    }

    const slug = nanoid(8);
    const serial = `pass-${Date.now()}`;

    try {
        // Load pass template
        const template = await Template.load(
            path.join(process.cwd(), "public/pass-models/storecard.pass")
        );

        let logoImageUrl;
        try {
            const imageResponse = await fetch(logoUrl);
            if (!imageResponse.ok) {
                throw new Error(`Failed to fetch logo image: ${imageResponse.statusText} from ${logoUrl}`);
            }
            logoImageUrl = await imageResponse.arrayBuffer();
        } catch (error) {
            return NextResponse.json({
                message: "Failed to retrieve logo image for the pass. Please ensure the image URL is valid and accessible.",
                details: error instanceof Error ? error.message : String(error)
            }, { status: 500 });
        }

        let stripImageUrl;

        try {
            const imageResponse = await fetch(stripImageFrontUrl);
            if (!imageResponse.ok) {
                throw new Error(`Failed to fetch strip image: ${imageResponse.statusText} from ${stripImageFrontUrl}`);
            }
            stripImageUrl = await imageResponse.arrayBuffer();
        } catch (error) {
            return NextResponse.json({
                message: "Failed to retrieve strip image for the pass. Please ensure the image URL is valid and accessible.",
                details: error instanceof Error ? error.message : String(error)
            }, { status: 500 });
        }

        const imageBuffer = Buffer.from(logoImageUrl);

        await template.images.add("logo", imageBuffer, "1x");

        const stripImageBuffer = Buffer.from(stripImageUrl);
        await template.images.add("strip", stripImageBuffer, "1x");

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

        if (barcodeFormat && barcodeValue) {
            pass.barcodes = [
                {
                    format: barcodeFormat, // Ensure this is a valid PKBarcodeFormat string
                    message: barcodeValue, // Use dynamic value from request
                    messageEncoding: "iso-8859-1", // Default, adjust if needed
                }
            ];
        }

        pass.secondaryFields.add({
            key: "desc",
            label: "Access",
            value: description,
        });

        pass.backFields.add({
            key: "message",
            label: "Message",
            value: "Welcome to your pass!", // This will later be dynamic
        });

        if (auxiliaryFieldLabel && auxiliaryFieldValue) {
            pass.auxiliaryFields.add({
                key: auxiliaryFieldLabel,
                label: auxiliaryFieldLabel,
                value: auxiliaryFieldValue,
            });
        }

        // pass.headerFields.add({
        //     key: headerFieldLabel,
        //     label: headerFieldLabel,
        //     value: headerFieldValue, // This will later be dynamic
        // })

        if (url) {
            pass.backFields.add({
                key: "website",
                label: "Website",
                value: url,
            });
        }

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
            backgroundUrl,
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
