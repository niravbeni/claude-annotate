'use client';

import { useAppStore } from '@/lib/store';
import { Annotation as AnnotationType } from '@/types';
import { CommentTooltip } from './CommentTooltip';
import { useMemo, memo } from 'react';

const AnnotatedTextComponent = () => {
  const { text, annotations, annotationsVisible, openBrowserModal } = useAppStore();

  // Sort annotations by startIndex to process them in order
  const sortedAnnotations = useMemo(() => {
    return [...annotations].sort((a, b) => a.startIndex - b.startIndex);
  }, [annotations]);

  // Build segments of text with annotations
  const segments = useMemo(() => {
    if (sortedAnnotations.length === 0) {
      return [{ text, annotations: [] as AnnotationType[] }];
    }

    const result: Array<{ text: string; annotations: AnnotationType[] }> = [];
    let currentIndex = 0;

    sortedAnnotations.forEach((annotation) => {
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
        const hasReference = annotation.browserReference !== null;

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

