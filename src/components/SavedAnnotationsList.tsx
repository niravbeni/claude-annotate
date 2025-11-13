'use client';

import { useAppStore } from '@/lib/store';
import { Heart, Waves, CircleAlert, Trash2, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { ChatMessage } from './ChatMessage';

export function SavedAnnotationsList() {
  const { savedAnnotations, loadSavedAnnotation, deleteSavedAnnotation } = useAppStore();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const getIcon = (type: string) => {
    switch (type) {
      case 'heart':
        return <Heart className="h-4 w-4" style={{ color: '#C6613F', fill: '#C6613F', stroke: 'none' }} />;
      case 'squiggle-correction':
      case 'squiggle-suggestion':
        return <Waves className="h-4 w-4" style={{ color: '#C6613F' }} />;
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

  const handleClearAll = () => {
    if (confirm('Delete all saved annotations?')) {
      // Delete all saved annotations one by one (in reverse to avoid index shifting)
      for (let i = savedAnnotations.length - 1; i >= 0; i--) {
        deleteSavedAnnotation(i);
      }
    }
  };

  if (savedAnnotations.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="text-center">
          <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-ui-body-small text-gray-500">
            No saved annotations yet
          </p>
          <p className="text-ui-body-extra-small text-gray-400 mt-1">
            Save annotations from the Active tab to view them here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header with Clear All button */}
      <div className="px-0 pb-1 mb-1 flex items-center justify-end">
        <button
          onClick={handleClearAll}
          className="flex items-center gap-1.5 px-2 py-1 text-ui-body-extra-small text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-all cursor-pointer no-underline"
          style={{ textDecoration: 'none' }}
          aria-label="Clear all saved annotations"
        >
          <Trash2 className="h-3 w-3" />
          Clear All
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 saved-list-scroll">
      {savedAnnotations.map((saved, index) => {
        const isExpanded = expandedIndex === index;
        
        return (
          <motion.div
            key={`${saved.annotation.id}-${index}`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border border-gray-300 bg-white overflow-hidden"
          >
            <div
              className="p-4 cursor-pointer hover:bg-gray-50 transition-all"
              onClick={() => setExpandedIndex(isExpanded ? null : index)}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getIcon(saved.annotation.type)}
                  <span className="text-ui-body-extra-small font-medium text-gray-600">
                    {getTypeLabel(saved.annotation.type)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {saved.chat.length > 0 && (
                    <span className="text-ui-body-extra-small text-gray-400 flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      {saved.chat.length}
                    </span>
                  )}
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Delete this saved annotation?')) {
                        deleteSavedAnnotation(index);
                      }
                    }}
                    className="p-2 min-w-[32px] min-h-[32px] hover:bg-red-50 active:bg-red-100 rounded-lg transition-all cursor-pointer flex items-center justify-center"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-600" />
                  </button>
                </div>
              </div>

              {/* Text Snippet */}
              <div className="text-claude-body-small text-gray-700 mb-2 italic border-l-2 border-gray-300 pl-2 break-words overflow-hidden">
                "{saved.annotation.annotatedText.substring(0, 80)}
                {saved.annotation.annotatedText.length > 80 ? '...' : ''}"
              </div>

              {/* Comment */}
              <div 
                className={`text-ui-body-small text-gray-800 mb-2 break-words overflow-hidden ${
                  saved.annotation.certainty === 'uncertain' ? 'uncertain-comment' : ''
                }`}
                dangerouslySetInnerHTML={{
                  __html: formatComment(saved.annotation.comment),
                }}
              />

              {/* Saved timestamp */}
              <p className="text-ui-body-extra-small text-gray-400">
                Saved {format(new Date(saved.savedAt), 'MMM d, HH:mm')}
              </p>
            </div>

            {/* Expandable Chat History */}
            <AnimatePresence>
              {isExpanded && saved.chat.length > 0 && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border-t border-gray-200 bg-gray-50"
                >
                  <div className="p-4">
                    <p className="text-ui-body-extra-small font-medium text-gray-600 mb-2">
                      Chat History
                    </p>
                    <div className="space-y-3 max-h-[300px] overflow-y-auto saved-chat-scroll">
                      {saved.chat.map((message) => (
                        <ChatMessage key={message.id} message={message} />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
      </div>
    </div>
  );
}

