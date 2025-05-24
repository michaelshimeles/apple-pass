"server only";

import { auth } from "@/lib/auth/auth";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "../drizzle";
import { passes } from "../schema";

export const listAllPasses = async (userId: string) => {
  const result = await auth.api.getSession({
    headers: await headers(),
  });

  console.log("result session", result?.session);

  if (!(userId === result?.session?.userId)) {
    return;
  }

  try {
    const data = await db
      .select()
      .from(passes)
      .where(
        eq(
          passes.organization_id,
          String(result?.session.activeOrganizationId),
        ),
      );

    console.log("data", data);
    if (!data) {
      throw new Error("No passes found");
    }

    return data;
  } catch (error) {
    console.error("Error retrieving passes:", error);
    throw new Error("Failed to retrieve passes");
  }
};
