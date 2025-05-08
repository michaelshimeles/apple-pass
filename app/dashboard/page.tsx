import { Button } from "@/components/ui/button";
import { listAllPasses } from "@/db/functions/listAllPasses";
import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { Fragment } from "react";
import QRCode from "./_components/qr-code";

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
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {response?.length > 0 ? response?.sort((a, b) => {
            return new Date(b?.createdAt!).getTime() - new Date(a?.createdAt!).getTime();
          })?.map((pass: any) => (
            <Fragment key={pass?.id}>
              <div className="group flex flex-col items-start rounded border bg-card hover:shadow-lg transition-all duration-300 w-fit px-4 py-3 space-y-4">
                <div className="space-y-2 w-full">
                  <h3 className="text-lg font-semibold tracking-tight">{pass?.name}</h3>
                  <p className="text-sm text-muted-foreground">{pass?.description}</p>
                </div>
                {/* <div className="w-full flex justify-center bg-muted/30 rounded-lg p-4"> */}
                <QRCode key={pass?.id} response={pass} />
                {/* </div> */}
                <div className="flex items-center justify-start w-full">
                  <Link prefetch={true} href={pass?.fileUrl} target="_blank" rel="noopener noreferrer" className="w-full">
                    <Button size="sm" variant="outline" className="w-full">
                      Download Pass
                    </Button>
                  </Link>
                </div>
              </div>
            </Fragment>
          )) : (
            <div className="col-span-full flex flex-col items-center justify-center text-center p-8 border rounded-lg bg-muted/30">
              <h3 className="text-lg font-semibold mb-2">No passes found</h3>
              <p className="text-sm text-muted-foreground mb-4">Create your first Apple Pass to get started</p>
              <Link prefetch={true} href="/create">
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