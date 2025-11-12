// Default text content
// To change the default text, edit: src/lib/defaultText.ts
export { DEFAULT_TEXT } from './defaultText';

// Design tokens
export const COLORS = {
  heart: '#FF8C42',
  squiggle: '#E9C46A',
  circle: '#E76F51',
  background: '#FFFFFF',
  text: '#1A1A1A',
  textMuted: '#666666',
  border: '#E5E5E5',
  overlay: 'rgba(0, 0, 0, 0.5)',
};

export const SPACING = {
  editorPadding: '2rem',
  sidebarPadding: '1.5rem',
  annotationMargin: '0.25rem',
  tooltipPadding: '0.75rem 1rem',
};

export const TYPOGRAPHY = {
  editorFont: 'var(--font-serif)',
  editorSize: '17px',
  editorLineHeight: '1.6',
  uiFont: 'var(--font-sans)',
  uiSize: '14px',
  uiLineHeight: '1.4',
  codeFont: 'var(--font-mono)',
  codeSize: '16px',
};

export const ANIMATIONS = {
  tooltipDuration: '150ms',
  annotationFadeIn: '300ms',
  claudePulseDuration: '1.5s',
  sidebarSlideIn: '250ms',
};

export const LIMITS = {
  maxCharacters: 5000,
  warnAtCharacters: 4500,
  apiTimeoutSeconds: 30,
  maxCommentLength: 500,
};

// Error messages
export const ERROR_MESSAGES = {
  API_KEY_MISSING: 'API key not configured. Please add ANTHROPIC_API_KEY to .env',
  RATE_LIMIT: 'Too many requests. Please wait a moment and try again.',
  NETWORK_ERROR: 'Connection failed. Please check your internet and try again.',
  INVALID_RESPONSE: 'Received unexpected response from Claude. Please try again.',
  TEXT_TOO_LONG: 'Text exceeds 5,000 character limit.',
  TEXT_EMPTY: 'Please enter some text to analyze.',
  UNKNOWN: 'An error occurred. Please try again.',
};

