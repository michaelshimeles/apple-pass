"use server";
import { db } from "@/db/drizzle";
import { organizations } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";

interface Org {
  name: string;
  invites: string[] | null;
}
export async function createOrg({ name }: Org) {
  const userId = (await auth()).userId;

  if (!userId) {
    throw Error("Not authenticated");
  }

  try {
    const data = await db
      .insert(organizations)
      .values({
        name,
        admin_user_id: userId,
      })
      .returning();

    // Handle invites

    return {
      statusSuccess: true,
      createdOrg: data,
    };
  } catch (error) {
    return {
      statusSuccess: false,
      error,
    };
  }
}
