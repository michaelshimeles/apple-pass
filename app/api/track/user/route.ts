import { db } from "@/db/drizzle";
import { userAnalytics } from "@/db/schema";

export async function POST(req: Request) {
  const { passId } = await req.json();
  // const parsed = parse(ua);
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "";

  // Optional geo lookup — comment out if not needed
  const geo = await fetch(
    `http://ip-api.com/json/${ip}?fields=country,regionName,city`,
  )
    .then((res) => res.json())
    .catch(() => ({ country: null, regionName: null, city: null }));

  await db.insert(userAnalytics).values({
    passId,
    country: geo.country,
    region: geo.regionName,
    city: geo.city,
    os: "",
    browser: "",
    deviceType: "",
  });

  return new Response("ok", { status: 200 });
}
