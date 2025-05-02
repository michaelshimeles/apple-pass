import { db } from "@/db/drizzle";
import { passes, passInstalls } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: Request) {
    const url = new URL(req.url);
    const slug = url.pathname.split("/").pop(); // gets the [slug]

    if (!slug) {
        return new Response("Missing slug", { status: 400 });
    }

    const pass = await db
        .select()
        .from(passes)
        .where(eq(passes.slug, slug))
        .limit(1)
        .then((data) => data[0]);

    if (!pass) {
        return new Response("Not found", { status: 404 });
    }

    try {
        await db.insert(passInstalls).values({
            passId: pass.id,
            userAgent: req.headers.get("user-agent") || "unknown",
            ip: req.headers.get("x-forwarded-for") || "unknown",
        });
    } catch (e) {
        console.error("Failed to record install:", e);
    }

    return Response.redirect(pass.fileUrl);
}
