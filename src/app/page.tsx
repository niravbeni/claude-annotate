'use client';

import { Header } from '@/components/Header';
import { TextEditor } from '@/components/TextEditor';
import { CommentSidebar } from '@/components/CommentSidebar';
import { BrowserModal } from '@/components/BrowserModal';
import { useAppStore } from '@/lib/store';

export default function Home() {
  const { activeBrowserReference, isBrowserModalFullscreen, closeBrowserModal, toggleBrowserFullscreen } = useAppStore();

  return (
    <div className="flex flex-col h-screen" style={{ backgroundColor: '#FAF9F5' }}>
      <Header />
      
      <main className="flex flex-col lg:flex-row flex-1 overflow-hidden" style={{ backgroundColor: '#FAF9F5' }}>
        {/* Text Editor - 75% width on desktop, full width on mobile/tablet */}
        <div className="flex-1 lg:w-3/4 overflow-auto lg:border-r h-full" style={{ backgroundColor: '#FAF9F5' }}>
          <TextEditor />
        </div>

        {/* Comment Sidebar - 25% width on desktop, 40% height on mobile */}
        <aside className="w-full lg:w-1/4 h-2/5 lg:h-full overflow-auto border-t lg:border-t-0">
          <CommentSidebar />
        </aside>
      </main>

      {/* Browser Modal */}
      {activeBrowserReference && (
        <BrowserModal
          reference={activeBrowserReference}
          isFullscreen={isBrowserModalFullscreen}
          onClose={closeBrowserModal}
          onToggleFullscreen={toggleBrowserFullscreen}
        />
      )}
    </div>
  );
}
