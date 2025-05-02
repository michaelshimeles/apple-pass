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

  console.log("matches", matches)

  // matches [
  //   {
  //     pass_registrations: {
  //       id: 15,
  //       deviceLibraryIdentifier: 'd73c346f16b01c60a6c144b2fee52d5c',
  //       pushToken: '11b62b6f393f94665a93219b1c6aa63ccc5353254a49ed8c7ca0f6d443274764',
  //       passTypeIdentifier: 'pass.com.heyfabrika.pass',
  //       authenticationToken: 'Tqn_4b6ERwRprrtetz22nhIWStjjQpmE',
  //       serialNumber: 'pass-1746163232961',
  //       passId: 45,
  //       createdAt: 2025-05-02T06:09:43.486Z
  //     },
  //     passes: {
  //       id: 45,
  //       name: 'jkho',
  //       description: 'oijoi',
  //       fileUrl: 'https://pub-8d68d87557f4468eae5143c802a7fd29.r2.dev/nyv6IAt0.pkpass',
  //       authenticationToken: 'Tqn_4b6ERwRprrtetz22nhIWStjjQpmE',
  //       slug: 'nyv6IAt0',
  //       serialNumber: 'pass-1746163232961',
  //       userId: 'user_2w46Rgbjvb0hniidnt80AnPfgA2',
  //       createdAt: 2025-05-02T05:20:33.604Z,
  //       updatedAt: 2025-05-02T15:07:15.530Z
  //     }
  //   }
  // ]

  const passesUpdatedSince = req.nextUrl.searchParams.get("passesUpdatedSince");

  const updatedSerials = matches
    .filter((p) => new Date(p.passes.updatedAt) > new Date(passesUpdatedSince ?? 0))
    .map((p) => p.passes.serialNumber);
  
  return NextResponse.json({
    lastUpdated: new Date().toISOString(),
    serialNumbers: updatedSerials,
  });
}
