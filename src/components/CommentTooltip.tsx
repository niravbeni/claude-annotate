'use client';

import { useState, useRef } from 'react';
import { Info, Heart, Waves, CircleAlert } from 'lucide-react';
import { CommentTooltipProps } from '@/types';

const formatComment = (comment: string) => {
  return comment.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
};

export function CommentTooltip({
  content,
  certainty,
  hasBrowserLink,
  onBrowserLinkClick,
  annotations,
  onReferenceClick,
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
            transform: 'translate(-50%, calc(-100% - 20px))',
          }}
          onMouseEnter={() => setIsVisible(true)}
          onMouseLeave={() => setIsVisible(false)}
        >
          <div className="bg-white rounded-lg shadow-2xl border border-gray-200 p-4 w-80 max-w-xs cursor-pointer">
            <div className="text-ui-body-small leading-relaxed text-gray-800">
              {annotations && annotations.length > 0 ? (
                // New way: Show each annotation with its own inline reference button
                // Deduplicate annotations by ID
                Array.from(new Map(annotations.map(ann => [ann.id, ann])).values()).map((ann, idx) => (
                  <div key={idx} className={`flex items-start gap-2 ${idx > 0 ? 'mt-3' : ''}`}>
                    {/* Icon on the left */}
                    {ann.type === 'heart' ? (
                      <Heart className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: '#C6613F', fill: '#C6613F', stroke: 'none' }} />
                    ) : ann.type === 'circle' ? (
                      <CircleAlert className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: 'white', fill: '#C6613F', stroke: 'white' }} />
                    ) : (
                      <Waves className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: '#C6613F', stroke: '#C6613F' }} />
                    )}
                    
                    {/* Comment content */}
                    <div className="flex-1">
                      <span
                        className={`inline ${ann.certainty === 'uncertain' ? 'uncertain-comment' : ''}`}
                        dangerouslySetInnerHTML={{
                          __html: formatComment(ann.comment),
                        }}
                      />
                      {ann.type !== 'heart' && ann.browserReference && onReferenceClick && (
                        <button
                          onClick={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            onReferenceClick(ann.browserReference!, {
                              x: rect.left + rect.width / 2,
                              y: rect.bottom
                            });
                          }}
                          className="inline-flex items-center justify-center ml-1 w-5 h-5 rounded-full bg-[#C6613F] hover:bg-[#B35635] transition-colors cursor-pointer"
                          style={{ verticalAlign: 'baseline', transform: 'translateY(2px)' }}
                          aria-label="View reference"
                          title="View reference"
                        >
                          <Info className="h-3 w-3" strokeWidth={2.5} style={{ color: 'white', stroke: 'white', fill: 'none' }} />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                // Old way: For backward compatibility
                <div className="inline">
                  <span
                    className={certainty === 'uncertain' ? 'uncertain-comment' : ''}
                    dangerouslySetInnerHTML={{
                      __html: content || '',
                    }}
                  />
                  {hasBrowserLink && onBrowserLinkClick && (
                    <button
                      onClick={onBrowserLinkClick}
                      className="inline-flex items-center justify-center ml-1 w-5 h-5 rounded-full bg-[#C6613F] hover:bg-[#B35635] transition-colors cursor-pointer"
                      style={{ verticalAlign: 'baseline', transform: 'translateY(2px)' }}
                      aria-label="View reference"
                      title="View reference"
                    >
                      <Info className="h-3 w-3" strokeWidth={2.5} style={{ color: 'white', stroke: 'white', fill: 'none' }} />
                    </button>
                  )}
                </div>
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

