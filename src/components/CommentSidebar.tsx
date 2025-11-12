'use client';

import { useAppStore } from '@/lib/store';
import { CommentCard } from './CommentCard';
import { MessageSquare } from 'lucide-react';

export function CommentSidebar() {
  const { commentHistory, openBrowserModal } = useAppStore();

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="sticky top-0 bg-gray-50 border-b px-4 py-4 z-10">
        <h2 className="text-ui-body-large-bold text-gray-800 flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Comment History
        </h2>
        <p className="text-ui-body-extra-small text-gray-500 mt-1">
          {commentHistory.length} comment{commentHistory.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Comment List */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {commentHistory.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-ui-body-small text-gray-500">
              No comments yet.
              <br />
              Click Analyze to start.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {commentHistory.map((annotation) => (
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

