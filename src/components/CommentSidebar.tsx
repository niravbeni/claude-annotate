'use client';

import { useAppStore } from '@/lib/store';
import { CommentCard } from './CommentCard';
import { MessageSquare } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { LIMITS } from '@/lib/constants';

export function CommentSidebar() {
  const { commentHistory, openBrowserModal, text, annotationsVisible, toggleAnnotations, clearHistory } = useAppStore();
  const charCount = text.length;
  const isNearLimit = charCount >= LIMITS.warnAtCharacters;
  const isOverLimit = charCount > LIMITS.maxCharacters;

  // Sort annotations: bookmarked first, then by timestamp
  const sortedHistory = [...commentHistory].sort((a, b) => {
    if (a.bookmarked && !b.bookmarked) return -1;
    if (!a.bookmarked && b.bookmarked) return 1;
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: '#F5F4ED' }}>
      {/* Header */}
      <div className="sticky top-0 border-b px-4 py-4 z-10" style={{ backgroundColor: '#F5F4ED' }}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-ui-body-large-bold text-gray-800 flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Annotation History
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-ui-body-extra-small text-gray-500">
                {commentHistory.length} annotation{commentHistory.length !== 1 ? 's' : ''}
              </p>
              {commentHistory.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="text-ui-body-extra-small text-gray-500 hover:text-gray-700 cursor-pointer"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-3">
            {/* Character Count */}
            <div
              className={`text-ui-body-small ${
                isOverLimit
                  ? 'text-red-600 font-semibold'
                  : isNearLimit
                  ? 'text-yellow-600'
                  : 'text-gray-500'
              }`}
            >
              {charCount} / {LIMITS.maxCharacters}
            </div>

            {/* Show Annotations Toggle */}
            <div className="flex items-center gap-2 cursor-pointer">
              <label
                htmlFor="annotations-toggle-sidebar"
                className="text-ui-body-small text-gray-700 cursor-pointer"
              >
                Show Annotations
              </label>
              <Switch
                id="annotations-toggle-sidebar"
                checked={annotationsVisible}
                onCheckedChange={toggleAnnotations}
                className="cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Comment List */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {commentHistory.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-ui-body-small text-gray-500">
                  No annotations yet.
                </p>
              </div>
        ) : (
          <div className="space-y-3">
            {sortedHistory.map((annotation) => (
              <CommentCard
                key={annotation.id}
                annotation={annotation}
                onReferenceClick={openBrowserModal}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

