"use client";

import { motion } from "framer-motion";
import {
  CheckCircle,
  ArrowRight,
  Bell,
  CreditCard,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function TutorialCompletion() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <div className="grid md:grid-cols-2 gap-8 items-center">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="flex flex-col"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle className="h-8 w-8 text-primary-foreground" />
        </motion.div>

        <motion.h2
          variants={item}
          className="text-2xl font-medium mb-3 text-center"
        >
          Tutorial Complete!
        </motion.h2>

        <motion.p
          variants={item}
          className="text-muted-foreground text-sm mb-6 text-center"
        >
          You&apos;re now ready to start using the product. We&apos;ve saved
          your preferences and you can get started right away.
        </motion.p>

        <motion.div
          variants={item}
          className="bg-muted/50 rounded-lg p-4 mb-6 border border-border"
        >
          <h3 className="text-sm font-medium mb-3">
            What You&apos;ve Learned:
          </h3>
          <div className="space-y-3">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.3 }}
              className="flex items-start gap-2"
            >
              <CreditCard className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <span className="text-sm">
                How to create a branded pass for your customers
              </span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.3 }}
              className="flex items-start gap-2"
            >
              <Bell className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <span className="text-sm">
                How to send instant notifications to your audience
              </span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.3 }}
              className="flex items-start gap-2"
            >
              <BarChart3 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <span className="text-sm">
                How to track performance with detailed analytics
              </span>
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          variants={item}
          className="space-y-3 mb-6 border border-border rounded-lg p-4 bg-muted/30"
        >
          <h3 className="text-sm font-medium">What&apos;s Next?</h3>
          <ul className="space-y-2 text-sm">
            <motion.li
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.3 }}
              className="flex items-start gap-2"
            >
              <ArrowRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <span>
                Create your first pass and customize it with your branding
              </span>
            </motion.li>
            <motion.li
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.3 }}
              className="flex items-start gap-2"
            >
              <ArrowRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <span>
                Share your pass with customers to start building your audience
              </span>
            </motion.li>
            <motion.li
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.3 }}
              className="flex items-start gap-2"
            >
              <ArrowRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <span>
                Send your first notification to engage with your audience
              </span>
            </motion.li>
          </ul>
        </motion.div>

        <motion.div variants={item} className="flex justify-end">
          <Link href="/dashboard/create">
            <Button className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 text-sm w-fit mx-auto">
              Get Started
            </Button>
          </Link>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="bg-muted rounded-xl p-6 aspect-square max-w-sm mx-auto flex items-center justify-center border border-border"
      >
        <div className="relative w-full h-full">
          {/* Dashboard Preview */}
          <div className="absolute inset-4 rounded-lg bg-background border border-border shadow-md overflow-hidden">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.4 }}
              className="h-8 bg-secondary flex items-center px-3"
            >
              <div className="text-xs font-medium">Lockscreen AI Dashboard</div>
            </motion.div>

            <div className="p-3">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.4 }}
                className="flex items-center justify-between mb-4"
              >
                <div className="h-5 w-32 bg-foreground/80 rounded"></div>
                <div className="flex gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xs text-primary">+</span>
                  </div>
                </div>
              </motion.div>

              {/* Dashboard Content */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <motion.div
                  className="aspect-video bg-primary/10 rounded-md p-2 flex flex-col justify-between border border-primary/20"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.4 }}
                >
                  <CreditCard className="h-4 w-4 text-primary/70" />
                  <div className="text-xs font-medium">Passes</div>
                </motion.div>

                <motion.div
                  className="aspect-video bg-chart-2/10 rounded-md p-2 flex flex-col justify-between border border-chart-2/20"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9, duration: 0.4 }}
                >
                  <Bell className="h-4 w-4 text-chart-2/70" />
                  <div className="text-xs font-medium">Notifications</div>
                </motion.div>

                <motion.div
                  className="aspect-video bg-chart-3/10 rounded-md p-2 flex flex-col justify-between border border-chart-3/20"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.0, duration: 0.4 }}
                >
                  <BarChart3 className="h-4 w-4 text-chart-3/70" />
                  <div className="text-xs font-medium">Analytics</div>
                </motion.div>

                <motion.div
                  className="aspect-video bg-chart-5/10 rounded-md p-2 flex flex-col justify-between border border-chart-5/20"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1, duration: 0.4 }}
                >
                  <div className="h-4 w-4 text-chart-5/70 flex items-center justify-center">
                    ⚙️
                  </div>
                  <div className="text-xs font-medium">Settings</div>
                </motion.div>
              </div>

              <motion.div
                className="h-20 bg-muted/50 rounded-md border border-border p-2"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.4 }}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="text-xs font-medium">Recent Activity</div>
                  <div className="text-[10px] text-primary">View All</div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <div className="text-[10px]">
                      Pass created: My Brand Pass
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      Just now
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-[10px]">Tutorial completed</div>
                    <div className="text-[10px] text-muted-foreground">
                      Just now
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
