import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { CreatePassForm } from "../_components/form";

export default async function Dashboard() {

    const { has } = await auth()

    const hasBasicPlan = has({ plan: 'basic_plan' })
    const hasPremiumPlan = has({ plan: 'premium_plan' })
  
    if (!hasBasicPlan && !hasPremiumPlan) {
      redirect('/pricing')
    }
  
    
    return (
        <div className="flex flex-col justify-center items-start w-full p-6">
            <div className="flex items-center justify-start w-full">
                <h1 className="text-3xl font-semibold tracking-tight mb-4">Pass Builder</h1>
            </div>
            <CreatePassForm />
        </div>
    );
}