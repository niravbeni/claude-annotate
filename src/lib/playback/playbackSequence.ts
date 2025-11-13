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
}

export const PLAYBACK_SEQUENCE: PlaybackStep[] = [
  {
    step: 1,
    name: 'Type text into textarea',
    action: 'typeText',
    target: 'textarea',
    content: DEFAULT_TEXT,
    typingSpeed: 7, // ms per character
    delay: 500, // Wait before starting
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
    name: 'Click on uncertain annotation (Sally Rooney quote)',
    action: 'clickAnnotation',
    findBy: 'text',
    findValue: 'Fear isn\'t something you think about',
    delay: 500,
  },
  {
    step: 5,
    name: 'Active tab card is already visible',
    action: 'wait',
    delay: 1000, // Just wait a moment
  },
  {
    step: 6,
    name: 'Click globe icon, fullscreen, scroll, close',
    action: 'browserFlow',
    delay: 500,
  },
  {
    step: 7,
    name: 'Type chat message and submit',
    action: 'chatMessage',
    content: 'What is a good quote alternative?',
    typingSpeed: 50,
    delay: 1000,
  },
  {
    step: 8,
    name: 'Click star/save button',
    action: 'click',
    findBy: 'ariaLabel',
    findValue: 'Save annotation',
    delay: 0, // No delay - move immediately after chat
  },
  {
    step: 9,
    name: 'Navigate to Saved tab and open chat history',
    action: 'savedTabFlow',
    delay: 1000,
  },
  {
    step: 10,
    name: 'Edit text to update Sally Rooney quote',
    action: 'editText',
    content: 'Fear isn\'t just an emotion you experience - it becomes the lens through which you see everything.',
    delay: 1000,
  },
  {
    step: 11,
    name: 'Wait and restart',
    action: 'restart',
    delay: 3000,
  },
];

export const CURSOR_SPEED = 800; // ms for cursor to move between elements
export const CLICK_ANIMATION_DURATION = 300; // ms for click animation

