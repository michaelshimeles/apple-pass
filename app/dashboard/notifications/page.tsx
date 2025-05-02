import { db } from "@/db/drizzle";
import { passes } from "@/db/schema";
import NotificationsForm from "./form";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export default async function NotificationsPage() {
  const { userId } = await auth();
  const allPasses = await db.select().from(passes).where(eq(passes.userId, userId!));

  return (
    <div className="p-6 max-w-xl space-y-4">
      <h1 className="text-3xl font-semibold tracking-tight">Send Notification</h1>
      <NotificationsForm passes={allPasses} />
    </div>
  );
}
