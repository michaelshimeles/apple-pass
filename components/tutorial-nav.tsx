"use client"

import { motion } from "framer-motion"

interface TutorialNavProps {
  currentStep: number
  steps: string[]
  goToStep: (step: number) => void
}

export default function TutorialNav({ currentStep, steps, goToStep }: TutorialNavProps) {
  return (
    <div className="w-full flex justify-center mb-8 mt-4">
      <div className="flex items-center gap-4 overflow-x-auto pb-2 max-w-full">
        {steps.map((step, index) => (
          <button
            key={index}
            onClick={() => goToStep(index)}
            className="relative flex flex-col items-center"
            disabled={index > currentStep}
          >
            <motion.div
              className={`
                w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium border-2
                ${
                  index === currentStep
                    ? "bg-primary text-primary-foreground border-primary"
                    : index < currentStep
                      ? "bg-primary/20 text-primary border-primary/30"
                      : "bg-muted text-muted-foreground border-border"
                }
                ${index > currentStep ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
              `}
              whileHover={index <= currentStep ? { scale: 1.05 } : {}}
              whileTap={index <= currentStep ? { scale: 0.95 } : {}}
            >
              {index + 1}
            </motion.div>
            <span
              className={`
              text-xs mt-1 whitespace-nowrap
              ${index === currentStep ? "text-foreground font-medium" : "text-muted-foreground"}
            `}
            >
              {step}
            </span>
            {index < steps.length - 1 && (
              <div
                className={`
                absolute top-4 left-full w-4 h-0.5 -translate-y-1/2
                ${index < currentStep ? "bg-primary" : "bg-muted"}
              `}
                style={{ width: "calc(100% - 2rem)" }}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
