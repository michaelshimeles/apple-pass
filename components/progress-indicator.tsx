"use client"

import { motion } from "framer-motion"

interface ProgressIndicatorProps {
  currentStep: number
  totalSteps: number
}

export default function ProgressIndicator({ currentStep, totalSteps }: ProgressIndicatorProps) {
  return (
    <div className="w-full flex justify-center mb-2">
      <div className="flex items-center gap-2">
        {Array.from({ length: totalSteps + 1 }).map((_, index) => (
          <motion.div
            key={index}
            className={`rounded-full transition-all duration-300 ${
              index === currentStep
                ? "w-8 h-2 bg-primary"
                : index < currentStep
                  ? "w-2 h-2 bg-primary"
                  : "w-2 h-2 bg-muted"
            }`}
            initial={false}
            animate={{
              width: index === currentStep ? 32 : 8,
              opacity: 1,
            }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          />
        ))}
      </div>
    </div>
  )
}
