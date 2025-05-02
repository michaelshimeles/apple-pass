import { db } from "@/db/drizzle";
import { passes, passRegistrations } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { NextRequest } from "next/server";

// Helper to extract params from URL
function extractParams(url: string) {
  const parts = url.split("/v1/devices/")[1]?.split("/");
  const [deviceLibraryIdentifier, , passTypeIdentifier, serialNumber] = parts ?? [];
  return { deviceLibraryIdentifier, passTypeIdentifier, serialNumber };
}

export async function POST(req: NextRequest) {
  const { deviceLibraryIdentifier, passTypeIdentifier, serialNumber } = extractParams(req.url);

  console.log("📲 Device registration hit");
  console.log("Params:", { deviceLibraryIdentifier, passTypeIdentifier, serialNumber });

  if (!deviceLibraryIdentifier || !passTypeIdentifier || !serialNumber) {
    console.log("❌ Missing one or more URL parameters");
    return new Response("Missing parameters", { status: 400 });
  }

  const auth = req.headers.get("authorization")?.replace("ApplePass ", "").trim();
  console.log("Auth header123:", auth);

  if (!auth) {
    console.log("❌ No authorization header provided");
    return new Response("Unauthorized", { status: 401 });
  }

  // Find the pass by serial
  const pass = await db
    .select()
    .from(passes)
    .where(eq(passes.serialNumber, serialNumber)) // ✅ CORRECT
    .limit(1)
    .then((data) => data[0]);

  if (!pass) {
    console.log("❌ No pass found for serial:", serialNumber);
    return new Response("Pass not found", { status: 404 });
  }

  if (pass.authenticationToken !== auth) {
    console.log("❌ Auth token mismatch");
    return new Response("Unauthorized", { status: 401 });
  }

  const { pushToken } = await req.json();
  console.log("Push token received:", pushToken);

  if (!pushToken) {
    console.log("❌ No push token in request body");
    return new Response("Missing pushToken", { status: 400 });
  }

  const existing = await db
    .select()
    .from(passRegistrations)
    .where(
      and(
        eq(passRegistrations.deviceLibraryIdentifier, deviceLibraryIdentifier),
        eq(passRegistrations.serialNumber, serialNumber) // 👈 match by serial too
      )
    );

  if (!existing.length) {
    console.log("✅ Registering new device...");
    await db.insert(passRegistrations).values({
      deviceLibraryIdentifier,
      pushToken,
      passTypeIdentifier,
      serialNumber,
      passId: pass.id,
      authenticationToken: pass.authenticationToken
    });

    console.log("✅ Device successfully registered");
    return new Response(null, { status: 201 }); // Created
  }

  console.log("ℹ️ Device already registered");
  return new Response(null, { status: 200 }); // Already registered
}
