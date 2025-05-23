import { db } from "@/db/drizzle";
import { passes } from "@/db/schema";
import NotificationsForm from "./form";
import { eq } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";

export default async function NotificationsPage() {
  const result = await auth.api.getSession({
    headers: await headers(),
  });

  if (!result?.session?.userId) {
    throw new Error("Unauthorized");
  }
  const allPasses = await db
    .select()
    .from(passes)
    .where(eq(passes.user_id, result.session.userId!));

  return (
    <div className="p-6 w-full space-y-4">
      <div className="flex flex-col items-start justify-center gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          Send Notification
        </h1>
        <p className="text-muted-foreground">
          Send a notification to your users.
        </p>
      </div>
      {allPasses?.length ? (
        <NotificationsForm passes={allPasses} />
      ) : (
        <div className="flex flex-col items-center justify-center text-center p-8 border rounded-lg bg-muted/30">
          <h3 className="text-lg font-semibold mb-2">No passes found</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Create your first Apple Pass to get started
          </p>
          <Link prefetch={true} href="/dashboard/create">
            <Button>Create New Pass</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
