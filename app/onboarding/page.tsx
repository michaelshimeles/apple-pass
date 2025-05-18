"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TutorialIntro from "@/components/tutorial-intro";
import FeatureOne from "@/components/feature-one";
import FeatureTwo from "@/components/feature-two";
import FeatureThree from "@/components/feature-three";
import TutorialCompletion from "@/components/tutorial-completion";
import ProgressIndicator from "@/components/progress-indicator";
import TutorialNav from "@/components/tutorial-nav";

export default function TutorialFlow() {
  const [step, setStep] = useState(0);
  const [preferences, setPreferences] = useState<string[]>([]);

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

  const updatePreferences = (newPreferences: string[]) => {
    setPreferences(newPreferences);
  };

  const steps = [
    <TutorialIntro key="intro" onNext={nextStep} />,
    <FeatureOne key="feature1" onNext={nextStep} onBack={prevStep} />,
    <FeatureTwo key="feature2" onNext={nextStep} onBack={prevStep} />,
    <FeatureThree
      key="feature3"
      preferences={preferences}
      updatePreferences={updatePreferences}
      onNext={nextStep}
      onBack={prevStep}
    />,
    <TutorialCompletion key="completion" preferences={preferences} />,
  ];

  const stepTitles = [
    "Welcome",
    "Workspace",
    "Collaboration",
    "Personalization",
    "Complete",
  ];

  return (
    <div
      className={`flex justify-center items-start min-h-screen bg-background`}
    >
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-4 py-8">
        <ProgressIndicator currentStep={step} totalSteps={totalSteps - 1} />

        <TutorialNav
          currentStep={step}
          steps={stepTitles}
          goToStep={goToStep}
        />

        <div className="flex-1 flex items-center justify-center py-8">
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
