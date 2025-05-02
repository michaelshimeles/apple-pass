export async function POST(req: Request) {
    const body = await req.json();
    console.log("📊 Apple log ping:", body);

    return new Response(null, { status: 200 });
}
  