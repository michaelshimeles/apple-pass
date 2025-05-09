import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { CreatePassForm } from "../dashboard/_components/form";
import ModeToggle from "../dashboard/_components/mode-toggle";

export default async function Dashboard() {

    const { has } = await auth()

    const hasBasicPlan = has({ plan: 'basic_plan' })
    const hasPremiumPlan = has({ plan: 'premium_plan' })
  
    if (!hasBasicPlan && !hasPremiumPlan) {
      redirect('/pricing')
    }
  
    
    return (
        <div className="flex flex-col justify-center items-center w-full h-screen p-3">
            <div className="flex items-center justify-between w-full max-w-5xl">
                <h1 className="text-3xl font-semibold tracking-tight mb-4">Apple Pass Builder</h1>
                <ModeToggle />
            </div>
            <CreatePassForm />
        </div>
    );
}