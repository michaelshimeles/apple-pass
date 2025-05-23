import Form from "./_components/form";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";

export default async function Onboarding() {
  // Check authentication first
  const result = await auth.api.getSession({
    headers: await headers(),
  });

  // Only proceed with org check if authenticated
  if (result?.session?.userId) {
    try {
    } catch (error) {
      console.error("Error in onboarding page:", error);
      // We'll still render the onboarding form on error
    }

    // Always render the form - middleware will handle redirects if not authenticated
    return (
      <div className="flex flex-col justify-center items-center w-full h-screen gap-2">
        <Form userId={result?.session?.userId} />
      </div>
    );
  } else {
    redirect("/sign-in");
  }
}
