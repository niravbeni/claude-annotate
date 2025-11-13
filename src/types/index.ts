// Core data structures
export interface BrowserReference {
  sourceTitle: string;
  sourceUrl: string;
  quoteBefore: string;
  quoteHighlighted: string;
  quoteAfter: string;
  claudeNote: string;
}

export interface Annotation {
  id: string; // Generated client-side
  type: 'heart' | 'squiggle-correction' | 'squiggle-suggestion' | 'circle';
  startIndex: number;
  endIndex: number;
  annotatedText: string;
  comment: string; // Can include **bold** markdown
  certainty: 'certain' | 'uncertain';
  browserReference: BrowserReference | null;
  timestamp: Date; // Generated client-side
  bookmarked?: boolean; // Optional bookmark flag
}

// Zustand store shape
export interface AppState {
  // Text editor
  text: string;
  isEditing: boolean;
  isAnalyzing: boolean;
  textEditHistory: string[]; // Track text changes for chat context

  // Annotations
  annotations: Annotation[];
  annotationsVisible: boolean;
  activeAnnotationId: string | null; // Currently displayed annotation (hover)
  overlappingAnnotationIds: string[]; // All annotations at current hover/click position
  pinnedAnnotationId: string | null; // Clicked/pinned annotation

  // Comment history (deprecated - keeping for backward compatibility)
  commentHistory: Annotation[];

  // Chat system
  annotationChats: Record<string, import('./chat').ChatMessage[]>; // Chat per annotation
  savedAnnotations: import('./chat').SavedAnnotationWithChat[]; // Saved annotations with chats
  
  // Browser modal
  activeBrowserReference: BrowserReference | null;
  isBrowserModalFullscreen: boolean;
  browserModalPosition: { x: number; y: number } | null;

  // Actions
  setText: (text: string) => void;
  startAnalysis: () => void;
  finishAnalysis: (annotations: Annotation[]) => void;
  toggleAnnotations: () => void;
  
  // Annotation interaction
  setActiveAnnotation: (id: string | null, overlappingIds?: string[]) => void;
  setPinnedAnnotation: (id: string | null, overlappingIds?: string[]) => void;
  cycleOverlappingAnnotation: (direction: 'next' | 'prev') => void;
  
  // Chat actions
  addChatMessage: (annotationId: string, message: import('./chat').ChatMessage) => void;
  clearAnnotationChat: (annotationId: string) => void;
  saveAnnotationWithChat: (annotationId: string) => void;
  loadSavedAnnotation: (index: number) => void;
  deleteSavedAnnotation: (index: number) => void;
  
  // Browser modal actions
  openBrowserModal: (reference: BrowserReference, position: { x: number; y: number }) => void;
  closeBrowserModal: () => void;
  toggleBrowserFullscreen: () => void;
  
  // Legacy actions (for backward compatibility)
  resetToDefault: () => void;
  deleteAnnotationFromHistory: (id: string) => void;
  toggleBookmarkAnnotation: (id: string) => void;
  clearHistory: () => void;
}

// Component props interfaces
export interface AnnotationProps {
  annotation: Annotation;
  isVisible: boolean;
  onInfoClick?: (reference: BrowserReference) => void;
}

export interface CommentTooltipProps {
  content?: string;
  certainty?: 'certain' | 'uncertain';
  hasBrowserLink?: boolean;
  onBrowserLinkClick?: () => void;
  annotations?: Annotation[];
  onReferenceClick?: (reference: BrowserReference, position: { x: number; y: number }) => void;
  children: React.ReactNode;
}

export interface CommentCardProps {
  annotation: Annotation;
  onReferenceClick?: (reference: BrowserReference, position: { x: number; y: number }) => void;
}

export interface BrowserModalProps {
  reference: BrowserReference;
  isFullscreen: boolean;
  triggerPosition: { x: number; y: number } | null;
  onClose: () => void;
  onToggleFullscreen: () => void;
}

export interface AnalyzeButtonProps {
  isAnalyzing: boolean;
  isDisabled: boolean;
  onClick: () => void;
}

