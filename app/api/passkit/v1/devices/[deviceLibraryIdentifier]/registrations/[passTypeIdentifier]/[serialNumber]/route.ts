// app/api/passkit/v1/devices/[deviceLibraryIdentifier]/registrations/[passTypeIdentifier]/[serialNumber]/route.ts

import { db } from "@/db/drizzle";
import { passRegistrations, passes } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest, context: {
  params: Promise<{
    deviceLibraryIdentifier: string;
    passTypeIdentifier: string;
    serialNumber: string;
  }>
}) {
  const { deviceLibraryIdentifier, passTypeIdentifier, serialNumber } = await context.params;
  const authToken = req.headers.get("authorization")?.replace("ApplePass ", "").trim();

  if (!authToken) {
    return new Response("Missing auth token", { status: 401 });
  }

  const body = await req.json();
  const pushToken = body.pushToken;

  if (!pushToken) {
    return new Response("Missing pushToken", { status: 400 });
  }

  const pass = await db
    .select()
    .from(passes)
    .where(eq(passes.serialNumber, serialNumber))
    .then((rows) => rows[0]);

  if (!pass || pass.authenticationToken !== authToken) {
    return new Response("Unauthorized", { status: 401 });
  }

  const existing = await db
    .select()
    .from(passRegistrations)
    .where(
      and(
        eq(passRegistrations.deviceLibraryIdentifier, deviceLibraryIdentifier),
        eq(passRegistrations.serialNumber, serialNumber)
      )
    )
    .then((rows) => rows[0]);

  if (!existing) {
    await db.insert(passRegistrations).values({
      deviceLibraryIdentifier,
      pushToken,
      passTypeIdentifier,
      serialNumber,
      passId: pass.id,
      authenticationToken: authToken,
    });

    return new Response(null, { status: 201 }); // Created
  }

  return new Response(null, { status: 200 }); // Already registered
}
