import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import Link from "next/link";
import { CreatePassForm } from "../_components/form";
import { SubscriptionGate } from "../_components/subscription-gate";
import { JoinOrgDialog } from "./_components/join-org-dialog";

export default async function Create() {
  const result = await auth.api.getSession({
    headers: await headers(),
  });
  return (
    <div className="flex flex-col justify-center items-start w-full p-6">
      <div className="flex flex-col items-start justify-center gap-2 mb-4">
        <h1 className="text-3xl font-semibold tracking-tight">Pass Builder</h1>
        <p className="text-muted-foreground">
          Create your first Apple Pass to get started.
        </p>
      </div>
      {result ? (
        result.session.activeOrganizationId ? (
          <SubscriptionGate feature="pass creation">
            <CreatePassForm
              organizationId={result.session.activeOrganizationId}
            />
          </SubscriptionGate>
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-8 border rounded-lg bg-muted/30 h-[83vh] w-full">
            <h3 className="text-lg font-semibold mb-2">
              You don&apos;t have an organization
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              You need to be part of an organization to create Apple Passes
            </p>
            <div className="flex gap-3">
              <Link prefetch={true} href="/onboarding">
                <Button>Create Org</Button>
              </Link>
              <JoinOrgDialog />
            </div>
          </div>
        )
      ) : (
        <div className="flex flex-col items-center justify-center text-center p-8 border rounded-lg bg-muted/30">
          <h3 className="text-lg font-semibold mb-2">
            Authentication required
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Please sign in to create Apple Passes
          </p>
          <Link prefetch={true} href="/sign-in">
            <Button>Sign In</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
