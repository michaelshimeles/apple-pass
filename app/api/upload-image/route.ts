import { uploadImageAssets } from "@/lib/upload-image";
import { NextRequest, NextResponse } from "next/server";

export const config = {
    api: { bodyParser: false }, // we’ll use Web API streams
};

export async function POST(req: NextRequest) {
    // pull the raw body bytes
    const buf = Buffer.from(await req.arrayBuffer());
    // pick a key, e.g. timestamp + original filename from header
    const filename = req.headers.get("x-file-name") || `upload-${Date.now()}`;
    // upload
    const url = await uploadImageAssets(buf, filename);
    return NextResponse.json({ url });
}
