// Default text content (Yasmina's story)
export const DEFAULT_TEXT = `My grandmother arrived in London in 1952, carrying nothing but a worn leather suitcase and her mother's gold cross. She was seventeen, barely spoke English, and knew no one.

The boarding house on Kentish Town Road smelled of boiled cabbage and damp wool. Nonna would lie awake at night listening to unfamiliar sounds—the rumble of the Northern Line beneath the floorboards, voices speaking a language that felt like stones in her mouth. Fear lived in her chest then, a hard knot just below her ribs that made breathing deliberate work.

In her novel "Intermezzo" (2024), Sally Rooney writes: "Fear isn't something you think about. It's something that thinks you." When I interviewed Nonna last month, she described it exactly the same way—fear had thoughts of its own.

By 1954, she'd found work at a textile factory in Hackney. The other women taught her curse words before they taught her please and thank you.

On her twenty-first birthday, she received a letter from her sister. Their mother had died three weeks earlier.`;

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
  editorFont: 'Georgia, serif',
  editorSize: '18px',
  editorLineHeight: '1.8',
  commentFont: 'Inter, sans-serif',
  commentSize: '14px',
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

