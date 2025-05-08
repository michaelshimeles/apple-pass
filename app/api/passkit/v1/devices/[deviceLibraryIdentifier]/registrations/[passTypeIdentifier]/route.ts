import { db } from "@/db/drizzle";
import { passRegistrations, passes } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  context: {
    params: {
      deviceLibraryIdentifier: string;
      passTypeIdentifier: string;
    };
  }
): Promise<NextResponse> {
  const { deviceLibraryIdentifier, passTypeIdentifier } = await context.params;

  const authToken = req.headers
    .get("authorization")
    ?.replace("ApplePass ", "")
    .trim();

  console.log("📥 Authorization header:", authToken);
  console.log("📥 passesUpdatedSince param:", req.nextUrl.searchParams.get("passesUpdatedSince"));

  // Find all passes registered to this device
  const matches = await db
    .select()
    .from(passRegistrations)
    .innerJoin(passes, eq(passRegistrations.passId, passes.id))
    .where(
      and(
        eq(passRegistrations.deviceLibraryIdentifier, deviceLibraryIdentifier),
        eq(passRegistrations.passTypeIdentifier, passTypeIdentifier)
      )
    );


  const passesUpdatedSince = req.nextUrl.searchParams.get("passesUpdatedSince");

  const updatedSerials = matches
    .filter((p) => new Date(p.passes.updatedAt!) > new Date(passesUpdatedSince ?? 0))
    .map((p) => p.passes.serialNumber);
  
  return NextResponse.json({
    lastUpdated: new Date().toISOString(),
    serialNumbers: updatedSerials,
  });
}
