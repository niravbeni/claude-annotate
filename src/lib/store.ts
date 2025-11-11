import { create } from 'zustand';
import { AppState, Annotation, BrowserReference } from '@/types';
import { DEFAULT_TEXT } from './constants';

export const useAppStore = create<AppState>((set) => ({
  // Initial state
  text: DEFAULT_TEXT,
  isEditing: false,
  isAnalyzing: false,
  annotations: [],
  annotationsVisible: true,
  commentHistory: [],
  activeBrowserReference: null,
  isBrowserModalFullscreen: false,

  // Actions
  setText: (text) =>
    set({
      text,
      isEditing: true,
      annotations: [], // Clear annotations when editing
    }),

  startAnalysis: () =>
    set({
      isAnalyzing: true,
      isEditing: false,
    }),

  finishAnalysis: (annotations) =>
    set((state) => ({
      isAnalyzing: false,
      annotations,
      commentHistory: [
        ...annotations.map((a) => ({ ...a, timestamp: new Date() })),
        ...state.commentHistory,
      ],
    })),

  toggleAnnotations: () =>
    set((state) => ({
      annotationsVisible: !state.annotationsVisible,
    })),

  openBrowserModal: (reference) =>
    set({
      activeBrowserReference: reference,
      isBrowserModalFullscreen: false,
    }),

  closeBrowserModal: () =>
    set({
      activeBrowserReference: null,
      isBrowserModalFullscreen: false,
    }),

  toggleBrowserFullscreen: () =>
    set((state) => ({
      isBrowserModalFullscreen: !state.isBrowserModalFullscreen,
    })),

  resetToDefault: () =>
    set({
      text: DEFAULT_TEXT,
      annotations: [],
      commentHistory: [],
      isEditing: false,
      isAnalyzing: false,
    }),
}));

