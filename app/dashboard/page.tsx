import { Button } from "@/components/ui/button";
import { listAllPasses } from "@/db/functions/listAllPasses";
import { ApplePass } from "@/lib/types";
import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import PassView from "./_components/pass-view";
import ShareModal from "./_components/share-modal";

export default async function Dashboard() {
  const user = await currentUser()
  const response = await listAllPasses(user?.id || "")

  return (
    <section className="flex flex-col items-start justify-start p-6 w-full">
      <div className="w-full">
        <div className="flex flex-col items-start justify-center gap-2">
          <h1 className="text-3xl font-semibold tracking-tight">Apple Passes</h1>
          <p className="text-muted-foreground">View and manage all your generated passes.</p>
        </div>

        <div className="flex gap-4 flex-wrap justify-start items-center mt-4">
          {response?.length > 0 ? response?.sort((a, b) => {
            const dateA = a?.createdAt ? new Date(a.createdAt).getTime() : -Infinity;
            const dateB = b?.createdAt ? new Date(b.createdAt).getTime() : -Infinity;
            return dateB - dateA;
          })?.map((pass) => (
            <div key={pass?.id} className="w-fit border rounded-lg p-4">
              <PassView pass={pass as ApplePass} />
              <div className="flex items-center justify-start w-full gap-2 mt-4">
                <Link prefetch={true} href={pass?.fileUrl} target="_blank" rel="noopener noreferrer" className="w-full">
                  <Button size="sm" variant="outline" className="w-full">
                    Download Pass
                  </Button>
                </Link>
                <ShareModal pass={pass as ApplePass} />
              </div>
            </div>
          )) : (
            <div className="col-span-full flex flex-col items-center justify-center text-center p-8 border rounded-lg bg-muted/30 w-full">
              <h3 className="text-lg font-semibold mb-2">No passes found</h3>
              <p className="text-sm text-muted-foreground mb-4">Create your first Apple Pass to get started</p>
              <Link prefetch={true} href="/dashboard/create">
                <Button>
                  Create New Pass
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}