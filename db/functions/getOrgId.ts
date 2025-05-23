import { db } from "../drizzle";
import { organizations } from "../schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";

export default async function getOrgId() {
  const result = await auth.api.getSession({
    headers: await headers(),
  });

  if (!result?.session?.userId) {
    throw new Error("Unauthorized");
  }

  try {
    const response = await db
      .select()
      .from(organizations)
      .where(eq(organizations.admin_user_id, result.session.userId));

    return {
      statusSuccess: true,
      result: response,
    };
  } catch (error) {
    console.error("Error deleting pass:", error);
    return {
      statusSuccess: false,
      error,
    };
  }
}
