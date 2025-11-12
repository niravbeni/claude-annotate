'use client';

import { useAppStore } from '@/lib/store';
import { Annotation as AnnotationType } from '@/types';
import { CommentTooltip } from './CommentTooltip';
import { useMemo, memo } from 'react';

const AnnotatedTextComponent = () => {
  const { text, annotations, annotationsVisible, openBrowserModal } = useAppStore();

  // Helper function to adjust annotation boundaries to complete sentences/phrases
  const adjustToWordBoundaries = (annotation: AnnotationType): AnnotationType => {
    let { startIndex, endIndex } = annotation;
    
    // STEP 1: Extend BACKWARD to sentence start (capital letter after period or start of text)
    let backwardSteps = 0;
    const maxBackward = 200;
    
    while (startIndex > 0 && backwardSteps < maxBackward) {
      const prevChar = text[startIndex - 1];
      
      // Stop at paragraph breaks
      if (prevChar === '\n') {
        break;
      }
      
      // Stop at sentence-ending punctuation followed by space and capital
      if ((prevChar === '.' || prevChar === '!' || prevChar === '?') && 
          startIndex < text.length && 
          /[A-Z]/.test(text[startIndex])) {
        break;
      }
      
      startIndex--;
      backwardSteps++;
    }
    
    // Trim any leading spaces after going backward
    while (startIndex < text.length && text[startIndex] === ' ') {
      startIndex++;
    }
    
    // STEP 2: Adjust end to end of word if mid-word
    if (endIndex < text.length && 
        endIndex > 0 &&
        /[a-zA-Z0-9]/.test(text[endIndex - 1]) && 
        /[a-zA-Z0-9]/.test(text[endIndex])) {
      let steps = 0;
      while (endIndex < text.length && /[a-zA-Z0-9]/.test(text[endIndex]) && steps < 30) {
        endIndex++;
        steps++;
      }
    }
    
    // STEP 3: Extend FORWARD to sentence end
    let forwardSteps = 0;
    const maxForward = 200;
    
    while (endIndex < text.length && forwardSteps < maxForward) {
      const char = text[endIndex];
      
      // STOP at paragraph breaks
      if (char === '\n') {
        break;
      }
      
      // Stop at sentence-ending punctuation
      if (char === '.' || char === '!' || char === '?') {
        endIndex++; // Include the punctuation
        // Skip trailing spaces but stop at newline
        while (endIndex < text.length && text[endIndex] === ' ') {
          endIndex++;
        }
        break;
      }
      
      endIndex++;
      forwardSteps++;
    }
    
    return {
      ...annotation,
      startIndex,
      endIndex,
    };
  };

  // Sort annotations by startIndex to process them in order
  const sortedAnnotations = useMemo(() => {
    return [...annotations]
      .map(adjustToWordBoundaries)
      .sort((a, b) => a.startIndex - b.startIndex);
  }, [annotations, text]);

  // Build segments of text with annotations
  const segments = useMemo(() => {
    if (sortedAnnotations.length === 0) {
      return [{ text, annotations: [] as AnnotationType[] }];
    }

    // Filter out overlapping annotations - keep only the first one for each position
    const nonOverlapping: AnnotationType[] = [];
    let lastEnd = 0;
    
    sortedAnnotations.forEach((annotation) => {
      // Only include if it doesn't overlap with the previous annotation
      if (annotation.startIndex >= lastEnd) {
        nonOverlapping.push(annotation);
        lastEnd = annotation.endIndex;
      }
    });

    const result: Array<{ text: string; annotations: AnnotationType[] }> = [];
    let currentIndex = 0;

    nonOverlapping.forEach((annotation) => {
      // Add text before this annotation
      if (currentIndex < annotation.startIndex) {
        result.push({
          text: text.slice(currentIndex, annotation.startIndex),
          annotations: [],
        });
      }

      // Add annotated text
      result.push({
        text: text.slice(annotation.startIndex, annotation.endIndex),
        annotations: [annotation],
      });

      currentIndex = annotation.endIndex;
    });

    // Add remaining text after last annotation
    if (currentIndex < text.length) {
      result.push({
        text: text.slice(currentIndex),
        annotations: [],
      });
    }

    return result;
  }, [text, sortedAnnotations]);

  const getAnnotationClass = (annotation: AnnotationType) => {
    if (!annotationsVisible) return 'annotation-hidden';

    const baseClass = 'annotation-transition';
    if (annotation.type === 'heart') return `${baseClass} annotation-heart`;
    if (annotation.type === 'squiggle-correction' || annotation.type === 'squiggle-suggestion') {
      return `${baseClass} annotation-squiggle`;
    }
    if (annotation.type === 'circle') return `${baseClass} annotation-circle`;
    return baseClass;
  };

  const formatComment = (comment: string) => {
    // Convert **bold** markdown to HTML
    return comment.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  };

  return (
    <div 
      className="editor-text p-4 leading-loose text-gray-900" 
      style={{ paddingLeft: '40px', whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}
      role="article"
      aria-label="Annotated text with writing feedback"
    >
      {segments.map((segment, index) => {
        if (segment.annotations.length === 0) {
          return (
            <span key={index} className="text-gray-900" style={{ display: 'inline' }}>
              {segment.text}
            </span>
          );
        }

        const annotation = segment.annotations[0];
        // NEVER show reference for heart (validation) annotations
        const hasReference = annotation.type !== 'heart' && annotation.browserReference !== null;

        return (
          <CommentTooltip
            key={index}
            content={formatComment(annotation.comment)}
            certainty={annotation.certainty}
            hasBrowserLink={hasReference}
            onBrowserLinkClick={
              hasReference
                ? () => openBrowserModal(annotation.browserReference!)
                : undefined
            }
          >
            <span 
              className={`${getAnnotationClass(annotation)} text-gray-900`}
              style={{ display: 'inline' }}
              role="mark"
              aria-label={`${annotation.type} annotation`}
            >
              {segment.text}
            </span>
          </CommentTooltip>
        );
      })}
    </div>
  );
};

export const AnnotatedText = memo(AnnotatedTextComponent);

