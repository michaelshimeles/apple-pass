import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/db/drizzle";
import { listAllPasses } from "@/db/functions/listAllPasses";
import { showMessages } from "@/db/functions/showMessages";
import {
  pass_installs,
  pass_messages,
  pass_registrations,
  passes,
} from "@/db/schema";
import { count, eq } from "drizzle-orm";
import PassSelector from "../notifications/pass-selector";
import Link from "next/link";
import { Button } from "@/components/ui/button";
// Icons removed with View All sections
import { formatDistanceToNow } from "date-fns";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";

export default async function Analytics({
  searchParams,
}: {
  searchParams: Promise<{ passId?: string }>;
}) {
  // Get the passId from the URL query parameters
  const params = await searchParams;

  const result = await auth.api.getSession({
    headers: await headers(), // you need to pass the headers object.
  });

  if (!result?.session?.userId) {
    throw new Error("Unauthorized");
  }
  const userPasses = await listAllPasses(result.session?.userId);

  const intialPassId = userPasses?.[0]?.id;

  // Get metrics for the first pass by default
  const metrics =
    params?.passId && Number(params?.passId)
      ? await getPassMetrics(Number(params?.passId))
      : intialPassId
        ? await getPassMetrics(intialPassId)
        : null;

  const messages = await showMessages(
    params?.passId ? Number(params?.passId) : null,
  );

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex flex-col items-start justify-center gap-2">
          <h1 className="text-3xl font-semibold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            View analytics for your passes.
          </p>
        </div>
        {userPasses?.length ? (
          <PassSelector
            defaultPassId={intialPassId ? intialPassId : Number(params?.passId)}
            userPasses={userPasses}
          />
        ) : null}
      </div>
      {userPasses?.length ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <Card>
            <CardHeader>
              <CardTitle>Total Active Install(s)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-medium">{metrics?.installs ?? 0}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active Devices</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-medium">
                {metrics?.registrations ?? 0}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Messages Sent</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-medium">{metrics?.messages ?? 0}</p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center p-8 border rounded-lg bg-muted/30">
          <h3 className="text-lg font-semibold mb-2">No passes found</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Create your first Apple Pass to get started
          </p>
          <Link prefetch={true} href="/dashboard/create">
            <Button>Create New Pass</Button>
          </Link>
        </div>
      )}
      {!messages ||
        (userPasses?.length && messages?.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Messages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <p className="font-medium">{message.message}</p>
                      <span className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(message.created_at), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Pass ID: {message.pass_id}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
    </div>
  );
}

async function getPassMetrics(passId: number) {
  const [installs] = await db
    .select({ count: count() })
    .from(pass_installs)
    .where(eq(pass_installs.pass_id, passId));

  const [registrations] = await db
    .select({ count: count() })
    .from(pass_registrations)
    .where(eq(pass_registrations.pass_id, passId));

  const [messages] = await db
    .select({ count: count() })
    .from(pass_messages)
    .where(eq(pass_messages.pass_id, passId));

  const [pass] = await db
    .select({ createdAt: passes.created_at })
    .from(passes)
    .where(eq(passes.id, passId));

  return {
    installs: installs?.count ?? 0,
    registrations: registrations?.count ?? 0,
    messages: messages?.count ?? 0,
    createdAt: pass?.createdAt,
  };
}
