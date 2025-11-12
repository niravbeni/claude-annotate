'use client';

import { useEffect, useState } from 'react';
import { X, Maximize2, Minimize2, RotateCw } from 'lucide-react';
import { BrowserModalProps } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';

export function BrowserModal({
  reference,
  isFullscreen,
  triggerPosition,
  onClose,
  onToggleFullscreen,
}: BrowserModalProps) {
  const [iframeError, setIframeError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [iframeKey, setIframeKey] = useState(0);

  // Check if site is likely to block iframes on mount
  useEffect(() => {
    setIsLoading(true);
    setIframeError(false);
    
    // Common domains that block iframe embedding
    const blockedDomains = [
      'goodreads.com',
      'facebook.com',
      'instagram.com',
      'twitter.com',
      'x.com',
      'linkedin.com',
      'amazon.com',
      'youtube.com',
      'google.com'
    ];
    
    const urlLower = reference.sourceUrl.toLowerCase();
    const isLikelyBlocked = blockedDomains.some(domain => urlLower.includes(domain));
    
    if (isLikelyBlocked) {
      // These sites are known to block iframes, show error immediately
      setTimeout(() => {
        setIframeError(true);
        setIsLoading(false);
      }, 500);
    } else {
      // Give other sites a chance to load, timeout after 5 seconds
      const timeout = setTimeout(() => {
        setIsLoading(false);
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [reference.sourceUrl]);

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // Handle refresh
  const handleRefresh = () => {
    setIframeError(false);
    setIsLoading(true);
    setIframeKey(prev => prev + 1); // Force iframe reload
  };

  // Calculate popover position
  const getPopoverPosition = () => {
    if (!triggerPosition || isFullscreen) {
      return {};
    }

    const modalWidth = 600;
    const modalHeight = 500;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const padding = 16;

    let top = triggerPosition.y + 8; // 8px below trigger
    let left = triggerPosition.x - modalWidth / 2; // Center under trigger

    // Adjust if overflowing right
    if (left + modalWidth > viewportWidth - padding) {
      left = viewportWidth - modalWidth - padding;
    }

    // Adjust if overflowing left
    if (left < padding) {
      left = padding;
    }

    // Adjust if overflowing bottom
    if (top + modalHeight > viewportHeight - padding) {
      // Position above trigger instead
      top = triggerPosition.y - modalHeight - 8;
    }

    // Ensure not too close to top
    if (top < padding) {
      top = padding;
    }

    return {
      top: `${top}px`,
      left: `${left}px`,
    };
  };

  // Drag constraints for non-fullscreen mode
  const getDragConstraints = () => {
    if (isFullscreen || !triggerPosition) return undefined;
    
    // Modal dimensions
    const modalWidth = 600;
    const modalHeight = 500;
    
    // Get viewport dimensions
    const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1920;
    const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 1080;
    
    // Get initial position
    const initialPos = getPopoverPosition();
    const initialLeft = parseInt(initialPos.left || '0');
    const initialTop = parseInt(initialPos.top || '0');
    
    // Calculate how far the modal can move from its initial position
    // left: how far left it can move (to reach viewport left edge)
    // right: how far right it can move (to reach viewport right edge)
    // top: how far up it can move (to reach viewport top)
    // bottom: how far down it can move (to reach viewport bottom)
    return {
      left: -initialLeft, // Move left until modal left edge hits viewport left (0)
      right: viewportWidth - modalWidth - initialLeft, // Move right until modal right edge hits viewport right
      top: -initialTop, // Move up until modal top edge hits viewport top (0)
      bottom: viewportHeight - modalHeight - initialTop, // Move down until modal bottom edge hits viewport bottom
    };
  };

  return (
    <AnimatePresence>
      {/* Modal/Popover - No backdrop, draggable in non-fullscreen */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, ...(isFullscreen ? {} : getPopoverPosition()) }}
        animate={{ 
          opacity: 1, 
          scale: 1,
          ...(isFullscreen ? {
            top: '50%',
            left: '50%',
            x: '-50%',
            y: '-50%'
          } : {})
        }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        drag={!isFullscreen}
        dragMomentum={false}
        dragElastic={0}
        dragConstraints={getDragConstraints()}
        className={`fixed bg-white rounded-lg shadow-2xl overflow-hidden z-[10000] ${
          isFullscreen
            ? 'w-[90vw] h-[90vh]'
            : 'w-[600px] h-[500px]'
        }`}
        style={!isFullscreen ? { 
          ...getPopoverPosition(),
          cursor: 'move'
        } : {
          cursor: 'default'
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="browser-modal-title"
      >
          {/* Browser Chrome */}
          <div className="bg-gray-100 border-b border-gray-300 px-4 py-3 flex items-center gap-3">
            <div className="flex items-center gap-2">
              {/* Close Button - Far Left */}
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-red-100 transition-colors group cursor-pointer outline-none focus:outline-none"
                aria-label="Close"
              >
                <X className="h-4 w-4 text-gray-700 group-hover:text-red-600" />
              </button>
              
              {/* Refresh Button - Right of Close */}
              <button
                onClick={handleRefresh}
                className="p-1.5 rounded-full hover:bg-gray-200 transition-colors cursor-pointer outline-none focus:outline-none"
                aria-label="Refresh"
              >
                <RotateCw className="h-4 w-4 text-gray-700" />
              </button>
            </div>

            {/* URL Bar */}
            <div className="flex-1 bg-white rounded-md px-3 py-1.5 flex items-center gap-2 border border-gray-200">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-ui-body-small text-gray-700 truncate">
                {reference.sourceUrl}
              </span>
            </div>

            {/* Fullscreen Button - Right */}
            <button
              onClick={onToggleFullscreen}
              className="p-1.5 rounded-full hover:bg-gray-200 transition-colors cursor-pointer outline-none focus:outline-none"
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4 text-gray-700" />
              ) : (
                <Maximize2 className="h-4 w-4 text-gray-700" />
              )}
            </button>
          </div>

          {/* Browser Content - Iframe only, no banner */}
          <div className="h-[calc(100%-56px)] bg-white relative">
            {iframeError ? (
              <div className="flex items-center justify-center h-full p-8">
                <div className="max-w-md">
                  {/* Quote Context - styled like annotation card */}
                  {reference.quoteHighlighted && (
                    <div className="text-claude-body-small text-gray-700 mb-3 italic border-l-2 border-gray-300 pl-3">
                      {reference.quoteBefore && `${reference.quoteBefore} `}
                      {reference.quoteHighlighted}
                      {reference.quoteAfter && ` ${reference.quoteAfter}`}
                    </div>
                  )}
                  
                  {/* Claude's Note */}
                  {reference.claudeNote && (
                    <p className="text-ui-body-small text-gray-800 mb-4">
                      {reference.claudeNote}
                    </p>
                  )}
                  
                  {/* Open Link Button */}
                  <a
                    href={reference.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-ui-body-small text-[#C6613F] hover:underline cursor-pointer"
                  >
                    Open link in new tab →
                  </a>
                </div>
              </div>
            ) : (
              <>
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-10">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C6613F] mx-auto mb-2"></div>
                      <p className="text-ui-body-small text-gray-600">Loading...</p>
                    </div>
                  </div>
                )}
                <iframe
                  key={iframeKey}
                  id="browser-modal-title"
                  src={reference.sourceUrl}
                  className="w-full h-full border-0"
                  sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                  title={reference.sourceTitle}
                  onLoad={() => setIsLoading(false)}
                  onError={() => {
                    setIframeError(true);
                    setIsLoading(false);
                  }}
                />
              </>
            )}
          </div>
        </motion.div>
    </AnimatePresence>
  );
}

