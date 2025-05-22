"server only";

import { eq, desc } from "drizzle-orm";
import { db } from "../drizzle";
import { pass_messages } from "../schema";
import { auth } from "@clerk/nextjs/server";

export const showMessages = async (passId: number | null) => {
  await auth.protect();

  if (!passId) {
    return;
  }

  try {
    const data = await db
      .select()
      .from(pass_messages)
      .where(eq(pass_messages.pass_id, passId))
      .orderBy(desc(pass_messages.created_at));

    if (!data) {
      throw new Error("No messages found");
    }

    return data;
  } catch (error) {
    console.error("Error retrieving messages:", error);
    throw new Error("Failed to retrieve messages");
  }
};
