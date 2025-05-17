import { getPassById } from "@/db/functions/getPassById";
import Pass from "../../_components/pass";
import { ApplePass } from "@/lib/types";
import SharePass from "../../_components/share-pass";
export default async function SharePassPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const pass = await getPassById(id);
  return (
    <SharePass pass={pass}>
      <Pass pass={pass as ApplePass} />
    </SharePass>
  );
}
