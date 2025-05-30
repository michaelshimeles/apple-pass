"use server";

import { db } from "@/db/drizzle";
import { passes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";

interface UpdatePassNameProps {
  passShareId: string;
  name: string;
}

export async function updatePassName({
  passShareId,
  name,
}: UpdatePassNameProps) {
  const result = await auth.api.getSession({
    headers: await headers(), // you need to pass the headers object.
  });

  if (!result?.session.userId) {
    throw new Error("Not authenticated");
  }

  try {
    // Update the pass name in the database
    const updatedPass = await db
      .update(passes)
      .set({
        name,
        updated_at: new Date(),
      })
      .where(eq(passes.pass_share_id, passShareId))
      .returning();

    // If no pass was found with the given pass_share_id
    if (!updatedPass.length) {
      return {
        success: false,
        error: "Pass not found",
      };
    }

    // Revalidate the path to reflect the changes
    revalidatePath(`/dashboard/share`);
    revalidatePath(`/share/pass/${passShareId}`);

    return {
      success: true,
      pass: updatedPass[0],
    };
  } catch (error) {
    console.error("Error updating pass name:", error);
    return {
      success: false,
      error: "Failed to update pass name",
    };
  }
}
