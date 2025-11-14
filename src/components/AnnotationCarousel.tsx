'use client';

import { useAppStore } from '@/lib/store';
import { Heart, Waves, CircleAlert, Star, ChevronLeft, ChevronRight, Pin, Globe, Check, RefreshCw, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMemo, useState, useEffect } from 'react';
import Image from 'next/image';

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
    applyAlternativeText,
    setPinnedAnnotation,
    updateAnnotationAlternatives,
  } = useAppStore();

  // State for alternatives carousel
  const [isAlternativesExpanded, setIsAlternativesExpanded] = useState(false);
  const [currentAlternativeIndex, setCurrentAlternativeIndex] = useState(0);
  
  // State for suggestion icon animation
  const [suggestionFrame, setSuggestionFrame] = useState(0);
  const [isAnimatingSuggestion, setIsAnimatingSuggestion] = useState(false);
  
  // Animate suggestion icon (loops while animating)
  useEffect(() => {
    if (isAnimatingSuggestion) {
      const interval = setInterval(() => {
        setSuggestionFrame((prev) => (prev + 1) % 3); // Loop through 0, 1, 2
      }, 100); // 100ms per frame
      
      return () => clearInterval(interval);
    } else {
      setSuggestionFrame(0);
    }
  }, [isAnimatingSuggestion]);
  
  // Regenerate alternatives function - only regenerates the specific alternative at currentIndex
  const handleRegenerateAlternatives = async (
    annotationId: string, 
    annotatedText: string, 
    currentAlternatives: string[], 
    currentAlternativeStyles: string[],
    currentIndex: number
  ) => {
    setIsAnimatingSuggestion(true);
    
    try {
      const response = await fetch('/api/regenerate-alternatives', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          annotatedText,
          currentAlternatives,
          currentAlternativeStyles,
          currentIndex,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to regenerate alternatives');
      }
      
      // Validate we have a new alternative
      if (!data.alternative || !data.alternativeStyle) {
        throw new Error('No alternative returned from Claude');
      }
      
      // Create new arrays with only the current alternative replaced
      const newAlternatives = [...currentAlternatives];
      const newAlternativeStyles = [...currentAlternativeStyles];
      newAlternatives[currentIndex] = data.alternative;
      newAlternativeStyles[currentIndex] = data.alternativeStyle;
      
      // Update only this specific alternative in the store
      updateAnnotationAlternatives(annotationId, newAlternatives, newAlternativeStyles);
      
      // Keep viewing the same index (now with the new alternative)
      // No need to change currentAlternativeIndex
    } catch (error: any) {
      console.error('Failed to regenerate alternative:', error);
      alert('Failed to regenerate alternative. Please try again.');
    } finally {
      setIsAnimatingSuggestion(false);
    }
  };

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
        className="p-5 pb-1 relative"
      >
        {/* Star button - Absolute top right corner */}
        <div className="absolute top-1 right-1 z-10">
          <button
            onClick={() => saveAnnotationWithChat(activeAnnotation.id)}
            className="p-1.5 active:scale-95 transition-all cursor-pointer"
            aria-label="Save annotation"
          >
            <Star 
              className="h-5 w-5" 
              style={{ color: '#C6613F' }} 
              fill={isSaved ? '#C6613F' : 'none'}
            />
          </button>
        </div>

        {/* Text Snippet - with padding for star button */}
        <div className="text-claude-body-small text-gray-700 mb-6 italic border-l-2 border-gray-300 pl-3 pr-10 break-words overflow-hidden">
          "{activeAnnotation.annotatedText.substring(0, 120)}
          {activeAnnotation.annotatedText.length > 120 ? '...' : ''}"
        </div>

        {/* Icon + Comment */}
        <div className="flex items-start gap-2 mb-4">
          {/* Icon */}
          <div className="flex-shrink-0 mt-0.5">
            {getIcon(activeAnnotation.type)}
          </div>
          
          {/* Comment text */}
        <div
            className={`text-ui-body-small text-gray-800 leading-relaxed break-words flex-1 ${
            activeAnnotation.certainty === 'uncertain' ? 'uncertain-comment' : ''
          }`}
          dangerouslySetInnerHTML={{
            __html: formatComment(activeAnnotation.comment),
          }}
        />
          
          {/* Globe button */}
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

        {/* Editor Suggestion Line - Only for annotations with alternatives */}
        {activeAnnotation.alternatives && activeAnnotation.alternatives.length > 0 && (
          <div className="mb-2">
            <div className="flex items-start gap-2 bg-gray-50 p-2 rounded-md">
              {/* Suggestion icon - left side, non-clickable, top-aligned */}
              <div className="flex-shrink-0 mt-0.5">
                <Image
                  src={`/images/suggestion${suggestionFrame}.png`}
                  alt="Suggestion"
                  width={14}
                  height={14}
                  className="h-3.5 w-3.5"
                />
              </div>
              
              {/* Suggestion text - center */}
              <span className="text-ui-body-small text-gray-600 italic flex-1 leading-tight">
                {activeAnnotation.editorSuggestion || "Consider this alternative framing"}
              </span>
              
              {/* Dropdown arrow button - right side, vertically centered */}
              <button
                onClick={() => {
                  setIsAlternativesExpanded(!isAlternativesExpanded);
                  if (!isAlternativesExpanded) {
                    setCurrentAlternativeIndex(0); // Reset to first alternative when expanding
                  }
                }}
                className="flex-shrink-0 p-1 active:scale-95 transition-all cursor-pointer self-center"
                aria-label={isAlternativesExpanded ? "Hide alternatives" : "Show alternatives"}
                title={isAlternativesExpanded ? "Hide alternatives" : "Show alternatives"}
              >
                <ChevronDown 
                  className={`h-3.5 w-3.5 text-gray-600 transition-transform ${isAlternativesExpanded ? 'rotate-180' : ''}`}
                />
              </button>
            </div>

            {/* Alternatives Carousel - Conditionally rendered when expanded */}
            <AnimatePresence>
              {isAlternativesExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-3"
                >
                  {/* Alternative text display */}
                  <div className="mb-3">
                    <div className="text-claude-body-small text-gray-700 italic border-l-2 border-gray-300 pl-3 break-words overflow-hidden">
                      "{activeAnnotation.alternatives[currentAlternativeIndex]}"
                    </div>
                    {/* Style tag */}
                    {activeAnnotation.alternativeStyles && activeAnnotation.alternativeStyles[currentAlternativeIndex] && (
                      <div className="mt-2 pr-3 text-right">
                        <span className="text-ui-body-extra-small text-gray-500 italic">
                          — {activeAnnotation.alternativeStyles[currentAlternativeIndex]}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Navigation and Apply button */}
                  <div className="flex items-end justify-between">
                    {/* Left: Carousel navigation */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentAlternativeIndex(
                          currentAlternativeIndex - 1 < 0 
                            ? activeAnnotation.alternatives!.length - 1 
                            : currentAlternativeIndex - 1
                        )}
                        className="p-1 rounded-md hover:bg-gray-100 active:scale-95 transition-all cursor-pointer disabled:opacity-30"
                        aria-label="Previous alternative"
                        disabled={activeAnnotation.alternatives.length <= 1}
                      >
                        <ChevronLeft className="h-3.5 w-3.5" style={{ color: '#666' }} />
                      </button>
                      
                      <span className="text-ui-body-extra-small text-gray-500">
                        {currentAlternativeIndex + 1}/{activeAnnotation.alternatives.length}
                      </span>
                      
                      <button
                        onClick={() => setCurrentAlternativeIndex(
                          (currentAlternativeIndex + 1) % activeAnnotation.alternatives!.length
                        )}
                        className="p-1 rounded-md hover:bg-gray-100 active:scale-95 transition-all cursor-pointer disabled:opacity-30"
                        aria-label="Next alternative"
                        disabled={activeAnnotation.alternatives.length <= 1}
                      >
                        <ChevronRight className="h-3.5 w-3.5" style={{ color: '#666' }} />
                      </button>
                    </div>

                    {/* Right: Action buttons */}
                    <div className="flex items-center gap-2">
                      {/* Refresh button - Regenerate alternatives */}
                      <button
                        onClick={() => {
                          handleRegenerateAlternatives(
                            activeAnnotation.id,
                            activeAnnotation.annotatedText,
                            activeAnnotation.alternatives || [],
                            activeAnnotation.alternativeStyles || [],
                            currentAlternativeIndex
                          );
                        }}
                        disabled={isAnimatingSuggestion}
                        className="flex items-center justify-center rounded-lg transition-all cursor-pointer hover:bg-gray-100 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                          width: '28px',
                          height: '28px'
                        }}
                        aria-label="Regenerate alternative"
                        title="Regenerate alternative"
                      >
                        <RefreshCw className="h-3.5 w-3.5 text-black" />
                      </button>
                      
                      {/* Apply button - Tick icon */}
                      <button
                        onClick={() => {
                          // Trigger brief animation
                          setIsAnimatingSuggestion(true);
                          setTimeout(() => setIsAnimatingSuggestion(false), 300);
                          
                          applyAlternativeText(
                            activeAnnotation.id,
                            activeAnnotation.alternatives![currentAlternativeIndex]
                          );
                          // Keep dropdown open after applying
                        }}
                        className="flex items-center justify-center rounded-lg transition-all cursor-pointer hover:bg-gray-100 active:scale-95"
                        style={{
                          width: '28px',
                          height: '28px'
                        }}
                        aria-label="Apply alternative"
                        title="Apply alternative"
                      >
                        <Check className="h-3.5 w-3.5 text-black" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Bottom Row - Pinned Icon (left) and Carousel Navigation (right) */}
        <div className="flex items-center justify-between mt-4">
          {/* Pinned Icon - Bottom Left - Clickable to pin/unpin */}
          <button
            onClick={() => {
              if (pinnedAnnotationId === activeAnnotation.id) {
                // Unpin if already pinned
                setPinnedAnnotation(null, []);
              } else {
                // Pin this annotation
                setPinnedAnnotation(activeAnnotation.id, overlappingAnnotationIds);
              }
            }}
            className="p-1 active:scale-95 transition-all cursor-pointer"
            aria-label={pinnedAnnotationId === activeAnnotation.id ? "Unpin annotation" : "Pin annotation"}
            title={pinnedAnnotationId === activeAnnotation.id ? "Unpin" : "Pin"}
          >
            <Pin 
              className="h-3.5 w-3.5" 
              style={{ color: '#C6613F' }} 
              fill={pinnedAnnotationId === activeAnnotation.id ? '#C6613F' : 'none'}
            />
          </button>

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

