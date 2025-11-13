'use client';

import { useAppStore } from '@/lib/store';
import { Heart, Waves, CircleAlert, Trash2, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

export function SavedAnnotationsList() {
  const { savedAnnotations, loadSavedAnnotation, deleteSavedAnnotation } = useAppStore();

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
    <div className="h-full overflow-y-auto space-y-3">
      {savedAnnotations.map((saved, index) => (
        <motion.div
          key={`${saved.annotation.id}-${index}`}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border border-gray-300 p-4 cursor-pointer hover:border-[#C6613F] transition-all"
          onClick={() => loadSavedAnnotation(index)}
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
          <div className="text-claude-body-small text-gray-700 mb-2 italic border-l-2 border-gray-300 pl-2">
            "{saved.annotation.annotatedText.substring(0, 80)}
            {saved.annotation.annotatedText.length > 80 ? '...' : ''}"
          </div>

          {/* Saved timestamp */}
          <p className="text-ui-body-extra-small text-gray-400">
            Saved {format(new Date(saved.savedAt), 'MMM d, HH:mm')}
          </p>
        </motion.div>
      ))}
    </div>
  );
}

