"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { authClient } from "@/lib/auth/auth-client";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function PricingTable() {
  const router = useRouter();
  const handleCheckout = async (productId: string, slug: string) => {
    try {
      const orgResponse = await authClient.organization.list();
      const organizationId = orgResponse?.data?.[0]?.id;

      if (!organizationId) {
        router.push("/onboarding");
        return; // Critical: prevent checkout from proceeding
      }

      await authClient.checkout({
        products: [productId],
        slug: slug,
        referenceId: organizationId,
      });
    } catch (error) {
      console.error("Checkout failed:", error);
      // TODO: Add user-facing error notification
      toast.error("Oops, something went wrong");
    }
  };

  const STARTER_TIER = process.env.NEXT_PUBLIC_STARTER_TIER;
	const STARTER_SLUG = process.env.NEXT_PUBLIC_STARTER_SLUG;
	
	if (!STARTER_TIER || !STARTER_SLUG) {
		throw new Error(
			"Missing required environment variables for Starter tier"
		);
	}

  const PROFESSIONAL_TIER = process.env.NEXT_PUBLIC_PROFESSIONAL_TIER;
	const PROFESSIONAL_SLUG = process.env.NEXT_PUBLIC_PROFESSIONAL_SLUG;
	
	if (!PROFESSIONAL_TIER || !PROFESSIONAL_SLUG) {
	  throw new Error(
	    "Missing required environment variables for Professional tier"
	  );
	}

  return (
    <section className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Simple, transparent pricing
        </h1>
        <p className="text-xl text-muted-foreground">
          Choose the plan that fits your needs
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl w-full">
        {/* Starter Tier */}
        <Card className="relative h-fit">
          <CardHeader>
            <CardTitle className="text-2xl">Starter</CardTitle>
            <CardDescription>Perfect for getting started</CardDescription>
            <div className="mt-4">
              <span className="text-4xl font-bold">$99</span>
              <span className="text-muted-foreground">/month</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Check className="h-5 w-5 text-green-500" />
              <span>1 Pass per month</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="h-5 w-5 text-green-500" />
              <span>Up to 15K passes limit</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="h-5 w-5 text-green-500" />
              <span>1 seat per workspace</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="h-5 w-5 text-green-500" />
              <span>Email support</span>
            </div>
            <div className="flex items-start gap-3">
              <Check className="h-5 w-5 text-green-500 mt-0.5" />
              <span className="text-sm text-muted-foreground">
                &ldquo;Powered by Lockscreen AI&rdquo; watermark on passes
              </span>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              onClick={() =>
                handleCheckout(
                  STARTER_TIER,
                  STARTER_SLUG,
                )
              }
            >
              Get Started
            </Button>
          </CardFooter>
        </Card>

        {/* Professional Tier */}
        <Card className="relative border-primary">
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
              Most Popular
            </span>
          </div>
          <CardHeader>
            <CardTitle className="text-2xl">Professional</CardTitle>
            <CardDescription>For growing businesses</CardDescription>
            <div className="mt-4">
              <span className="text-4xl font-bold">$499</span>
              <span className="text-muted-foreground">/month</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Check className="h-5 w-5 text-green-500" />
              <span>5 Passes per month</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="h-5 w-5 text-green-500" />
              <span>150K push notifications per month</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="h-5 w-5 text-green-500" />
              <span>3 seats per organization</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="h-5 w-5 text-green-500" />
              <span>Priority support</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="h-5 w-5 text-green-500" />
              <span className="font-medium">No branding watermark</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              onClick={() =>
                handleCheckout(
                  PROFESSIONAL_TIER,
                  PROFESSIONAL_SLUG,
                )
              }
            >
              Get Started
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-12 text-center">
        <p className="text-muted-foreground">
          Need a custom plan?{" "}
          <span className="text-primary cursor-pointer hover:underline">
            Contact us
          </span>
        </p>
      </div>
    </section>
  );
}
