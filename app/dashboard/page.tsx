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
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Apple Passes</h1>
        <p className="mt-2">View and manage all your generated passes.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {response?.map((pass: any) => (
            <Fragment key={pass?.id}>
              <div className="group flex flex-col items-start rounded border bg-card hover:shadow-lg transition-all duration-300 w-full px-4 py-3 space-y-4">
                <div className="space-y-2 w-full">
                  <h3 className="text-lg font-semibold tracking-tight">{pass?.name}</h3>
                  <p className="text-sm text-muted-foreground">{pass?.description}</p>
                </div>
                {/* <div className="w-full flex justify-center bg-muted/30 rounded-lg p-4"> */}
                <QRCode key={pass?.id} response={pass} />
                {/* </div> */}
                <div className="flex items-center justify-start w-full">
                  <Link href={pass?.fileUrl} target="_blank" rel="noopener noreferrer" className="w-full">
                    <Button size="sm" variant="outline" className="w-full">
                      Download Pass
                    </Button>
                  </Link>
                </div>
              </div>
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}