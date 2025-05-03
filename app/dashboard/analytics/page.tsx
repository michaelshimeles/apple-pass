import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/db/drizzle";
import { listAllPasses } from "@/db/functions/listAllPasses";
import { passInstalls, passMessages, passRegistrations, passes } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { count, eq } from "drizzle-orm";
import PassSelector from "../notifications/pass-selector";

export default async function Analytics({ searchParams }: { searchParams: { passId?: string } }) {
    // Get the passId from the URL query parameters
    const params = await searchParams;

    const { userId } = await auth();
    if (!userId) return null;

    const userPasses = await listAllPasses(userId);

    const intialPassId = userPasses?.[0]?.id;

    // Get metrics for the first pass by default
    const metrics = params?.passId && Number(params?.passId) ? await getPassMetrics(Number(params?.passId)) : intialPassId ? await getPassMetrics(intialPassId) : null;

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-semibold tracking-tight">Analytics</h1>
                <PassSelector defaultPassId={intialPassId ? intialPassId : Number(params?.passId)} userPasses={userPasses} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Total Install(s)</CardTitle>
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
                        <p className="text-xl font-medium">{metrics?.registrations ?? 0}</p>
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

                <Card>
                    <CardHeader>
                        <CardTitle>Created On</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xl font-medium">{metrics?.createdAt ? new Date(metrics.createdAt).toLocaleDateString() : '-'}</p>
                    </CardContent>
                </Card>
            </div>

        </div>
    );
}

async function getPassMetrics(passId: number) {
    const [installs] = await db
        .select({ count: count() })
        .from(passInstalls)
        .where(eq(passInstalls.passId, passId));

    const [registrations] = await db
        .select({ count: count() })
        .from(passRegistrations)
        .where(eq(passRegistrations.passId, passId));

    const [messages] = await db
        .select({ count: count() })
        .from(passMessages)
        .where(eq(passMessages.passId, passId));

    const [pass] = await db
        .select({ createdAt: passes.createdAt })
        .from(passes)
        .where(eq(passes.id, passId));

    return {
        installs: installs?.count ?? 0,
        registrations: registrations?.count ?? 0,
        messages: messages?.count ?? 0,
        createdAt: pass?.createdAt
    };
}