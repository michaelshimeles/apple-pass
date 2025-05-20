"server only";

import { eq } from "drizzle-orm";
import { db } from "../drizzle";
import { passes } from "../schema";
import { auth } from "@clerk/nextjs/server";

export const listAllPasses = async (userId: string) => {
  await auth.protect();

  if (!userId) {
    throw new Error("User ID is required");
  }

  try {
    const data = await db
      .select()
      .from(passes)
      .where(eq(passes.user_id, userId));

    if (!data) {
      throw new Error("No passes found");
    }

    return data;
  } catch (error) {
    console.error("Error retrieving passes:", error);
    throw new Error("Failed to retrieve passes");
  }
};
