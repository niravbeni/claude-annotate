import { create } from 'zustand';
import { AppState, Annotation, BrowserReference } from '@/types';
import { ChatMessage, SavedAnnotationWithChat } from '@/types/chat';
import { DEFAULT_TEXT } from './constants';

// Helper function to get annotation priority (lower number = higher priority)
const getAnnotationPriority = (type: string): number => {
  switch (type) {
    case 'circle': // Discrepancy
      return 1;
    case 'squiggle-correction':
    case 'squiggle-suggestion': // Uncertainty
      return 2;
    case 'heart': // Authenticity
      return 3;
    default:
      return 4;
  }
};

// Helper function to sort annotation IDs by priority
const sortAnnotationIdsByPriority = (ids: string[], annotations: Annotation[]): string[] => {
  return [...ids].sort((idA, idB) => {
    const annotationA = annotations.find(a => a.id === idA);
    const annotationB = annotations.find(a => a.id === idB);
    
    if (!annotationA || !annotationB) return 0;
    
    return getAnnotationPriority(annotationA.type) - getAnnotationPriority(annotationB.type);
  });
};

export const useAppStore = create<AppState>((set) => ({
  // Initial state
  text: DEFAULT_TEXT,
  isEditing: false,
  isAnalyzing: false,
  textEditHistory: [],
  annotations: [],
  annotationsVisible: true,
  activeAnnotationId: null,
  overlappingAnnotationIds: [],
  pinnedAnnotationId: null,
  commentHistory: [], // Deprecated but kept for compatibility
  annotationChats: {},
  savedAnnotations: [],
  activeBrowserReference: null,
  isBrowserModalFullscreen: false,
  browserModalPosition: null,

  // Actions
  setText: (text) =>
    set((state) => {
      // Find which annotations are affected by the text change
      const oldText = state.text;
      const newText = text;
      
      // Track text edit history (keep last 10 edits for context)
      const newHistory = oldText !== newText 
        ? [oldText, ...state.textEditHistory].slice(0, 10)
        : state.textEditHistory;
      
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
        textEditHistory: newHistory,
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

  // New annotation interaction actions
  setActiveAnnotation: (id, overlappingIds) =>
    set((state) => {
      // If overlappingIds is provided, update it; otherwise keep the existing one
      const updates: Partial<AppState> = {
        activeAnnotationId: id,
      };
      
      if (overlappingIds !== undefined) {
        // Sort overlapping IDs by priority (discrepancy > uncertainty > authenticity)
        const sortedIds = overlappingIds.length > 0 
          ? sortAnnotationIdsByPriority(overlappingIds, state.annotations)
          : (id ? [id] : []);
        updates.overlappingAnnotationIds = sortedIds;
        
        // If we have sorted IDs, set the first (highest priority) as active
        if (sortedIds.length > 0) {
          updates.activeAnnotationId = sortedIds[0];
        }
      }
      
      return updates;
    }),

  setPinnedAnnotation: (id, overlappingIds = []) =>
    set((state) => {
      // Sort overlapping IDs by priority (discrepancy > uncertainty > authenticity)
      const sortedIds = overlappingIds.length > 0 
        ? sortAnnotationIdsByPriority(overlappingIds, state.annotations)
        : (id ? [id] : []);
      
      return {
        pinnedAnnotationId: id,
        activeAnnotationId: id, // Also set as active when pinned
        overlappingAnnotationIds: sortedIds,
      };
    }),

  cycleOverlappingAnnotation: (direction) =>
    set((state) => {
      const { overlappingAnnotationIds, activeAnnotationId, pinnedAnnotationId } = state;
      
      // Only cycle if there are multiple overlapping annotations
      if (overlappingAnnotationIds.length <= 1) return state;
      
      const currentIndex = overlappingAnnotationIds.findIndex(
        id => id === (pinnedAnnotationId || activeAnnotationId)
      );
      
      let nextIndex;
      if (direction === 'next') {
        nextIndex = (currentIndex + 1) % overlappingAnnotationIds.length;
      } else {
        nextIndex = currentIndex - 1 < 0 ? overlappingAnnotationIds.length - 1 : currentIndex - 1;
      }
      
      const nextId = overlappingAnnotationIds[nextIndex];
      
      // If there's a pinned annotation, update it; otherwise just update active
      if (pinnedAnnotationId) {
        return {
          pinnedAnnotationId: nextId,
          activeAnnotationId: nextId,
        };
      } else {
        return {
          activeAnnotationId: nextId,
        };
      }
    }),

  // Chat actions
  addChatMessage: (annotationId, message) =>
    set((state) => ({
      annotationChats: {
        ...state.annotationChats,
        [annotationId]: [
          ...(state.annotationChats[annotationId] || []),
          message,
        ],
      },
    })),

  clearAnnotationChat: (annotationId) =>
    set((state) => ({
      annotationChats: {
        ...state.annotationChats,
        [annotationId]: [],
      },
    })),

  saveAnnotationWithChat: (annotationId) =>
    set((state) => {
      const annotation = state.annotations.find(a => a.id === annotationId);
      if (!annotation) return state;

      const chat = state.annotationChats[annotationId] || [];
      const savedItem: SavedAnnotationWithChat = {
        annotation,
        chat,
        savedAt: new Date(),
      };

      return {
        savedAnnotations: [savedItem, ...state.savedAnnotations],
      };
    }),

  loadSavedAnnotation: (index) =>
    set((state) => {
      const saved = state.savedAnnotations[index];
      if (!saved) return state;

      return {
        activeAnnotationId: saved.annotation.id,
        pinnedAnnotationId: saved.annotation.id,
        overlappingAnnotationIds: [saved.annotation.id],
        annotationChats: {
          ...state.annotationChats,
          [saved.annotation.id]: saved.chat,
        },
      };
    }),

  deleteSavedAnnotation: (index) =>
    set((state) => ({
      savedAnnotations: state.savedAnnotations.filter((_, i) => i !== index),
    })),
}));

