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
  browserModalPosition: null,

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
    set((state) => {
      // Only add annotations that aren't already in history based on content
      // Create a key for each annotation based on its content
      const getAnnotationKey = (ann: Annotation) => 
        `${ann.type}|${ann.annotatedText}|${ann.comment}|${ann.startIndex}|${ann.endIndex}`;
      
      const existingKeys = new Set(state.commentHistory.map(getAnnotationKey));
      const newAnnotations = annotations
        .filter(a => !existingKeys.has(getAnnotationKey(a)))
        .map((a) => ({ ...a, timestamp: new Date() }));
      
      return {
        isAnalyzing: false,
        isEditing: false,
        annotations,
        commentHistory: [
          ...newAnnotations,
          ...state.commentHistory,
        ],
      };
    }),

  toggleAnnotations: () =>
    set((state) => ({
      annotationsVisible: !state.annotationsVisible,
    })),

  openBrowserModal: (reference, position) =>
    set({
      activeBrowserReference: reference,
      browserModalPosition: position,
      isBrowserModalFullscreen: false,
    }),

  closeBrowserModal: () =>
    set({
      activeBrowserReference: null,
      browserModalPosition: null,
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

  deleteAnnotationFromHistory: (id) =>
    set((state) => ({
      commentHistory: state.commentHistory.filter((ann) => ann.id !== id),
    })),

  toggleBookmarkAnnotation: (id) =>
    set((state) => ({
      commentHistory: state.commentHistory.map((ann) =>
        ann.id === id ? { ...ann, bookmarked: !ann.bookmarked } : ann
      ),
    })),

  clearHistory: () =>
    set({
      commentHistory: [],
    }),
}));

