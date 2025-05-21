"use server";
import { db } from "@/db/drizzle";
import { onboarding_info, organizations } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

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

    await db
      .update(onboarding_info)
      .set({ organization_id: data?.[0]?.id })
      .where(eq(onboarding_info?.user_id, userId));
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

interface Info {
  name: string;
  user_id: string | null;
  company_url: string;
  position: string;
  total_visitors: string;
}

export async function storeOnboardingInfo({
  name,
  user_id,
  company_url,
  position,
  total_visitors,
}: Info) {
  const userId = (await auth()).userId;

  if (!userId) {
    throw Error("Not authenticated");
  }

  try {
    const data = await db
      .insert(onboarding_info)
      .values({
        name,
        user_id,
        company_url,
        position,
        total_visitors,
      })
      .returning();

    return {
      statusSuccess: true,
      storedInfo: data,
    };
  } catch (error) {
    return {
      statusSuccess: false,
      error,
    };
  }
}
