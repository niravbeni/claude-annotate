'use client';

import { useEffect } from 'react';
import { X, Maximize2, Minimize2, ArrowLeft, ArrowRight, RotateCw } from 'lucide-react';
import { BrowserModalProps } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';

export function BrowserModal({
  reference,
  isFullscreen,
  onClose,
  onToggleFullscreen,
}: BrowserModalProps) {
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

  const formatComment = (comment: string) => {
    // Convert **bold** markdown to HTML
    return comment.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  };

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-[10000] flex items-center justify-center"
        role="dialog"
        aria-modal="true"
        aria-labelledby="browser-modal-title"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black bg-opacity-50"
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className={`relative bg-white rounded-lg shadow-2xl overflow-hidden ${
            isFullscreen
              ? 'w-[90vw] h-[90vh]'
              : 'w-full h-full sm:w-[600px] sm:h-[700px] m-0 sm:m-4'
          }`}
          style={{ transition: 'width 300ms ease-in-out, height 300ms ease-in-out' }}
        >
          {/* Browser Chrome */}
          <div className="bg-gray-100 border-b border-gray-300 px-4 py-3 flex items-center gap-3">
            {/* Browser Controls (disabled) */}
            <div className="flex items-center gap-2">
              <button
                disabled
                className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="h-4 w-4 text-gray-600" />
              </button>
              <button
                disabled
                className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ArrowRight className="h-4 w-4 text-gray-600" />
              </button>
              <button
                disabled
                className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <RotateCw className="h-4 w-4 text-gray-600" />
              </button>
            </div>

            {/* URL Bar */}
            <div className="flex-1 bg-white rounded-md px-3 py-1.5 flex items-center gap-2 border border-gray-200">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-ui-body-small text-gray-700 truncate">
                {reference.sourceUrl}
              </span>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center gap-1">
              <button
                onClick={onToggleFullscreen}
                className="p-1.5 rounded hover:bg-gray-200 transition-colors"
                aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              >
                {isFullscreen ? (
                  <Minimize2 className="h-4 w-4 text-gray-700" />
                ) : (
                  <Maximize2 className="h-4 w-4 text-gray-700" />
                )}
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded hover:bg-red-100 transition-colors group"
                aria-label="Close"
              >
                <X className="h-4 w-4 text-gray-700 group-hover:text-red-600" />
              </button>
            </div>
          </div>

          {/* Browser Content */}
          <div className="overflow-y-auto h-[calc(100%-56px)] p-8 bg-white">
            {/* Source Title */}
            <h2 id="browser-modal-title" className="text-claude-heading text-gray-900 mb-6">
              {reference.sourceTitle}
            </h2>

            {/* Quote Context */}
            <div className="prose prose-lg max-w-none">
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <p className="text-claude-body text-gray-700 whitespace-pre-wrap">
                  {reference.quoteBefore}
                  <mark className="bg-orange-200 px-1 py-0.5 rounded">
                    {reference.quoteHighlighted}
                  </mark>
                  {reference.quoteAfter}
                </p>
              </div>

              {/* Claude's Note */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-ui-body-small-bold text-gray-600 mb-1">
                  Claude's Note:
                </p>
                <p
                  className="text-claude-body text-gray-800"
                  dangerouslySetInnerHTML={{
                    __html: formatComment(reference.claudeNote),
                  }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

