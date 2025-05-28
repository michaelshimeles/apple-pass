import { Button } from "@/components/ui/button";
import { listAllPasses } from "@/db/functions/listAllPasses";
import { ApplePass } from "@/lib/types";
import Link from "next/link";
import DeletePass from "./_components/delete-pass";
import ShareModal from "./_components/share-modal";
import Pass from "../share/_components/pass";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";

export default async function Dashboard() {
  const result = await auth.api.getSession({
    headers: await headers(), // you need to pass the headers object.
  });

  const response = await listAllPasses(result?.session?.userId || "");

  return (
    <section className="flex flex-col items-start justify-start p-6 w-full">
      <div className="w-full">
        <div className="flex flex-col items-start justify-center gap-2">
          <h1 className="text-3xl font-semibold tracking-tight">
            Apple Passes
          </h1>
          <p className="text-muted-foreground">
            View and manage all your generated passes.
          </p>
        </div>
        <div className="flex gap-4 flex-wrap justify-start items-center mt-4">
          {response && response?.length > 0 ? (
            response
              ?.sort((a, b) => {
                const dateA = a?.created_at
                  ? new Date(a.created_at).getTime()
                  : -Infinity;
                const dateB = b?.created_at
                  ? new Date(b.created_at).getTime()
                  : -Infinity;
                return dateB - dateA;
              })
              ?.map((pass) => (
                <div
                  key={pass?.id}
                  className="w-fit border border-gray-100 shadow-xl rounded-lg p-4"
                >
                  <p className="mb-3 text-lg font-medium">{pass.name}</p>
                  <Pass pass={pass as ApplePass} />
                  <div className="flex items-center justify-start w-full gap-2 mt-4">
                    <Link
                      prefetch={true}
                      href={pass?.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full"
                    >
                      <Button size="sm" variant="outline" className="w-full">
                        Download Pass
                      </Button>
                    </Link>
                    <ShareModal pass={pass as ApplePass} />
                    <DeletePass passId={pass?.id?.toString()} />
                  </div>
                </div>
              ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center h-[80vh] text-center p-8 border rounded-lg bg-muted/30 w-full">
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
    </section>
  );
}
