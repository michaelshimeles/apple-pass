// app/api/passkit/v1/devices/[deviceLibraryIdentifier]/registrations/[passTypeIdentifier]/[serialNumber]/route.ts

import { db } from "@/db/drizzle";
import { pass_registrations, passes } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { NextRequest } from "next/server";

export async function POST(
  req: NextRequest,
  context: {
    params: Promise<{
      deviceLibraryIdentifier: string;
      passTypeIdentifier: string;
      serialNumber: string;
    }>;
  },
) {
  const { deviceLibraryIdentifier, passTypeIdentifier, serialNumber } =
    await context.params;
  const authToken = req.headers
    .get("authorization")
    ?.replace("ApplePass ", "")
    .trim();

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
    .where(eq(passes.serial_number, serialNumber))
    .then((rows) => rows[0]);

  if (!pass || pass.authentication_token !== authToken) {
    return new Response("Unauthorized", { status: 401 });
  }

  const existing = await db
    .select()
    .from(pass_registrations)
    .where(
      and(
        eq(
          pass_registrations.device_library_identifier,
          deviceLibraryIdentifier,
        ),
        eq(pass_registrations.serial_number, serialNumber),
      ),
    )
    .then((rows) => rows[0]);

  if (!existing) {
    await db.insert(pass_registrations).values({
      device_library_identifier: deviceLibraryIdentifier,
      push_token: pushToken,
      pass_type_identifier: passTypeIdentifier,
      serial_number: serialNumber,
      pass_id: pass.id,
      authentication_token: authToken,
    });

    return new Response(null, { status: 201 }); // Created
  }

  return new Response(null, { status: 200 }); // Already registered
}

export async function DELETE(
  req: Request,
  context: {
    params: Promise<{
      deviceLibraryIdentifier: string;
      passTypeIdentifier: string;
      serialNumber: string;
    }>;
  },
) {
  const { deviceLibraryIdentifier, passTypeIdentifier, serialNumber } =
    await context.params;

  // 🔥 Log or clean up the device registration
  console.log("Pass removed:", {
    deviceLibraryIdentifier,
    passTypeIdentifier,
    serialNumber,
  });

  // Your DB cleanup logic here
  await db.delete(pass_registrations).where(and(
    eq(pass_registrations.device_library_identifier, deviceLibraryIdentifier),
    eq(pass_registrations.pass_type_identifier, passTypeIdentifier),
    eq(pass_registrations.serial_number, serialNumber),
  ));

  return new Response(null, { status: 200 });
}
