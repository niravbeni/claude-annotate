'use client';

import { useAppStore } from '@/lib/store';
import { Heart, Waves, CircleAlert, Star, ChevronLeft, ChevronRight, Pin, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMemo } from 'react';

export function AnnotationCarousel() {
  const { 
    annotations, 
    activeAnnotationId, 
    pinnedAnnotationId,
    overlappingAnnotationIds,
    saveAnnotationWithChat,
    cycleOverlappingAnnotation,
    savedAnnotations,
    openBrowserModal,
  } = useAppStore();

  // Get the active annotation (pinned takes priority over hovered)
  const displayAnnotationId = pinnedAnnotationId || activeAnnotationId;
  const activeAnnotation = useMemo(() => 
    annotations.find(a => a.id === displayAnnotationId),
    [annotations, displayAnnotationId]
  );

  // Check if there are multiple overlapping annotations
  const hasMultipleOverlapping = overlappingAnnotationIds.length > 1;
  const currentIndex = overlappingAnnotationIds.findIndex(id => id === displayAnnotationId);
  // Always show position, even for single annotations (1/1)
  const annotationPosition = `${currentIndex >= 0 ? currentIndex + 1 : 1}/${overlappingAnnotationIds.length || 1}`;
  
  // Check if this annotation is already saved
  const isSaved = activeAnnotation ? savedAnnotations.some(saved => saved.annotation.id === activeAnnotation.id) : false;

  const getIcon = (type: string) => {
    switch (type) {
      case 'heart':
        return <Heart className="h-5 w-5" style={{ color: '#C6613F', fill: '#C6613F', stroke: 'none' }} />;
      case 'squiggle-correction':
      case 'squiggle-suggestion':
        return <Waves className="h-5 w-5" style={{ color: '#C6613F' }} />;
      case 'circle':
        return <CircleAlert className="h-5 w-5" style={{ color: 'white', fill: '#C6613F', stroke: 'white' }} />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'heart':
        return 'Authenticity';
      case 'squiggle-correction':
      case 'squiggle-suggestion':
        return 'Uncertainty';
      case 'circle':
        return 'Discrepancy';
    }
  };

  const formatComment = (comment: string) => {
    return comment.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  };

  if (!activeAnnotation) {
    return (
      <div className="h-[200px] flex items-center justify-center p-6">
        <p className="text-ui-body-small text-gray-500 text-center">
          Analyze your text to see annotations appear here
        </p>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeAnnotation.id}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.2 }}
        className="p-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {getIcon(activeAnnotation.type)}
            <span className="text-ui-body-small-bold text-gray-800">
              {getTypeLabel(activeAnnotation.type)}
            </span>
          </div>
          <button
            onClick={() => saveAnnotationWithChat(activeAnnotation.id)}
            className="p-2 rounded-md hover:bg-gray-100 active:scale-95 transition-all cursor-pointer"
            aria-label="Save annotation"
          >
            <Star 
              className="h-5 w-5" 
              style={{ color: '#C6613F' }} 
              fill={isSaved ? '#C6613F' : 'none'}
            />
          </button>
        </div>

        {/* Text Snippet */}
        <div className="text-claude-body-small text-gray-700 mb-3 italic border-l-2 border-gray-300 pl-3 break-words overflow-hidden">
          "{activeAnnotation.annotatedText.substring(0, 120)}
          {activeAnnotation.annotatedText.length > 120 ? '...' : ''}"
        </div>

        {/* Comment */}
        <div className="flex items-start gap-2 mb-3">
        <div
            className={`text-ui-body-small text-gray-800 leading-relaxed break-words flex-1 ${
            activeAnnotation.certainty === 'uncertain' ? 'uncertain-comment' : ''
          }`}
          dangerouslySetInnerHTML={{
            __html: formatComment(activeAnnotation.comment),
          }}
        />
          {activeAnnotation.browserReference && (
            <button
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                openBrowserModal(activeAnnotation.browserReference!, {
                  x: rect.left + rect.width / 2,
                  y: rect.bottom
                });
              }}
              className="flex-shrink-0 inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#C6613F] hover:bg-[#B35635] transition-colors cursor-pointer"
              aria-label="View reference"
              title="View reference"
            >
              <Globe className="h-3 w-3" strokeWidth={2.5} style={{ color: 'white', stroke: 'white', fill: 'none' }} />
            </button>
          )}
        </div>

        {/* Bottom Row - Pinned Icon (left) and Carousel Navigation (right) */}
        <div className="flex items-center justify-between">
          {/* Pinned Icon - Bottom Left - Always visible */}
          <div className="flex items-center">
            <Pin 
              className="h-3.5 w-3.5" 
              style={{ color: '#C6613F' }} 
              fill={pinnedAnnotationId === activeAnnotation.id ? '#C6613F' : 'none'}
            />
          </div>

          {/* Carousel Navigation - Bottom Right - Always visible */}
          <div className="flex items-center gap-2">
            <span className="text-ui-body-extra-small text-gray-500">
              {annotationPosition}
            </span>
            <button
              onClick={() => cycleOverlappingAnnotation('prev')}
              className="p-1.5 rounded-md hover:bg-gray-100 active:scale-95 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Previous annotation"
              disabled={!hasMultipleOverlapping}
            >
              <ChevronLeft className="h-4 w-4" style={{ color: '#666' }} />
            </button>
            <button
              onClick={() => cycleOverlappingAnnotation('next')}
              className="p-1.5 rounded-md hover:bg-gray-100 active:scale-95 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Next annotation"
              disabled={!hasMultipleOverlapping}
            >
              <ChevronRight className="h-4 w-4" style={{ color: '#666' }} />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

