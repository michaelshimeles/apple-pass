"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import WelcomeStep from "@/components/welcome-step";
import PassCreationStep from "@/components/pass-creation-step";
import NotificationsStep from "@/components/notifications-step";
import AnalyticsStep from "@/components/analytics-step";
import TutorialCompletion from "@/components/tutorial-completion";
import TutorialNav from "@/components/tutorial-nav";

export default function TutorialFlow() {
  const [step, setStep] = useState(0);
  const totalSteps = 5;

  const nextStep = () => {
    if (step < totalSteps - 1) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const goToStep = (index: number) => {
    if (index >= 0 && index < totalSteps) {
      setStep(index);
    }
  };

  const steps = [
    <WelcomeStep key="intro" onNext={nextStep} />,
    <PassCreationStep
      key="pass-creation"
      onNext={nextStep}
      onBack={prevStep}
    />,
    <NotificationsStep
      key="notifications"
      onNext={nextStep}
      onBack={prevStep}
    />,
    <AnalyticsStep key="analytics" onNext={nextStep} onBack={prevStep} />,
    <TutorialCompletion key="completion" />,
  ];

  const stepTitles = [
    "Welcome",
    "Create Pass",
    "Notifications",
    "Analytics",
    "Complete",
  ];

  return (
    <div className={`min-h-screen bg-background`}>
      <div className="flex flex-col max-w-4xl mx-auto w-full h-screen px-4 py-8">
        <TutorialNav
          currentStep={step}
          steps={stepTitles}
          goToStep={goToStep}
        />

        <div className="flex-1 flex items-center justify-center pb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="w-full"
            >
              {steps[step]}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
