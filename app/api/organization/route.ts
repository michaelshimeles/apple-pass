import { NextResponse } from "next/server";
import { getOrgInfo } from "@/db/functions/getOrgInfo";
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
    const result = await getOrgInfo(info?.session.userId);

    if (!result.statusSuccess) {
      return NextResponse.json(
        { error: result.error || "Failed to fetch organization data" },
        { status: 500 },
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in organization API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
