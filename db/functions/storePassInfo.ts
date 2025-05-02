"server only";
import { auth } from '@clerk/nextjs/server';
import { db } from "../drizzle";
import { passes } from "../schema";
export const storePassInfo = async (passInfo: {
    name: string;
    description: string;
    fileUrl: string;
    userId: string;
    slug: string;
    createdAt: Date;
    updatedAt: Date;
}) => {
    await auth.protect()

    try {
        const data = await db.insert(passes).values({
            name: passInfo.name,
            description: passInfo.description,
            fileUrl: passInfo.fileUrl,
            slug: passInfo.slug,
            userId: passInfo.userId,
            createdAt: passInfo.createdAt,
            updatedAt: passInfo.updatedAt,
        }).returning();

        if (!data) {
            throw new Error("Failed to create pass");
        }

        return data;
    } catch (error) {
        console.error("Error creating pass:", error);
        throw new Error("Failed to create pass");
    }
}