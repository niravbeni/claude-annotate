'use client';

import { formatDistanceToNow } from 'date-fns';
import { Heart, CircleAlert, Waves } from 'lucide-react';
import { CommentCardProps } from '@/types';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { memo } from 'react';

const CommentCardComponent = ({ annotation, onReferenceClick }: CommentCardProps) => {
  const getIcon = () => {
    switch (annotation.type) {
      case 'heart':
        return <Heart className="h-4 w-4 text-orange-500 fill-orange-500" />;
      case 'squiggle-correction':
      case 'squiggle-suggestion':
        return <Waves className="h-4 w-4 text-amber-500" />;
      case 'circle':
        return <CircleAlert className="h-4 w-4 text-red-500" />;
    }
  };

  const getTypeLabel = () => {
    switch (annotation.type) {
      case 'heart':
        return 'Validation';
      case 'squiggle-correction':
        return 'Fact Check';
      case 'squiggle-suggestion':
        return 'Suggestion';
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
          {formatDistanceToNow(new Date(annotation.timestamp), {
            addSuffix: true,
          })}
        </span>
      </div>

      {/* Text Snippet */}
      <div className="text-claude-body-small text-gray-700 mb-2 italic border-l-2 border-gray-300 pl-2">
        "{annotation.annotatedText.substring(0, 80)}
        {annotation.annotatedText.length > 80 ? '...' : ''}"
      </div>

      {/* Comment Body */}
      <div
        className="text-ui-body-small text-gray-800 leading-relaxed"
        dangerouslySetInnerHTML={{
          __html:
            annotation.certainty === 'uncertain'
              ? `≈ ${formatComment(annotation.comment)}`
              : formatComment(annotation.comment),
        }}
      />

      {/* Reference Button */}
      {annotation.browserReference && onReferenceClick && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onReferenceClick(annotation.browserReference!)}
          className="mt-3 w-full text-ui-body-small-bold"
        >
          View Reference
        </Button>
      )}
    </motion.div>
  );
};

export const CommentCard = memo(CommentCardComponent);

