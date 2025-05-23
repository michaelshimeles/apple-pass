import { ApplePass } from "@/lib/types";
import { getPassById } from "@/db/functions/getPassById";
import { listAllPasses } from "@/db/functions/listAllPasses";
import { SharePreviewClient } from "./client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function SharePreview({
  searchParams,
}: {
  searchParams: Promise<{ passId?: string }>;
}) {
  const result = await auth.api.getSession({
    headers: await headers(),
  });

  if (!result?.session?.userId) {
    redirect("/sign-in");
  }
  const userPasses = await listAllPasses(result.session.userId);

  // Get the initial pass ID (either from params or use the first one)
  const initialPassShareId = userPasses?.[0]?.pass_share_id;
  const selectedShareId = (await searchParams)?.passId;

  // Get the pass by share ID
  const pass = await getPassById(selectedShareId! || initialPassShareId!);

  return userPasses?.length ? (
    <SharePreviewClient pass={pass as ApplePass} userPasses={userPasses} />
  ) : (
    <div className="p-6">
      <div className="flex flex-col items-center justify-center text-center p-8 border rounded-lg bg-muted/30">
        <h3 className="text-lg font-semibold mb-2">No passes found</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Create your first Apple Pass to get started
        </p>
        <Link prefetch={true} href="/dashboard/create">
          <Button>Create New Pass</Button>
        </Link>
      </div>
    </div>
  );
}
