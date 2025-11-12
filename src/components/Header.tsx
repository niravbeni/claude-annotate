'use client';

export function Header() {
  return (
    <header className="border-b px-4 sm:px-6 py-3 sm:py-4" style={{ backgroundColor: '#FAF9F5' }}>
      <div className="flex items-center justify-between">
        <button 
          onClick={() => window.location.reload()}
          className="text-ui-title text-gray-900 cursor-pointer hover:opacity-80 transition-opacity"
          aria-label="Refresh page"
        >
          Claude
        </button>
        
        {/* User Profile */}
        <div className="flex items-center gap-3 bg-white rounded-full px-4 py-2">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FAF9F5' }}>
            <span className="text-ui-body-small-bold text-gray-900 font-bold">YK</span>
          </div>
          <span className="text-ui-body text-gray-900" style={{ fontFamily: 'var(--font-sans)' }}>Yasmina K.</span>
        </div>
      </div>
    </header>
  );
}

