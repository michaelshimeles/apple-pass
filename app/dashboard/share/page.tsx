import { ApplePass } from "@/lib/types";
import { getPassById } from "@/db/functions/getPassById";
import { auth } from "@clerk/nextjs/server";
import { listAllPasses } from "@/db/functions/listAllPasses";
import { SharePreviewClient } from "./client";

export default async function SharePreview({
  searchParams,
}: {
  searchParams: { passId?: string };
}) {
  const { userId } = await auth();
  if (!userId) return null;
  
  const userPasses = await listAllPasses(userId);
  if (!userPasses?.length) return null;

  // Get the initial pass ID (either from params or use the first one)
  const initialPassShareId = userPasses?.[0]?.pass_share_id;
  const selectedShareId = searchParams?.passId || userPasses?.[0]?.pass_share_id;
  
  // Get the pass by share ID
  const pass = await getPassById(selectedShareId || initialPassShareId);

  return <SharePreviewClient pass={pass as ApplePass} userPasses={userPasses} />;
}
