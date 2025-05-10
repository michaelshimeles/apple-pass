"use server"
import { db } from "../drizzle";
import { eq, and } from "drizzle-orm";
import { passes } from "../schema";
import { auth } from "@clerk/nextjs/server";

export async function deletePass(id: string) {
    const userId = (await auth()).userId

    try {
        await db.delete(passes).where(and(eq(passes.id, parseInt(id)), eq(passes.userId, userId!)));
        return true;


    } catch (error) {
        console.error("Error deleting pass:", error);
        return false;
    }
}
