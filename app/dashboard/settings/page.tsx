import { getOrgInfo } from "@/db/functions/getOrgInfo";
import { auth } from "@clerk/nextjs/server";

export default async function SettingsPage() {
  const { userId } = await auth();
  const { result } = await getOrgInfo(userId!);

  console.log(result);
  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account settings and preferences
        </p>
      </div>
    </div>
  );
}
