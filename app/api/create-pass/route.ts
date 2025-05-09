import { db } from "@/db/drizzle";
import { passes } from "@/db/schema";
import { uploadPkpassToR2 } from "@/lib/r2";
import { auth, currentUser } from "@clerk/nextjs/server";
import { Template } from "@walletpass/pass-js";
import { nanoid } from "nanoid";
import { NextRequest, NextResponse } from "next/server";
import path from "path";

// Define an interface for the expected request body
interface CreatePassRequestBody {
    name: string;
    description: string;
    logoUrl: string;
    stripImageFrontUrl: string;
    logoText?: string;
    headerFieldLabel?: string;
    headerFieldValue?: string;
    backgroundColor?: string;
    stripImageBackUrl?: string;
    backgroundUrl?: string;
    secondaryFieldLabel?: string;
    secondaryFieldValue?: string;
    auxiliaryFieldLabel?: string;
    auxiliaryFieldValue?: string;
    barcodeValue?: string;
    barcodeFormat?: string; // Should conform to PKBarcodeFormat
}

// Helper function to fetch image ArrayBuffer
async function fetchImageArrayBuffer(url: string, fieldName: string): Promise<ArrayBuffer> {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch ${fieldName} image: ${response.status} ${response.statusText} from ${url}`);
        }
        return await response.arrayBuffer();
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        // Re-throw a more specific error to be caught by the main handler
        throw new Error(`Error retrieving ${fieldName} image. Ensure URL is valid and accessible: ${message}`);
    }
}

export async function POST(req: NextRequest) {
    try {
        await auth.protect();
        const user = await currentUser();

        if (!user?.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        // Check for required environment variables
        const passCertPem = process.env.PASS_CERT_PEM;
        const passKeyPem = process.env.PASS_KEY_PEM;
        const appUrl = process.env.NEXT_PUBLIC_APP_URL;
        const passCertPassphrase = process.env.PASS_CERT_PASSPHRASE || "";

        if (!passCertPem || !passKeyPem) {
            console.error("Missing pass certificate or key in environment variables.");
            return NextResponse.json({ message: "Pass generation configuration error. Contact support." }, { status: 500 });
        }
        if (!appUrl) {
            console.error("Missing NEXT_PUBLIC_APP_URL in environment variables.");
            return NextResponse.json({ message: "Application configuration error. Contact support." }, { status: 500 });
        }

        const body: CreatePassRequestBody = await req.json();

        const {
            name,
            description,
            logoUrl,
            stripImageFrontUrl,
            logoText,
            headerFieldLabel,
            headerFieldValue,
            backgroundColor,
            stripImageBackUrl, // Will be saved to DB
            backgroundUrl,   // Will be saved to DB
            secondaryFieldLabel,
            secondaryFieldValue,
            auxiliaryFieldLabel,
            auxiliaryFieldValue,
            barcodeValue,
            barcodeFormat,
        } = body;

        // Validate required fields from the request body
        if (!name || !description || !logoUrl || !stripImageFrontUrl) {
            return NextResponse.json({ message: "Missing required fields: name, description, logoUrl, or stripImageFrontUrl." }, { status: 400 });
        }

        const slug = nanoid(8);
        const serialNumber = `pass-${Date.now()}`;
        const authenticationToken = nanoid(32);

        // Load pass template
        const template = await Template.load(
            path.join(process.cwd(), "public/pass-models/storecard.pass")
        );

        // Fetch and add logo image
        const logoImageBuffer = await fetchImageArrayBuffer(logoUrl, "logo");
        await template.images.add("logo", Buffer.from(logoImageBuffer));

        // Fetch and add strip image
        const stripImageBuffer = await fetchImageArrayBuffer(stripImageFrontUrl, "strip");
        await template.images.add("strip", Buffer.from(stripImageBuffer));
        
        // Load cert and key
        const cert = Buffer.from(passCertPem, "base64").toString("utf-8");
        const key = Buffer.from(passKeyPem, "base64").toString("utf-8");

        template.setCertificate(cert);
        template.setPrivateKey(key, passCertPassphrase);

        const pass = template.createPass({
            serialNumber: serialNumber,
            description: description, // Pass description for accessibility
            webServiceURL: `${appUrl}/api/passkit`,
            authenticationToken: authenticationToken,
        });

        // Conditionally set optional top-level pass properties
        if (logoText) {
            pass.logoText = logoText;
        }
        if (backgroundColor) {
            pass.backgroundColor = backgroundColor;
        }

        // Conditionally add barcodes
        if (barcodeFormat && barcodeValue) {
            pass.barcodes = [{
                format: barcodeFormat as any, 
                message: barcodeValue,
                messageEncoding: "iso-8859-1",
            }];
        }

        pass.primaryFields.add({
            key: "primaryContent",
            label: name,
            value: description, 
        });
        
        if (headerFieldLabel && headerFieldValue) {
            pass.headerFields.add({
                key: "headerCustom", 
                label: headerFieldLabel,
                value: headerFieldValue,
            });
        }
        
        pass.secondaryFields.add({
            key: "details", 
            label: "Details", 
            value: description, 
        });
        
        if (secondaryFieldLabel && secondaryFieldValue) {
            pass.secondaryFields.add({
                key: "secondaryCustom", 
                label: secondaryFieldLabel,
                value: secondaryFieldValue,
            });
        }

        if (auxiliaryFieldLabel && auxiliaryFieldValue) {
            pass.auxiliaryFields.add({
                key: "auxiliaryCustom", 
                label: auxiliaryFieldLabel,
                value: auxiliaryFieldValue,
            });
        }

        pass.backFields.add({
            key: "info",
            label: "More Information",
            value: `Visit our website or contact support for more details. Pass ID: ${serialNumber}`,
        });

        const passBuffer = await pass.asBuffer();

        const fileUrl = await uploadPkpassToR2(passBuffer, `${slug}.pkpass`);

        await db.insert(passes).values({
            name,
            description,
            slug,
            serialNumber: serialNumber,
            fileUrl,
            userId: user.id,
            authenticationToken,
            logoText: logoText || null,
            backgroundColor: backgroundColor || null,
            logoUrl,
            stripImageFrontUrl,
            stripImageBackUrl: stripImageBackUrl || null,
            backgroundUrl: backgroundUrl || null,
            secondaryFieldLabel: secondaryFieldLabel || null,
            secondaryFieldValue: secondaryFieldValue || null,
            auxiliaryFieldLabel: auxiliaryFieldLabel || null,
            auxiliaryFieldValue: auxiliaryFieldValue || null,
            headerFieldLabel: headerFieldLabel || null,
            headerFieldValue: headerFieldValue || null,
            barcodeValue: barcodeValue || null,
            barcodeFormat: barcodeFormat || null,
        });

        return NextResponse.json({ url: fileUrl, slug: slug }, { status: 200 });

    } catch (err: unknown) {
        console.error("Error creating pass:", err);
        const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred during pass creation.";
        return NextResponse.json({ message: "Internal Server Error", details: errorMessage }, { status: 500 });
    }
}
