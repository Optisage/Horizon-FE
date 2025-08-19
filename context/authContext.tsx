"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface AuthStepContextType {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const AuthStepContext = createContext<AuthStepContextType | undefined>(undefined);

export const AuthStepProvider = ({ children }: { children: ReactNode }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const nextStep = () => setCurrentStep((prev) => prev + 1);
  const prevStep = () => setCurrentStep((prev) => Math.max(0, prev - 1));

  return (
    <AuthStepContext.Provider
      value={{
        currentStep,
        setCurrentStep,
        nextStep,
        prevStep,
      }}
    >
      {children}
    </AuthStepContext.Provider>
  );
};

export const useAuthStep = () => {
  const context = useContext(AuthStepContext);
  if (context === undefined) {
    throw new Error("useAuthStep must be used within an AuthStepProvider");
  }
  return context;
};