'use client';

import { useState, useRef, useEffect } from 'react';
import { Info } from 'lucide-react';
import { CommentTooltipProps } from '@/types';

export function CommentTooltip({
  content,
  certainty,
  hasBrowserLink,
  onBrowserLinkClick,
  children,
}: CommentTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (isVisible && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.top + window.scrollY - 10,
        left: rect.left + rect.width / 2,
      });
    }
  }, [isVisible]);

  return (
    <>
      <span
        ref={triggerRef}
        className="relative"
        style={{ display: 'inline' }}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </span>
      {isVisible && (
        <div 
          className="fixed z-[9999]"
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
            transform: 'translate(-50%, -100%)',
          }}
          onMouseEnter={() => setIsVisible(true)}
          onMouseLeave={() => setIsVisible(false)}
        >
          <div className="bg-white rounded-lg shadow-2xl border border-gray-200 p-4 w-80 max-w-xs">
            <div
              className="text-sm leading-relaxed text-gray-800"
              dangerouslySetInnerHTML={{
                __html: certainty === 'uncertain' ? `≈ ${content}` : content,
              }}
            />
            {hasBrowserLink && onBrowserLinkClick && (
              <button
                onClick={onBrowserLinkClick}
                className="mt-2 flex items-center gap-1 text-xs text-blue-500 hover:text-blue-600 transition-colors"
              >
                <Info className="h-3 w-3" />
                View Reference
              </button>
            )}
          </div>
          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
            <div className="border-8 border-transparent border-t-white" />
          </div>
          <div className="absolute top-full left-1/2 -translate-x-1/2">
            <div className="border-8 border-transparent border-t-gray-200" />
          </div>
        </div>
      )}
    </>
  );
}

