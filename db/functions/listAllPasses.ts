"server only";

import { eq } from "drizzle-orm";
import { db } from "../drizzle";
import { passes } from "../schema";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";

export const listAllPasses = async (userId: string) => {
  const result = await auth.api.getSession({
    headers: await headers(),
  });

  if (!result?.session?.userId) {
    throw new Error("Unauthorized");
  }

  if (!userId) {
    return;
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
