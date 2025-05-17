import { getPassById } from "@/db/functions/getPassById";
import Pass from "../../_components/pass";
import { ApplePass } from "@/lib/types";
import SharePass from "../../_components/share-pass";
import TrackVisit from "../../_components/track-visit"; // <-- import it

export default async function SharePassPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const pass = await getPassById(id);

  return (
    <>
      <TrackVisit passId={id} /> {/* 👈 track view */}
      <SharePass pass={pass as ApplePass}>
        <Pass pass={pass as ApplePass} />
      </SharePass>
    </>
  );
}
