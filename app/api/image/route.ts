import { openai } from "@ai-sdk/openai";
import { experimental_generateImage as generateImage } from "ai";
import { NextResponse } from "next/server";

// export const maxDuration = 30;

export async function POST(req: Request) {
  const { prompt } = await req.json();
  const { image } = await generateImage({
    model: openai.image("gpt-image-1"),
    prompt: prompt + ". The Image MUST BE 375x144, no more no less",
    providerOptions: {
      openai: { quality: "high" },
    },
  });

  console.log("image", image);
  return NextResponse.json({
    image,
  });
}
