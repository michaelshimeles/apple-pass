import { activeSubscription } from "@/lib/helper/active-subscription";
import PricingTable from "./_component/pricing-table";
import { redirect } from "next/navigation";

export default async function PricingPage() {
  const subscription = await activeSubscription();

  if (subscription) {
    redirect("/dashboard");
  }

  return <PricingTable />;
}
