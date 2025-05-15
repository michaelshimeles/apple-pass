"use server";
import { db } from "../drizzle";
import { eq, and } from "drizzle-orm";
import { passes, passInstalls, passRegistrations } from "../schema"; // import passInstalls
import { auth } from "@clerk/nextjs/server";

export async function deletePass(id: string) {
  const userId = (await auth()).userId;

  try {
    // First delete from pass_installs
    await db
      .delete(passInstalls)
      .where(eq(passInstalls.passId, parseInt(id)))
      .returning();

    await db
      .delete(passRegistrations)
      .where(eq(passRegistrations.passId, parseInt(id)))
      .returning();

    // Then delete from passes
    await db
      .delete(passes)
      .where(and(eq(passes.id, parseInt(id)), eq(passes.userId, userId!)));

    return true;
  } catch (error) {
    console.error("Error deleting pass:", error);
    return false;
  }
}
