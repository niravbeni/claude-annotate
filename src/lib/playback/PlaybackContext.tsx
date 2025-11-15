'use client';

import { createContext, useContext, useState, useEffect, useLayoutEffect, ReactNode } from 'react';
import { useAppStore } from '@/lib/store';

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
  const setText = useAppStore((state) => state.setText);

  // Use layoutEffect to clear text BEFORE paint to prevent flash
  useLayoutEffect(() => {
    const isInLoop = sessionStorage.getItem('playbackInLoop') === 'true';
    
    if (isInLoop) {
      // Clear text immediately before browser paints to prevent flash
      setText('');
    }
  }, [setText]);

  // Check if we should auto-start playback after reload (only if in loop, not on first load)
  useEffect(() => {
    const shouldAutoStart = sessionStorage.getItem('playbackActive') === 'true';
    const isInLoop = sessionStorage.getItem('playbackInLoop') === 'true';
    
    if (shouldAutoStart && isInLoop) {
      console.log('[Playback] Auto-starting after reload (in loop)');
      // Text already cleared by layoutEffect
      // Start playback immediately
      setIsPlaybackActive(true);
      setCurrentStep(1);
    } else if (shouldAutoStart && !isInLoop) {
      // Clean up stale sessionStorage if not in loop
      console.log('[Playback] Cleaning up stale playback session');
      sessionStorage.removeItem('playbackActive');
    }
  }, []);

  const togglePlayback = () => {
    if (isPlaybackActive) {
      // Stop playback and reload page to reset everything
      console.log('[Playback] Stopping playback and reloading page');
      sessionStorage.removeItem('playbackActive');
      sessionStorage.removeItem('playbackInLoop');
      window.location.reload();
    } else {
      // Start playback and mark in session storage
      console.log('[Playback] Starting playback - clearing text');
      setText(''); // Clear text before starting playback
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

