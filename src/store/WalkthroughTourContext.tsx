import { PropsWithChildren, createContext, useCallback, useContext, useMemo, useState } from 'react';

import { WalkthroughTourStep, walkthroughTourSteps } from '../data/walkthroughTour';

type WalkthroughTourState = {
  currentIndex: number;
  currentStep: WalkthroughTourStep;
  isReplay: boolean;
  isTourActive: boolean;
  totalSteps: number;
  endTour: () => void;
  nextStep: () => void;
  previousStep: () => void;
  startTour: (options?: { replay?: boolean }) => void;
};

const WalkthroughTourContext = createContext<WalkthroughTourState | undefined>(undefined);

export function WalkthroughTourProvider({ children }: PropsWithChildren) {
  const [isTourActive, setIsTourActive] = useState(false);
  const [isReplay, setIsReplay] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const startTour = useCallback((options?: { replay?: boolean }) => {
    setCurrentIndex(0);
    setIsReplay(options?.replay ?? false);
    setIsTourActive(true);
  }, []);

  const endTour = useCallback(() => {
    setIsTourActive(false);
    setCurrentIndex(0);
    setIsReplay(false);
  }, []);

  const nextStep = useCallback(() => {
    setCurrentIndex((index) => Math.min(index + 1, walkthroughTourSteps.length - 1));
  }, []);

  const previousStep = useCallback(() => {
    setCurrentIndex((index) => Math.max(index - 1, 0));
  }, []);

  const value = useMemo<WalkthroughTourState>(
    () => ({
      currentIndex,
      currentStep: walkthroughTourSteps[currentIndex],
      isReplay,
      isTourActive,
      totalSteps: walkthroughTourSteps.length,
      endTour,
      nextStep,
      previousStep,
      startTour,
    }),
    [currentIndex, endTour, isReplay, isTourActive, nextStep, previousStep, startTour],
  );

  return <WalkthroughTourContext.Provider value={value}>{children}</WalkthroughTourContext.Provider>;
}

export function useWalkthroughTour() {
  const context = useContext(WalkthroughTourContext);

  if (!context) {
    throw new Error('useWalkthroughTour must be used inside WalkthroughTourProvider');
  }

  return context;
}
