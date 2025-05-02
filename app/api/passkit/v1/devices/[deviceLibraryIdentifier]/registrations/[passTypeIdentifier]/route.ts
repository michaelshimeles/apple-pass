import { db } from "@/db/drizzle";
import { passRegistrations, passes } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  context: {
    params: Promise<{
      deviceLibraryIdentifier: string;
      passTypeIdentifier: string;
    }>;
  }
): Promise<NextResponse> {
  console.log('📲 req.headers', req.headers);
  const authToken = req.headers.get("authorization")?.replace("ApplePass ", "").trim();
  console.log("📥 Auth header456:", authToken);

  if (!authToken) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { deviceLibraryIdentifier, passTypeIdentifier } = await context.params;

  // Get all passes registered to this device
  const matches = await db
    .select({
      serialNumber: passes.serialNumber,
      auth: passes.authenticationToken,
    })
    .from(passRegistrations)
    .innerJoin(passes, eq(passRegistrations.passId, passes.id))
    .where(
      and(
        eq(passRegistrations.deviceLibraryIdentifier, deviceLibraryIdentifier),
        eq(passRegistrations.passTypeIdentifier, passTypeIdentifier)
      )
    );

  const valid = matches.filter((p) => p.auth === authToken);

  if (valid.length === 0) {
    return new Response("Unauthorized", { status: 401 });
  }

  return Response.json({
    serialNumbers: valid.map((p) => p.serialNumber),
    lastUpdated: new Date().toISOString(), // Optional
  });
}
