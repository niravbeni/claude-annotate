'use client';

import { format } from 'date-fns';
import { Heart, CircleAlert, Waves, X, Star } from 'lucide-react';
import { CommentCardProps } from '@/types';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { memo } from 'react';
import { useAppStore } from '@/lib/store';

const CommentCardComponent = ({ annotation, onReferenceClick }: CommentCardProps) => {
  const { deleteAnnotationFromHistory, toggleBookmarkAnnotation } = useAppStore();
  const getIcon = () => {
    switch (annotation.type) {
      case 'heart':
        return <Heart className="h-4 w-4" style={{ color: '#C6613F', fill: '#C6613F', stroke: 'none' }} />;
      case 'squiggle-correction':
      case 'squiggle-suggestion':
        return <Waves className="h-4 w-4" style={{ color: '#C6613F' }} />;
      case 'circle':
        return <CircleAlert className="h-4 w-4" style={{ color: 'white', fill: '#C6613F', stroke: 'white' }} />;
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
      className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-3"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {getIcon()}
          <span className="text-ui-body-extra-small font-medium text-gray-600">
            {getTypeLabel()}
          </span>
        </div>
        <span className="text-ui-body-extra-small text-gray-400">
          {format(new Date(annotation.timestamp), 'HH:mm')}
        </span>
      </div>

      {/* Text Snippet */}
      <div className="text-claude-body-small text-gray-700 mb-2 italic border-l-2 border-gray-300 pl-2">
        "{annotation.annotatedText.substring(0, 80)}
        {annotation.annotatedText.length > 80 ? '...' : ''}"
      </div>

      {/* Comment Body */}
      <div
        className={`text-ui-body-small text-gray-800 leading-relaxed ${
          annotation.certainty === 'uncertain' ? 'uncertain-comment' : ''
        }`}
        dangerouslySetInnerHTML={{
          __html: formatComment(annotation.comment),
        }}
      />

      {/* Action Buttons Row - Reference Button + Star + Cross */}
      <div className="flex items-center justify-between gap-2 mt-3">
        {/* Reference Button - Left side, only if exists */}
        {annotation.browserReference && onReferenceClick ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onReferenceClick(annotation.browserReference!)}
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

