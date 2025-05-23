import Form from "./_components/form";
import getOrgId from "@/db/functions/getOrgId";
import { redirect } from "next/navigation";
export default async function Onboarding() {
  const org = await getOrgId();

  if (!(org?.result?.length === 0)) {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-col justify-center items-center w-full h-screen gap-2">
      <Form />
    </div>
  );
}
