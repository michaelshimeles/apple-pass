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
    return {
      statusSuccess: false,
      result: [],
      error: "User not authenticated",
    };
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
    console.error("Error fetching organization:", error);
    return {
      statusSuccess: false,
      result: [],
      error,
    };
  }
}
