import Form from "./_components/form";
import getOrgId from "@/db/functions/getOrgId";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";

export default async function Onboarding() {
  // Check authentication first
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Only proceed with org check if authenticated
  if (session?.session?.userId) {
    try {
      const org = await getOrgId();

      if (org?.statusSuccess && org?.result && org?.result?.length > 0) {
        redirect("/dashboard");
      }
    } catch (error) {
      console.error("Error in onboarding page:", error);
      // We'll still render the onboarding form on error
    }
  }

  // Always render the form - middleware will handle redirects if not authenticated
  return (
    <div className="flex flex-col justify-center items-center w-full h-screen gap-2">
      <Form />
    </div>
  );
}
