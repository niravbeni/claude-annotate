'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface PlaybackContextType {
  isPlaybackActive: boolean;
  currentStep: number;
  togglePlayback: () => void;
  setStep: (step: number) => void;
  resetPlayback: () => void;
}

const PlaybackContext = createContext<PlaybackContextType | undefined>(undefined);

export function PlaybackProvider({ children }: { children: ReactNode }) {
  const [isPlaybackActive, setIsPlaybackActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Check if we should auto-start playback after reload
  useEffect(() => {
    const shouldAutoStart = sessionStorage.getItem('playbackActive') === 'true';
    if (shouldAutoStart) {
      console.log('[Playback] Auto-starting after reload');
      setIsPlaybackActive(true);
      setCurrentStep(1);
    }
  }, []);

  const togglePlayback = () => {
    if (isPlaybackActive) {
      // Stop playback and reload page to reset everything
      console.log('[Playback] Stopping playback and reloading page');
      sessionStorage.removeItem('playbackActive');
      window.location.reload();
    } else {
      // Start playback and mark in session storage
      sessionStorage.setItem('playbackActive', 'true');
      setIsPlaybackActive(true);
      setCurrentStep(1);
    }
  };

  const setStep = (step: number) => {
    setCurrentStep(step);
  };

  const resetPlayback = () => {
    setCurrentStep(0);
  };

  return (
    <PlaybackContext.Provider
      value={{
        isPlaybackActive,
        currentStep,
        togglePlayback,
        setStep,
        resetPlayback,
      }}
    >
      {children}
    </PlaybackContext.Provider>
  );
}

export function usePlayback() {
  const context = useContext(PlaybackContext);
  if (context === undefined) {
    throw new Error('usePlayback must be used within a PlaybackProvider');
  }
  return context;
}

