import { DEFAULT_TEXT } from '../defaultText';

export interface PlaybackStep {
  step: number;
  name: string;
  action: string;
  target?: string;
  content?: string;
  typingSpeed?: number;
  delay?: number;
  findBy?: 'selector' | 'text' | 'ariaLabel';
  findValue?: string;
  cursorPath?: { x: number; y: number }[];
  skipPreview?: boolean; // Skip annotation hover preview
}

export const PLAYBACK_SEQUENCE: PlaybackStep[] = [
  {
    step: 1,
    name: 'Type text into textarea',
    action: 'typeText',
    target: 'textarea',
    content: DEFAULT_TEXT,
    typingSpeed: 7, // ms per character
    delay: 1500, // Wait before starting (longer for page load after loop restart)
  },
  {
    step: 2,
    name: 'Click Analyze button',
    action: 'click',
    findBy: 'ariaLabel',
    findValue: 'Send text for analysis',
    delay: 800, // Wait for typing to finish
  },
  {
    step: 3,
    name: 'Wait for analysis to complete',
    action: 'waitForAnalysis',
    delay: 500,
  },
  {
    step: 4,
    name: 'Move cursor to top of page after analysis',
    action: 'moveCursorToTop',
    delay: 800,
  },
  {
    step: 5,
    name: 'Click on uncertain annotation (Conrad quote)',
    action: 'clickAnnotation',
    findBy: 'text',
    findValue: 'Words are the great enemies',
    delay: 500,
  },
  {
    step: 6,
    name: 'Active tab card is already visible',
    action: 'wait',
    delay: 1000, // Just wait a moment
  },
  {
    step: 7,
    name: 'Click globe icon, fullscreen, scroll, close',
    action: 'browserFlow',
    delay: 500,
  },
  {
    step: 8,
    name: 'Type chat message and submit',
    action: 'chatMessage',
    content: 'What is a good quote alternative?',
    typingSpeed: 50,
    delay: 1000,
  },
  {
    step: 9,
    name: 'Click star/save button',
    action: 'click',
    findBy: 'ariaLabel',
    findValue: 'Save annotation',
    delay: 0, // No delay - move immediately after chat
  },
  {
    step: 10,
    name: 'Navigate to Saved tab and open chat history',
    action: 'savedTabFlow',
    delay: 1000,
  },
  {
    step: 11,
    name: 'Edit text to update Conrad quote',
    action: 'editText',
    content: 'In "Under Western Eyes," Joseph Conrad writes: "Words, as is well known, are the great foes of reality."',
    delay: 800,
  },
  {
    step: 12,
    name: 'Click Analyze button again after edit',
    action: 'click',
    findBy: 'ariaLabel',
    findValue: 'Send text for analysis',
    delay: 300,
  },
  {
    step: 13,
    name: 'Switch to Active tab',
    action: 'click',
    findBy: 'text',
    findValue: 'Active',
    target: 'button',
    delay: 300,
  },
  {
    step: 14,
    name: 'Wait for re-analysis to complete',
    action: 'waitForAnalysis',
    delay: 2000, // Extra wait for annotations to settle and suggestions to generate
  },
  {
    step: 15,
    name: 'Click on suggestion text (last sentence)',
    action: 'clickAnnotation',
    findBy: 'text',
    findValue: 'Years later', // Look for last paragraph with suggestion - broader match
    delay: 2500, // Much longer pause to see card before moving to suggestion button
    skipPreview: true, // Skip hovering over other annotations on re-analysis
  },
  {
    step: 16,
    name: 'Click suggestion dropdown arrow',
    action: 'click',
    findBy: 'ariaLabel',
    findValue: 'Show alternatives',
    delay: 1200, // Longer delay to see the dropdown open
  },
  {
    step: 17,
    name: 'Navigate to second suggestion',
    action: 'click',
    findBy: 'ariaLabel',
    findValue: 'Next alternative',
    delay: 1800, // Pause to "read" the first suggestion
  },
  {
    step: 18,
    name: 'Apply suggestion',
    action: 'click',
    findBy: 'ariaLabel',
    findValue: 'Apply alternative',
    delay: 1500, // Longer pause before restart
  },
  {
    step: 19,
    name: 'Move cursor back to start position',
    action: 'moveCursorToStart',
    delay: 1500,
  },
  {
    step: 20,
    name: 'Wait and restart',
    action: 'restart',
    delay: 2500, // Wait before restarting
  },
];

export const CURSOR_SPEED = 800; // ms for cursor to move between elements
export const CLICK_ANIMATION_DURATION = 300; // ms for click animation

