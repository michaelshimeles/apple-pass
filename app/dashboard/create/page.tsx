import { CreatePassForm } from "../_components/form";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";

export default async function Create() {
  const result = await auth.api.getSession({
    headers: await headers(),
  });
  return (
    <div className="flex flex-col justify-center items-start w-full p-6">
      <div className="flex items-center justify-start w-full">
        <h1 className="text-3xl font-semibold tracking-tight mb-4">
          Pass Builder
        </h1>
      </div>
      <CreatePassForm organizationId={result?.session.activeOrganizationId} />
    </div>
  );
}
