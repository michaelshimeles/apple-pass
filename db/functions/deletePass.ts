"use server";
import { db } from "../drizzle";
import { eq, and } from "drizzle-orm";
import {
  passes,
  pass_installs,
  pass_messages,
  pass_registrations,
} from "../schema"; // import passInstalls
import { auth } from "@clerk/nextjs/server";

export async function deletePass(id: string) {
  const userId = (await auth()).userId;

  try {
    // First delete from pass_installs
    await db
      .delete(pass_installs)
      .where(eq(pass_installs.pass_id, parseInt(id)))
      .returning();

    await db
      .delete(pass_registrations)
      .where(eq(pass_registrations.pass_id, parseInt(id)))
      .returning();

    await db
      .delete(pass_messages)
      .where(eq(pass_messages.pass_id, parseInt(id)))
      .returning();

    // Then delete from passes
    await db
      .delete(passes)
      .where(and(eq(passes.id, parseInt(id)), eq(passes.user_id, userId!)));

    return true;
  } catch (error) {
    console.error("Error deleting pass:", error);
    return false;
  }
}
