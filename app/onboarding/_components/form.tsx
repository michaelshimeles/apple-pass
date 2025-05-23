"use client";
import { Step1 } from "./step1form";
import { Step2 } from "./step2form";
import { useState } from "react";

export default function Form() {
  const [step, setStep] = useState(0);
  const totalSteps = 3;

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

  const steps = [
    <Step1 key="intro" onNext={nextStep} />,
    <Step2 key="complete" prevStep={prevStep} />,
  ];

  return <>{steps[step]}</>;
}
