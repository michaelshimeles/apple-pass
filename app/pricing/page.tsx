"use client";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth/auth-client";
export default function PricingPage() {
  return (
    <section className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-semibold tracking-tight mb-4">
        Subscribe to get started
      </h1>
      <div className="mt-[1rem]">
        <Button
          onClick={async () => {
            const organizationId = (await authClient.organization.list())
              ?.data?.[0]?.id;
            await authClient.checkout({
              // Any Polar Product ID can be passed here
              products: ["e464123f-2fb7-4d84-9a2d-d94034da1f14"],
              // Or, if you setup "products" in the Checkout Config, you can pass the slug
              slug: "Exodus-Labs",
              // Reference ID will be saved as `referenceId` in the metadata of the checkout, order & subscription object
              referenceId: organizationId,
            });
          }}
        >
          Subscribe
        </Button>
      </div>
    </section>
  );
}
