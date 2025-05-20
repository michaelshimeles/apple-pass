import { db } from "@/db/drizzle";
import { pass_registrations, passes } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  context: {
    params: {
      deviceLibraryIdentifier: string;
      passTypeIdentifier: string;
    };
  },
): Promise<NextResponse> {
  const { deviceLibraryIdentifier, passTypeIdentifier } = await context.params;

  const authToken = req.headers
    .get("authorization")
    ?.replace("ApplePass ", "")
    .trim();

  console.log("📥 Authorization header:", authToken);
  console.log(
    "📥 passesUpdatedSince param:",
    req.nextUrl.searchParams.get("passesUpdatedSince"),
  );

  // Find all passes registered to this device
  const matches = await db
    .select()
    .from(pass_registrations)
    .innerJoin(passes, eq(pass_registrations.pass_id, passes.id))
    .where(
      and(
        eq(
          pass_registrations.device_library_identifier,
          deviceLibraryIdentifier,
        ),
        eq(pass_registrations.pass_type_identifier, passTypeIdentifier),
      ),
    );

  const passesUpdatedSince = req.nextUrl.searchParams.get("passesUpdatedSince");

  const updatedSerials = matches
    .filter(
      (p) => new Date(p.passes.updated_at!) > new Date(passesUpdatedSince ?? 0),
    )
    .map((p) => p.passes.serial_number);

  return NextResponse.json({
    lastUpdated: new Date().toISOString(),
    serialNumbers: updatedSerials,
  });
}
