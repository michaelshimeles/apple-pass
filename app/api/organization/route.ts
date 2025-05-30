import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function GET() {
  try {
    const info = await auth.api.getSession({
      headers: await headers(), // you need to pass the headers object.
    });

    if (!info?.session?.userId) {
      redirect("/sign-in");
    }

    return NextResponse.json({ response: "Worked" }, { status: 200 });
  } catch (error) {
    console.error("Error in organization API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
