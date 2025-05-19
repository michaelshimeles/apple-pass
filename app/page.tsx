import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <section className="flex flex-col items-center justify-center min-h-screen">
      <div className="mx-auto max-w-5xl px-6">
        <div className="text-center">
          <h2 className="text-balance text-4xl font-semibold lg:text-5xl">
            Lockscreen AI
          </h2>
          <p className="mt-4">
            Generate an Apple Pass for your community with just a few clicks.
          </p>

          <div className="mt-4 flex flex-wrap justify-center gap-4">
            <Button asChild>
              <Link href="/dashboard" prefetch={true}>
                <span>Dashboard</span>
              </Link>
            </Button>

            <Button asChild variant="outline">
              <Link href="/dashboard/create" prefetch={true}>
                <span>Create Pass</span>
              </Link>
            </Button>
          </div>
        </div>
        <img src="/images/hero.png" className="h-100" />
      </div>
    </section>
  );
}
