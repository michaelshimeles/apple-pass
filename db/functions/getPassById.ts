import { db } from "../drizzle"
import { eq } from "drizzle-orm"
import { passes } from "../schema"

export const getPassById = async (id: string) => {
    console.log("id", id)
    const pass = await db.select().from(passes).where(eq(passes.passShareId, String(id))).limit(1).then((data) => data[0])
    return pass
}
