import { create } from 'zustand';
import { AppState, Annotation, BrowserReference } from '@/types';
import { DEFAULT_TEXT } from './constants';
import { toast } from 'sonner';

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
    set((state) => {
      // Find which annotations are affected by the text change
      const oldText = state.text;
      const newText = text;
      
      // Find the range of changed text
      let changeStart = 0;
      let changeEnd = Math.max(oldText.length, newText.length);
      
      // Find where the text starts to differ
      while (changeStart < Math.min(oldText.length, newText.length) && 
             oldText[changeStart] === newText[changeStart]) {
        changeStart++;
      }
      
      // Find where the text ends being different (working backwards)
      let oldEnd = oldText.length - 1;
      let newEnd = newText.length - 1;
      while (oldEnd >= changeStart && newEnd >= changeStart && 
             oldText[oldEnd] === newText[newEnd]) {
        oldEnd--;
        newEnd--;
      }
      changeEnd = oldEnd + 1;
      
      // Remove annotations that overlap with the changed region
      const validAnnotations = state.annotations.filter(ann => {
        // Keep annotation if it doesn't overlap with changed region
        return ann.endIndex <= changeStart || ann.startIndex >= changeEnd;
      });
      
      const removedCount = state.annotations.length - validAnnotations.length;
      if (removedCount > 0) {
        console.log(`📝 ${removedCount} annotation(s) removed due to text edit (still in history)`);
        toast.info(`${removedCount} annotation(s) removed from view (saved in history)`);
      }
      
      return {
        text,
        isEditing: true,
        annotations: validAnnotations,
      };
    }),

  startAnalysis: () =>
    set({
      isAnalyzing: true,
      isEditing: false,
    }),

  finishAnalysis: (annotations) =>
    set((state) => ({
      isAnalyzing: false,
      isEditing: false,
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

