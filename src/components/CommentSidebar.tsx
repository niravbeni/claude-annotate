'use client';

import { useState } from 'react';
import { AnnotationCarousel } from './AnnotationCarousel';
import { AnnotationChat } from './AnnotationChat';
import { SavedAnnotationsList } from './SavedAnnotationsList';
import { useAppStore } from '@/lib/store';

export function CommentSidebar() {
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const { savedAnnotations } = useAppStore();

  return (
    <div className="h-full flex flex-col bg-[#FAF9F5]">
      {/* Tab Switcher */}
      <div className="px-6 pt-6 pb-0 bg-[#FAF9F5]">
        <div className="flex gap-3 border-b" style={{ borderColor: 'rgba(31, 30, 29, 0.15)' }}>
          <button
            onClick={() => setActiveTab('active')}
            className={`px-2 pb-3 text-ui-body-small-bold transition-all cursor-pointer relative ${
              activeTab === 'active'
                ? 'text-[#1F1E1D]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Active
            {activeTab === 'active' && (
              <div 
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1F1E1D]"
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-2 pb-3 text-ui-body-small-bold transition-all cursor-pointer relative flex items-center ${
              activeTab === 'history'
                ? 'text-[#1F1E1D]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Saved
            {savedAnnotations.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-[#C6613F] text-white text-ui-body-extra-small rounded-full">
                {savedAnnotations.length}
              </span>
            )}
            {activeTab === 'history' && (
              <div 
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1F1E1D]"
              />
            )}
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'active' ? (
        <div className="flex-1 flex flex-col overflow-hidden bg-[#FAF9F5]">
          {/* Annotation Carousel - Top section with outline only, no background */}
          <div className="m-4 mb-0 p-4 border border-gray-300 rounded-lg">
            <AnnotationCarousel />
          </div>

          {/* Chat Interface - Bottom section with outline only, no background */}
          <div className="flex-1 overflow-hidden m-4 mt-4 border border-gray-300 rounded-lg">
            <AnnotationChat />
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-hidden bg-[#FAF9F5] p-4">
          <SavedAnnotationsList />
        </div>
      )}
    </div>
  );
}
