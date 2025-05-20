import { db } from "@/db/drizzle";
import { passes, pass_installs } from "@/db/schema";
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
    await db.insert(pass_installs).values({
      pass_id: pass.id,
      user_agent: req.headers.get("user-agent") || "unknown",
      ip: req.headers.get("x-forwarded-for") || "unknown",
    });
  } catch (e) {
    console.error("Failed to record install:", e);
  }

  return new Response(null, {
    status: 302,
    headers: {
      Location: pass.file_url,
      "Content-Disposition": `attachment; filename="${pass.slug}.pkpass"`,
    },
  });
}
