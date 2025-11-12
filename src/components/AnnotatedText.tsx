'use client';

import { useAppStore } from '@/lib/store';
import { Annotation as AnnotationType } from '@/types';
import { CommentTooltip } from './CommentTooltip';
import { useMemo, memo } from 'react';

interface AnnotatedTextProps {
  showTooltips?: boolean;
}

const AnnotatedTextComponent = ({ showTooltips = true }: AnnotatedTextProps) => {
  const { text, annotations, annotationsVisible, openBrowserModal } = useAppStore();

  // DEBUG: Log all raw annotations from Claude
  console.log('📊 ALL RAW ANNOTATIONS:', annotations.map(ann => ({
    type: ann.type,
    indices: { start: ann.startIndex, end: ann.endIndex },
    annotatedText: ann.annotatedText,
    actualText: text.slice(ann.startIndex, ann.endIndex),
    match: text.slice(ann.startIndex, ann.endIndex) === ann.annotatedText,
  })));

  // Helper function to fix incorrect indices by finding the annotatedText in the actual text
  const fixAnnotationIndices = (annotation: AnnotationType): AnnotationType => {
    const { startIndex, endIndex, annotatedText } = annotation;
    const actualText = text.slice(startIndex, endIndex);
    
    // If indices are correct, return as-is
    if (actualText === annotatedText) {
      return annotation;
    }
    
    // Otherwise, search for the annotatedText in the full text
    const correctStart = text.indexOf(annotatedText);
    if (correctStart === -1) {
      console.warn('⚠️ Could not find annotatedText in document:', annotatedText);
      return annotation; // Return original if not found
    }
    
    const correctedAnnotation = {
      ...annotation,
      startIndex: correctStart,
      endIndex: correctStart + annotatedText.length,
    };
    
    console.log('🔧 FIXED INDICES:', {
      type: annotation.type,
      annotatedText: annotatedText,
      wrongIndices: { start: startIndex, end: endIndex },
      wrongText: actualText,
      correctIndices: { start: correctStart, end: correctStart + annotatedText.length },
      correctText: text.slice(correctStart, correctStart + annotatedText.length),
    });
    
    return correctedAnnotation;
  };

  // Helper function to adjust annotation boundaries to complete sentences/phrases
  const adjustToWordBoundaries = (annotation: AnnotationType): AnnotationType => {
    let { startIndex, endIndex } = annotation;
    
    // For CIRCLES, be ULTRA PRECISE - minimal adjustment only if cutting a word
    if (annotation.type === 'circle') {
      console.log('🔴 CIRCLE ANNOTATION:', {
        type: annotation.type,
        originalIndices: { start: startIndex, end: endIndex },
        originalText: `"${text.slice(startIndex, endIndex)}"`,
        annotatedText: `"${annotation.annotatedText}"`,
        comment: annotation.comment,
        // Show context around the annotation
        before: `"${text.slice(Math.max(0, startIndex - 20), startIndex)}"`,
        after: `"${text.slice(endIndex, Math.min(text.length, endIndex + 20))}"`,
      });
      // Only adjust if we're literally cutting a word in half
      if (startIndex > 0 && 
          /[a-zA-Z0-9]/.test(text[startIndex - 1]) && 
          /[a-zA-Z0-9]/.test(text[startIndex])) {
        // Move back to start of word (max 10 chars to avoid over-extension)
        let steps = 0;
        while (startIndex > 0 && /[a-zA-Z0-9]/.test(text[startIndex - 1]) && steps < 10) {
          startIndex--;
          steps++;
        }
      }
      
      if (endIndex < text.length && 
          endIndex > 0 &&
          /[a-zA-Z0-9]/.test(text[endIndex - 1]) && 
          /[a-zA-Z0-9]/.test(text[endIndex])) {
        // Move forward to end of word (max 10 chars)
        let steps = 0;
        while (endIndex < text.length && /[a-zA-Z0-9]/.test(text[endIndex]) && steps < 10) {
          endIndex++;
          steps++;
        }
      }
      
      // DO NOT extend circles beyond words - return immediately
      const adjusted = {
        ...annotation,
        startIndex,
        endIndex,
      };
      console.log('🔴 CIRCLE ADJUSTED:', {
        adjustedIndices: { start: startIndex, end: endIndex },
        adjustedText: `"${text.slice(startIndex, endIndex)}"`,
        changed: annotation.startIndex !== startIndex || annotation.endIndex !== endIndex,
      });
      return adjusted;
    }
    
    // For HEARTS and SQUIGGLES, extend to complete sentences
    // STEP 1: Extend BACKWARD to sentence start
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

  // Sort annotations by startIndex, but prioritize squiggles and circles over hearts
  const sortedAnnotations = useMemo(() => {
    return [...annotations]
      .map(fixAnnotationIndices) // First, fix any incorrect indices from Claude
      .map(adjustToWordBoundaries) // Then, adjust to word/sentence boundaries
      .sort((a, b) => {
        // First sort by position
        if (a.startIndex !== b.startIndex) {
          return a.startIndex - b.startIndex;
        }
        // If same position, prioritize: circle > squiggle > heart
        const priority = { 'circle': 0, 'squiggle-correction': 1, 'squiggle-suggestion': 2, 'heart': 3 };
        return (priority[a.type as keyof typeof priority] || 4) - (priority[b.type as keyof typeof priority] || 4);
      });
  }, [annotations, text]);

  // Build segments of text with annotations - allowing overlaps!
  const segments = useMemo(() => {
    if (sortedAnnotations.length === 0) {
      return [{ text, annotations: [] as AnnotationType[] }];
    }

    // Filter out overlapping hearts (hearts should be specific to individual sentences)
    const nonOverlappingHearts: AnnotationType[] = [];
    const heartAnnotations = sortedAnnotations.filter(a => a.type === 'heart');
    
    heartAnnotations.forEach((heart) => {
      // Check if this heart overlaps with any already-accepted hearts
      const overlaps = nonOverlappingHearts.some(
        existingHeart => 
          !(heart.endIndex <= existingHeart.startIndex || heart.startIndex >= existingHeart.endIndex)
      );
      
      if (!overlaps) {
        nonOverlappingHearts.push(heart);
      } else {
        console.log('💔 SKIPPED OVERLAPPING HEART:', {
          text: text.slice(heart.startIndex, heart.endIndex),
          overlappedWith: nonOverlappingHearts.find(
            h => !(heart.endIndex <= h.startIndex || heart.startIndex >= h.endIndex)
          ),
        });
      }
    });
    
    if (heartAnnotations.length > nonOverlappingHearts.length) {
      console.log(`💖 HEARTS: ${heartAnnotations.length} total, ${nonOverlappingHearts.length} kept, ${heartAnnotations.length - nonOverlappingHearts.length} removed (overlapping)`);
    }
    
    // Combine non-overlapping hearts with all squiggles/circles
    const finalAnnotations = [
      ...nonOverlappingHearts,
      ...sortedAnnotations.filter(a => a.type !== 'heart')
    ].sort((a, b) => {
      if (a.startIndex !== b.startIndex) {
        return a.startIndex - b.startIndex;
      }
      const priority = { 'circle': 0, 'squiggle-correction': 1, 'squiggle-suggestion': 2, 'heart': 3 };
      return (priority[a.type as keyof typeof priority] || 4) - (priority[b.type as keyof typeof priority] || 4);
    });

    // Create a map of positions to annotations to handle overlaps
    const positionMap = new Map<number, AnnotationType[]>();
    
    // For each character position, track which annotations cover it
    finalAnnotations.forEach((annotation) => {
      for (let i = annotation.startIndex; i < annotation.endIndex; i++) {
        if (!positionMap.has(i)) {
          positionMap.set(i, []);
        }
        positionMap.get(i)!.push(annotation);
      }
    });

    // Build segments by finding continuous ranges with the same annotation set
    const result: Array<{ text: string; annotations: AnnotationType[] }> = [];
    let currentIndex = 0;
    
    while (currentIndex < text.length) {
      const currentAnnotations = positionMap.get(currentIndex) || [];
      
      // Find the end of this segment (where annotation set changes)
      let endIndex = currentIndex + 1;
      while (endIndex < text.length) {
        const nextAnnotations = positionMap.get(endIndex) || [];
        // Check if annotation sets are identical
        if (
          currentAnnotations.length !== nextAnnotations.length ||
          !currentAnnotations.every(a => nextAnnotations.includes(a))
        ) {
          break;
        }
        endIndex++;
      }
      
      // Add this segment
      result.push({
        text: text.slice(currentIndex, endIndex),
        annotations: currentAnnotations,
      });
      
      currentIndex = endIndex;
    }

    // Debug: log segments with circles
    const circleSegments = result.filter(seg => 
      seg.annotations.some(ann => ann.type === 'circle')
    );
    if (circleSegments.length > 0) {
      console.log('🔴 SEGMENTS WITH CIRCLES:', circleSegments);
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
      className="editor-text leading-loose text-gray-900" 
      style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}
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

        // Priority: circle > squiggle > heart (for tooltip reference)
        const priority = { 'circle': 0, 'squiggle-correction': 1, 'squiggle-suggestion': 2, 'heart': 3 };
        const primaryAnnotation = segment.annotations.sort((a, b) => 
          (priority[a.type as keyof typeof priority] || 4) - (priority[b.type as keyof typeof priority] || 4)
        )[0];
        
        // Check if this is the LAST segment for each heart annotation
        // (to only show heart icon at the end)
        const heartAnnotations = segment.annotations.filter(ann => ann.type === 'heart');
        const isLastSegmentForHeart = heartAnnotations.some(heartAnn => {
          // Find the last character of this heart annotation
          const heartEndIndex = heartAnn.endIndex;
          // Calculate this segment's end position in the original text
          const segmentStartIndex = segments.slice(0, index).reduce((acc, seg) => acc + seg.text.length, 0);
          const segmentEndIndex = segmentStartIndex + segment.text.length;
          // This is the last segment if the segment end matches or exceeds the heart end
          return segmentEndIndex >= heartEndIndex;
        });
        
        // Build annotation classes, but use special class for hearts not at the end
        const allAnnotationClasses = segment.annotations
          .map(ann => {
            if (ann.type === 'heart' && !isLastSegmentForHeart) {
              // Use a special class that doesn't add the heart icon
              return 'annotation-heart-body';
            }
            return getAnnotationClass(ann);
          })
          .filter(cls => cls !== 'annotation-hidden')
          .join(' ');
        
        // Debug: log if this segment has a circle
        if (segment.annotations.some(ann => ann.type === 'circle')) {
          console.log('🔴 RENDERING CIRCLE SEGMENT:', {
            text: segment.text,
            annotations: segment.annotations.map(a => a.type),
            classes: allAnnotationClasses,
          });
        }
        
        // Sort annotations: hearts first, then others
        const sortedAnnotations = [...segment.annotations].sort((a, b) => {
          if (a.type === 'heart' && b.type !== 'heart') return -1;
          if (a.type !== 'heart' && b.type === 'heart') return 1;
          return 0;
        });
        
        // For now, show reference only if there's a non-heart annotation with one
        // The tooltip will be restructured to show inline references per comment
        const hasReference = sortedAnnotations.some(
          ann => ann.type !== 'heart' && ann.browserReference !== null
        );
        const referenceAnnotation = sortedAnnotations.find(
          ann => ann.type !== 'heart' && ann.browserReference !== null
        );
        
        // Combine comments (sorted: hearts first)
        const combinedComment = sortedAnnotations
          .map(ann => formatComment(ann.comment))
          .join('<br/><br/>');

        const annotatedSpan = (
          <span 
            className={`${allAnnotationClasses} text-gray-900`}
            style={{ display: 'inline' }}
            role="mark"
            aria-label={`${segment.annotations.map(a => a.type).join(', ')} annotation`}
          >
            {segment.text}
          </span>
        );

        if (!showTooltips) {
          return <span key={index}>{annotatedSpan}</span>;
        }

        return (
          <CommentTooltip
            key={index}
            annotations={sortedAnnotations}
            onReferenceClick={openBrowserModal}
          >
            {annotatedSpan}
          </CommentTooltip>
        );
      })}
    </div>
  );
};

export const AnnotatedText = memo(AnnotatedTextComponent);

