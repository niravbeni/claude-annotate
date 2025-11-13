// Chat-related types for annotation discussions

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface SavedAnnotationWithChat {
  annotation: import('./index').Annotation;
  chat: ChatMessage[];
  savedAt: Date;
}

export interface ChatContext {
  fullText: string;
  annotation: import('./index').Annotation;
  edits: string[];
  previousMessages: ChatMessage[];
}

