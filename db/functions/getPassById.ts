import { db } from "../drizzle";
import { eq } from "drizzle-orm";
import { passes } from "../schema";

export const getPassById = async (id: string) => {
  const pass = await db
    .select()
    .from(passes)
    .where(eq(passes.pass_share_id, String(id)))
    .limit(1)
    .then((data) => data[0]);
  return pass;
};
