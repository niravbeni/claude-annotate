'use client';

import { useState, useRef } from 'react';
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

  const handleMouseEnter = (e: React.MouseEvent) => {
    setIsVisible(true);
    // Use mouse position for more accurate tooltip placement
    setPosition({
      top: e.clientY + window.scrollY,
      left: e.clientX,
    });
  };

  return (
    <>
      <span
        ref={triggerRef}
        className="relative cursor-pointer"
        style={{ display: 'inline' }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </span>
      {isVisible && (
        <div 
          className="fixed z-[9999] cursor-pointer"
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
            transform: 'translate(-50%, calc(-100% - 12px))',
          }}
          onMouseEnter={() => setIsVisible(true)}
          onMouseLeave={() => setIsVisible(false)}
        >
          <div className="bg-white rounded-lg shadow-2xl border border-gray-200 p-4 w-80 max-w-xs cursor-pointer">
            <div className="text-ui-body-small leading-relaxed text-gray-800 inline">
              <span
                dangerouslySetInnerHTML={{
                  __html: certainty === 'uncertain' ? `≈ ${content}` : content,
                }}
              />
              {hasBrowserLink && onBrowserLinkClick && (
                <button
                  onClick={onBrowserLinkClick}
                  className="inline-flex items-center justify-center ml-2 w-5 h-5 rounded-full bg-[#C6613F] hover:bg-[#B35635] text-white transition-colors align-middle cursor-pointer"
                  aria-label="View reference"
                  title="View reference"
                >
                  <Info className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>
          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2">
            <div className="border-8 border-transparent border-t-gray-200" />
          </div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-0.5">
            <div className="border-8 border-transparent border-t-white" />
          </div>
        </div>
      )}
    </>
  );
}

