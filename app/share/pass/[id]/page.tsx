import { getPassById } from "@/db/functions/getPassById"
import Pass from "../../_components/pass"
import { ApplePass } from "@/lib/types"

export default async function SharePass({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params

    const pass = await getPassById(id)
    return (
      <Pass pass={pass as ApplePass} />
    )
}