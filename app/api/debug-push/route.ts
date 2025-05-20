import { db } from "@/db/drizzle";
import { pass_registrations } from "@/db/schema";
import { sendPassPushNotification } from "@/lib/sendPushPass";
import { eq } from "drizzle-orm";

export async function GET() {
  const passId = 36; // 👈 replace with a valid one

  const registrations = await db
    .select()
    .from(pass_registrations)
    .where(eq(pass_registrations.pass_id, passId));

  console.log("Expected token:", registrations);
  const tokens = registrations.map(
    (r: { push_token: unknown }) => r.push_token,
  );

  console.log("registrations", registrations);
  if (tokens.length === 0) {
    return new Response("No tokens found", { status: 404 });
  }

  for (const token of tokens) {
    await sendPassPushNotification(
      process.env.PASS_TYPE_IDENTIFIER!,
      token as string,
    );
  }

  return new Response("Push attempted");
}
