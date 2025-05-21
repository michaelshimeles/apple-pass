"use server";

import { db } from "@/db/drizzle";
import { passes } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

interface UpdatePassNameProps {
  passShareId: string;
  name: string;
}

/**
 * Updates the name of a pass in the database
 * @param passShareId The unique share ID of the pass to update
 * @param name The new name for the pass
 */
export async function updatePassName({ passShareId, name }: UpdatePassNameProps) {
  const { userId } = await auth();

  if (!userId) {
    return {
      success: false,
      error: "Not authenticated",
    };
  }

  try {
    // Update the pass name in the database
    const updatedPass = await db
      .update(passes)
      .set({ 
        name,
        updated_at: new Date() 
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
