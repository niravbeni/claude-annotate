'use client';

import { format } from 'date-fns';
import { Heart, CircleAlert, Waves, X, Star, Globe, ChevronLeft, ChevronRight, Check, RefreshCw, ChevronDown } from 'lucide-react';
import { CommentCardProps } from '@/types';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { memo, useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import Image from 'next/image';

const CommentCardComponent = ({ annotation, onReferenceClick }: CommentCardProps) => {
  const { deleteAnnotationFromHistory, toggleBookmarkAnnotation, applyAlternativeText, updateAnnotationAlternatives } = useAppStore();
  
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
  
  const getIcon = () => {
    switch (annotation.type) {
      case 'heart':
        return <Heart className="h-4 w-4" style={{ color: '#C6613F', fill: '#C6613F', stroke: 'none' }} />;
      case 'squiggle-correction':
      case 'squiggle-suggestion':
        return <Waves className="h-4 w-4" style={{ color: '#C6613F' }} />;
      case 'circle':
        return <CircleAlert className="h-5 w-5" style={{ color: 'white', fill: '#C6613F', stroke: 'white' }} />;
    }
  };

  const getTypeLabel = () => {
    switch (annotation.type) {
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
    // Convert **bold** markdown to HTML
    return comment.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25 }}
      className="bg-white rounded-lg p-5 pb-1 shadow-sm border border-gray-200 mb-3"
    >
      {/* Header - Timestamp only */}
      <div className="flex items-center justify-end mb-3">
        <span className="text-ui-body-extra-small text-gray-400">
          {format(new Date(annotation.timestamp), 'HH:mm')}
        </span>
      </div>

      {/* Text Snippet */}
      <div className="text-claude-body-small text-gray-700 mb-5 italic border-l-2 border-gray-300 pl-3 break-words overflow-hidden">
        "{annotation.annotatedText.substring(0, 80)}
        {annotation.annotatedText.length > 80 ? '...' : ''}"
      </div>

      {/* Icon + Comment Body */}
      <div className="flex items-start gap-2 mb-4">
        {/* Icon */}
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>
        
        {/* Comment text */}
      <div
          className={`text-ui-body-small text-gray-800 leading-relaxed break-words flex-1 ${
          annotation.certainty === 'uncertain' ? 'uncertain-comment' : ''
        }`}
        dangerouslySetInnerHTML={{
          __html: formatComment(annotation.comment),
        }}
      />
        
        {/* Globe button */}
        {annotation.browserReference && onReferenceClick && (
          <button
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              onReferenceClick(annotation.browserReference!, {
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
      {annotation.alternatives && annotation.alternatives.length > 0 && (
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
              {annotation.editorSuggestion || "Consider this alternative framing"}
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
                    "{annotation.alternatives[currentAlternativeIndex]}"
                  </div>
                  {/* Style tag */}
                  {annotation.alternativeStyles && annotation.alternativeStyles[currentAlternativeIndex] && (
                    <div className="mt-2 pr-3 text-right">
                      <span className="text-ui-body-extra-small text-gray-500 italic">
                        — {annotation.alternativeStyles[currentAlternativeIndex]}
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
                          ? annotation.alternatives!.length - 1 
                          : currentAlternativeIndex - 1
                      )}
                      className="p-1 rounded-md hover:bg-gray-100 active:scale-95 transition-all cursor-pointer disabled:opacity-30"
                      aria-label="Previous alternative"
                      disabled={annotation.alternatives.length <= 1}
                    >
                      <ChevronLeft className="h-3.5 w-3.5" style={{ color: '#666' }} />
                    </button>
                    
                    <span className="text-ui-body-extra-small text-gray-500">
                      {currentAlternativeIndex + 1}/{annotation.alternatives.length}
                    </span>
                    
                    <button
                      onClick={() => setCurrentAlternativeIndex(
                        (currentAlternativeIndex + 1) % annotation.alternatives!.length
                      )}
                      className="p-1 rounded-md hover:bg-gray-100 active:scale-95 transition-all cursor-pointer disabled:opacity-30"
                      aria-label="Next alternative"
                      disabled={annotation.alternatives.length <= 1}
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
                          annotation.id,
                          annotation.annotatedText,
                          annotation.alternatives || [],
                          annotation.alternativeStyles || [],
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
                          annotation.id,
                          annotation.alternatives![currentAlternativeIndex]
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

      {/* Action Buttons Row - Reference Button + Star + Cross */}
      <div className="flex items-center justify-between gap-2 mt-5">
        {/* Reference Button - Left side, only if exists */}
        {annotation.browserReference && onReferenceClick ? (
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              onReferenceClick(annotation.browserReference!, {
                x: rect.left + rect.width / 2,
                y: rect.bottom
              });
            }}
            className="text-ui-body-small-bold cursor-pointer"
          >
            View Reference
          </Button>
        ) : (
          <div></div>
        )}

        {/* Star + Cross - Right side */}
        <div className="flex items-center gap-2">
          {/* Star/Bookmark Button */}
          <button
            onClick={() => toggleBookmarkAnnotation(annotation.id)}
            className="transition-colors cursor-pointer"
            aria-label={annotation.bookmarked ? 'Remove bookmark' : 'Bookmark'}
          >
            <Star
              className={`h-4 w-4 ${
                annotation.bookmarked ? 'fill-[#C6613F] text-[#C6613F]' : 'text-gray-400'
              }`}
            />
          </button>
          {/* Delete Button */}
          <button
            onClick={() => deleteAnnotationFromHistory(annotation.id)}
            className="transition-colors cursor-pointer"
            aria-label="Delete annotation"
          >
            <X className="h-4 w-4 text-gray-400" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export const CommentCard = memo(CommentCardComponent);

