import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import Chatbot from "./_components/chatbot";
import DashboardTopNav from "./_components/navbar";
import DashboardSideBar from "./_components/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {

  const { has } = await auth()

  const hasBasicPlan = has({ plan: 'basic_plan' })
  const hasPremiumPlan = has({ plan: 'premium_plan' })

  if (!hasBasicPlan && !hasPremiumPlan) {
    redirect('/pricing')
  }

  return (
    <div className="flex h-screen overflow-hidden w-full">
      <DashboardSideBar />
      <main className="flex-1 overflow-y-auto">
        <DashboardTopNav>{children}</DashboardTopNav>
      </main>
      <Chatbot />
    </div>
  );
}