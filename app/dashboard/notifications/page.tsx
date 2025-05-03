import { db } from "@/db/drizzle";
import { passes } from "@/db/schema";
import NotificationsForm from "./form";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function NotificationsPage() {
  const { userId } = await auth();
  const allPasses = await db.select().from(passes).where(eq(passes.userId, userId!));

  return (
    <div className="p-6 w-full space-y-4">
      <h1 className="text-3xl font-semibold tracking-tight">Send Notification</h1>
      {allPasses?.length ? <NotificationsForm passes={allPasses} />
        :
        <div className="flex flex-col items-center justify-center text-center p-8 border rounded-lg bg-muted/30">
          <h3 className="text-lg font-semibold mb-2">No passes found</h3>
          <p className="text-sm text-muted-foreground mb-4">Create your first Apple Pass to get started</p>
          <Link href="/create">
            <Button>
              Create New Pass
            </Button>
          </Link>
        </div>
      }
    </div>
  );
}
