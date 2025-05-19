"use client";

import { motion } from "framer-motion";
import {
  ChevronRight,
  ChevronLeft,
  BarChart3,
  LineChart,
  PieChart,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface AnalyticsStepProps {
  onNext: () => void;
  onBack: () => void;
}

export default function AnalyticsStep({ onNext, onBack }: AnalyticsStepProps) {
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
          variants={item}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4 w-fit"
        >
          <BarChart3 className="h-3.5 w-3.5" />
          <span>Analytics</span>
        </motion.div>

        <motion.h2 variants={item} className="text-2xl font-medium mb-3">
          Track Performance with Analytics
        </motion.h2>

        <motion.p
          variants={item}
          className="text-muted-foreground text-sm mb-6"
        >
          Access detailed analytics on message delivery and pass installations.
        </motion.p>

        <motion.div
          variants={item}
          className="space-y-4 mb-6 bg-muted/50 rounded-lg p-4 border border-border"
        >
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="flex items-start gap-3"
          >
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <BarChart3 className="h-3 w-3 text-primary" />
            </div>
            <div>
              <p className="text-sm">
                Navigate to the Analytics tab and select the pass from the
                dropdown in the top right corner.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            className="flex items-start gap-3"
          >
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <LineChart className="h-3 w-3 text-primary" />
            </div>
            <div>
              <p className="text-sm">
                You&apos;ll see how many passes have been installed, how many
                are still active, and how many messages have been sent.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.4 }}
            className="flex items-start gap-3"
          >
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <PieChart className="h-3 w-3 text-primary" />
            </div>
            <div>
              <p className="text-sm">
                Use these insights to optimize your messaging strategy and
                improve engagement with your audience.
              </p>
            </div>
          </motion.div>
        </motion.div>

        <motion.div variants={item} className="flex justify-between pt-4">
          <Button
            type="button"
            onClick={onBack}
            variant="ghost"
            className="rounded-full text-sm"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>

          <Button
            onClick={onNext}
            className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 text-sm"
          >
            Complete Tutorial
            <ChevronRight className="h-4 w-4" />
          </Button>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="bg-muted rounded-xl p-6 aspect-square max-w-sm mx-auto flex items-center justify-center border border-border"
      >
        <div className="relative w-full h-full">
          {/* Analytics Dashboard UI Preview */}
          <div className="absolute inset-4 rounded-lg bg-background border border-border shadow-md overflow-hidden">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.4 }}
              className="h-8 bg-secondary flex items-center px-3 justify-between"
            >
              <div className="text-xs font-medium">Analytics Dashboard</div>
              <div className="text-xs text-primary">My Brand Pass ▾</div>
            </motion.div>

            <div className="p-3">
              {/* Summary Cards */}
              <motion.div
                className="grid grid-cols-2 gap-2 mb-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.4 }}
              >
                <div className="bg-muted/30 border border-border rounded-md p-2">
                  <div className="text-[10px] text-muted-foreground mb-1">
                    Total Passes
                  </div>
                  <div className="text-sm font-medium">1,248</div>
                </div>
                <div className="bg-muted/30 border border-border rounded-md p-2">
                  <div className="text-[10px] text-muted-foreground mb-1">
                    Active Passes
                  </div>
                  <div className="text-sm font-medium">1,156</div>
                </div>
                <div className="bg-muted/30 border border-border rounded-md p-2">
                  <div className="text-[10px] text-muted-foreground mb-1">
                    Messages Sent
                  </div>
                  <div className="text-sm font-medium">24</div>
                </div>
                <div className="bg-muted/30 border border-border rounded-md p-2">
                  <div className="text-[10px] text-muted-foreground mb-1">
                    Avg. Open Rate
                  </div>
                  <div className="text-sm font-medium">92%</div>
                </div>
              </motion.div>

              {/* Chart */}
              <motion.div
                className="border border-border rounded-md p-2 mb-4 h-32"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.4 }}
              >
                <div className="text-xs font-medium mb-2">
                  Pass Installations
                </div>
                <div className="h-20 flex items-end gap-1">
                  <div
                    className="flex-1 bg-primary/20 rounded-sm"
                    style={{ height: "30%" }}
                  ></div>
                  <div
                    className="flex-1 bg-primary/20 rounded-sm"
                    style={{ height: "40%" }}
                  ></div>
                  <div
                    className="flex-1 bg-primary/20 rounded-sm"
                    style={{ height: "35%" }}
                  ></div>
                  <div
                    className="flex-1 bg-primary/20 rounded-sm"
                    style={{ height: "50%" }}
                  ></div>
                  <div
                    className="flex-1 bg-primary/20 rounded-sm"
                    style={{ height: "65%" }}
                  ></div>
                  <div
                    className="flex-1 bg-primary/20 rounded-sm"
                    style={{ height: "75%" }}
                  ></div>
                  <div
                    className="flex-1 bg-primary/40 rounded-sm"
                    style={{ height: "90%" }}
                  ></div>
                </div>
              </motion.div>

              {/* Recent Messages */}
              <motion.div
                className="border border-border rounded-md p-2"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.4 }}
              >
                <div className="text-xs font-medium mb-2">Recent Messages</div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="text-[10px]">Special offer: 20% off...</div>
                    <div className="text-[10px] text-muted-foreground">
                      Today
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-[10px]">
                      New product announcement...
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      Yesterday
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
