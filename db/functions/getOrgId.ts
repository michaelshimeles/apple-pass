import { auth } from "@clerk/nextjs/server";
import { db } from "../drizzle";
import { organizations } from "../schema";
import { eq } from "drizzle-orm";

export default async function getOrgId() {
  const userId = (await auth()).userId;

  if (!userId) {
    throw Error("Not authenticated");
  }

  try {
    const result = await db
      .select()
      .from(organizations)
      .where(eq(organizations.admin_user_id, userId));

    return {
      statusSuccess: true,
      result,
    };
  } catch (error) {
    console.error("Error deleting pass:", error);
    return {
      statusSuccess: false,
      error,
    };
  }
}
