'use client';

import { usePlayback } from '@/lib/playback/PlaybackContext';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CursorPosition {
  x: number;
  y: number;
}

export function AnimatedCursor() {
  const { isPlaybackActive } = usePlayback();
  const [position, setPosition] = useState<CursorPosition>({ x: -100, y: -100 }); // Start off-screen
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isPlaybackActive) {
      setIsVisible(true);
      // Start cursor near center
      setPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    } else {
      setIsVisible(false);
      setPosition({ x: -100, y: -100 });
    }
  }, [isPlaybackActive]);

  useEffect(() => {
    // Listen for custom cursor move events - always listen, not just when playback active
    const handleCursorMove = (e: CustomEvent<CursorPosition>) => {
      console.log('[AnimatedCursor] Moving to:', e.detail);
      setPosition(e.detail);
    };

    const handleCursorClick = () => {
      console.log('[AnimatedCursor] Click animation');
      setIsClicking(true);
      setTimeout(() => setIsClicking(false), 300);
    };

    window.addEventListener('playback:moveCursor' as any, handleCursorMove);
    window.addEventListener('playback:click' as any, handleCursorClick);

    return () => {
      window.removeEventListener('playback:moveCursor' as any, handleCursorMove);
      window.removeEventListener('playback:click' as any, handleCursorClick);
    };
  }, []); // No dependencies - always listen

  if (!isVisible) return null;

  console.log('[AnimatedCursor] Render - visible:', isVisible, 'position:', position);

  return (
    <AnimatePresence>
      {isVisible && (
        <div
          className="fixed pointer-events-none z-[99999]"
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
            transition: 'left 0.8s cubic-bezier(0.25, 0.1, 0.25, 1), top 0.8s cubic-bezier(0.25, 0.1, 0.25, 1)',
            willChange: 'left, top',
          }}
        >
          {/* Cursor pointer */}
          <div className="relative" style={{ transform: 'translate(-2px, -2px)' }}>
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              className={`transform ${isClicking ? 'scale-90' : 'scale-100'} transition-transform duration-150`}
              style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
            >
              <path
                d="M5 3L19 12L12 13L9 20L5 3Z"
                fill="#C6613F"
                stroke="white"
                strokeWidth="2"
              />
            </svg>
            
            {/* Click ripple effect */}
            {isClicking && (
              <motion.div
                initial={{ scale: 0.5, opacity: 0.8 }}
                animate={{ scale: 2.5, opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="absolute top-0 left-0 w-12 h-12 rounded-full border-3 border-[#C6613F]"
                style={{ marginLeft: '-12px', marginTop: '-12px' }}
              />
            )}
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}

