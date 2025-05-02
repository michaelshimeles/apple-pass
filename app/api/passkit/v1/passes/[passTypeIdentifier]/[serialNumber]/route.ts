import { db } from "@/db/drizzle";
import { passes, passRegistrations } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { NextRequest } from "next/server";

// Apple sends authentication as: Authorization: ApplePass <token>
const getAuthToken = (req: NextRequest) =>
    req.headers.get("authorization")?.replace("ApplePass ", "").trim();

export async function POST(req: NextRequest, { params }: {
    params: {
        deviceLibraryIdentifier: string;
        passTypeIdentifier: string;
        serialNumber: string;
    };
}) {
    const { deviceLibraryIdentifier, passTypeIdentifier, serialNumber } = params;
    const authToken = getAuthToken(req);

    if (!authToken) {
        return new Response("Missing auth token", { status: 401 });
    }

    // Find the pass based on serial number

    const pass = await db.select().from(passes)
        .where(eq(passes.serialNumber, serialNumber)) // ✅ CORRECT
        .limit(1)
        .then((data) => data[0]);

    if (!pass || pass.authenticationToken !== authToken) {
        return new Response("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const pushToken = body.pushToken;

    if (!pushToken) {
        return new Response("Missing pushToken", { status: 400 });
    }

    // Check if this device is already registered
    const existing = await db
        .select()
        .from(passRegistrations)
        .where(
            and(
                eq(passRegistrations.deviceLibraryIdentifier, deviceLibraryIdentifier),
                eq(passRegistrations.serialNumber, serialNumber) // 👈 this matters
            )
        );

    if (!existing) {
        await db.insert(passRegistrations).values({
            deviceLibraryIdentifier,
            pushToken,
            passTypeIdentifier,
            serialNumber,
            passId: pass.id,
            authenticationToken: pass.authenticationToken
        });

        return new Response(null, { status: 201 }); // Created
    }

    return new Response(null, { status: 200 }); // Already registered
}
