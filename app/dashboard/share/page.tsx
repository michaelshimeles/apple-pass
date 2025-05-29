import { Button } from "@/components/ui/button";
import { getPassById } from "@/db/functions/getPassById";
import { listAllPasses } from "@/db/functions/listAllPasses";
import { auth } from "@/lib/auth/auth";
import { ApplePass } from "@/lib/types";
import { headers } from "next/headers";
import Link from "next/link";
import { SharePreviewClient } from "./client";

export default async function SharePreview({
  searchParams,
}: {
  searchParams: Promise<{ passId?: string }>;
}) {
  const result = await auth.api.getSession({
    headers: await headers(),
  });

  const userPasses = await listAllPasses(result?.session.userId);

  // Get the initial pass ID (either from params or use the first one)
  const initialPassShareId = userPasses?.[0]?.pass_share_id;
  const selectedShareId = (await searchParams)?.passId;

  // Get the pass by share ID
  const pass = await getPassById(selectedShareId! || initialPassShareId!);

  return (
    <div className="flex flex-col items-start justify-start p-6 w-full">
      <div className="w-full">
        {!userPasses?.length && (
          <div className="flex flex-col items-start justify-center gap-2">
            <h1 className="text-3xl font-semibold tracking-tight">
              Share Preview
            </h1>
            <p className="text-muted-foreground">
              Preview and manage your generated passes.
            </p>
          </div>
        )}
        {userPasses?.length ? (
          <SharePreviewClient
            pass={pass as ApplePass}
            userPasses={userPasses}
          />
        ) : (
          <div className="flex flex-col h-[80vh] mt-4 items-center justify-center text-center border rounded-lg bg-muted/30">
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
    </div>
  );
}
