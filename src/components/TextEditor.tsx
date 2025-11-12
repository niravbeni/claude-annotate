'use client';

import { useAppStore } from '@/lib/store';
import { AnalyzeButton } from './AnalyzeButton';
import { AnnotatedText } from './AnnotatedText';
import { LIMITS } from '@/lib/constants';
import { toast } from 'sonner';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

export function TextEditor() {
  const {
    text,
    setText,
    isAnalyzing,
    isEditing,
    annotations,
    startAnalysis,
    finishAnalysis,
    commentHistory,
  } = useAppStore();
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const editableRef = useRef<HTMLDivElement>(null);
  const textOnEditStart = useRef<string>('');
  const annotationsBeforeEdit = useRef<typeof annotations>([]);
  
  // Animation state for Claude icon
  const [currentFrame, setCurrentFrame] = useState(0);
  const totalFrames = 15; // thinking0.png to thinking14.png
  
  const setEditing = (editing: boolean) => {
    if (editing) {
      // When entering edit mode, save current state
      textOnEditStart.current = text;
      annotationsBeforeEdit.current = annotations;
      
      useAppStore.setState({ 
        isEditing: true,
        annotations: [] // Clear from view, but they're already in commentHistory
      });
    } else {
      // When exiting edit mode, check if text changed
      const textChanged = text !== textOnEditStart.current;
      
      if (!textChanged && annotationsBeforeEdit.current.length > 0) {
        // No changes made - restore previous annotations
        useAppStore.setState({ 
          isEditing: false,
          annotations: annotationsBeforeEdit.current 
        });
      } else {
        // Text changed or no previous annotations - stay in edit mode for new analysis
        useAppStore.setState({ isEditing: false });
      }
    }
  };

  const handleAnalyze = async () => {
    // Check if we're in edit mode and text hasn't changed
    if (isEditing) {
      const textChanged = text !== textOnEditStart.current;
      
      if (!textChanged && annotationsBeforeEdit.current.length > 0) {
        // No changes made - just restore previous annotations and exit edit mode
        useAppStore.setState({ 
          isEditing: false,
          annotations: annotationsBeforeEdit.current 
        });
        return;
      }
    }

    if (!text.trim()) {
      toast.error('Please enter some text to analyze');
      return;
    }

    if (text.length > LIMITS.maxCharacters) {
      toast.error(`Text exceeds ${LIMITS.maxCharacters} character limit`);
      return;
    }

    try {
      startAnalysis();

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000); // 45 second timeout

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed');
      }

      finishAnalysis(data.annotations);
    } catch (error: any) {
      console.error('Analysis error:', error);
      if (error.name === 'AbortError') {
        toast.error('Analysis timed out. Please try with shorter text.');
      } else {
        toast.error(error.message || 'Failed to analyze text');
      }
      finishAnalysis([]);
    }
  };

  // Handle keyboard shortcut (Cmd/Ctrl+Enter)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        handleAnalyze();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [text, isAnalyzing]);

  // Animate Claude icon when analyzing
  useEffect(() => {
    if (isAnalyzing) {
      const interval = setInterval(() => {
        setCurrentFrame((prev) => (prev + 1) % totalFrames);
      }, 80); // ~12.5 fps for smooth animation

      return () => clearInterval(interval);
    } else {
      // Reset to first frame when not analyzing
      setCurrentFrame(0);
    }
  }, [isAnalyzing]);

  const showAnnotations = annotations.length > 0 && !isEditing;
  const hasAnnotations = annotations.length > 0;

  return (
    <div className="relative h-full flex flex-col">
      {/* Removed top status bar - moved to bottom */}

      {/* Text Content */}
      <div className="flex-1 px-8 py-6" style={{ backgroundColor: '#FAF9F5' }}>
        <div className="relative">
          {showAnnotations ? (
            <>
              {/* Annotated Text inside textbox outline */}
              <div className="w-full min-h-[600px] px-[36px] py-4 pt-[88px] pb-16 border rounded-lg bg-white overflow-auto relative">
                <AnnotatedText />
                
                {/* Claude Icon - top left */}
                <div className="absolute top-3 left-3 z-10">
                  <Image
                    src={`/images/thinking${currentFrame}.png`}
                    alt="Claude"
                    width={40}
                    height={40}
                    className="object-contain"
                    priority
                  />
                </div>
                
                {/* Annotation Count - bottom center */}
                <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 text-ui-body-small text-gray-500">
                  {annotations.length} annotation{annotations.length !== 1 ? 's' : ''} active
                </div>
              </div>
              {/* Action Buttons - positioned at bottom right */}
              <div className="absolute bottom-3 right-3 z-10 flex items-center gap-2">
                {/* Copy Button */}
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(text);
                  }}
                  className="rounded-full p-2.5 transition-all cursor-pointer hover:bg-gray-50 active:scale-95 bg-white"
                  aria-label="Copy to clipboard"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                </button>
                {/* Edit Button */}
                <button
                  onClick={() => setEditing(true)}
                  className="rounded-full p-2.5 transition-all cursor-pointer shadow-md hover:shadow-lg hover:opacity-90 active:scale-95 bg-black"
                  aria-label="Edit text"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Edit mode - clean textarea for editing */}
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full min-h-[600px] px-[36px] py-4 pt-[88px] pb-16 editor-text border rounded-lg bg-white resize-none focus:outline-none focus:ring-2 focus:ring-[#C6613F]"
                  style={{
                    cursor: 'text',
                  }}
                  placeholder="Paste your text here..."
                  disabled={isAnalyzing}
                />
                
                {/* Claude Icon - top left */}
                <div className="absolute top-3 left-3 z-10 pointer-events-none">
                  <Image
                    src={`/images/thinking${currentFrame}.png`}
                    alt="Claude"
                    width={40}
                    height={40}
                    className="object-contain"
                    priority
                  />
                </div>
              </div>
              
              {/* Action Buttons - positioned at bottom right */}
              <div className="absolute bottom-3 right-3 z-20 flex items-center gap-2">
                {/* Copy Button */}
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(text);
                  }}
                  className="rounded-full p-2.5 transition-all cursor-pointer hover:bg-gray-50 active:scale-95 bg-white"
                  aria-label="Copy to clipboard"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                </button>
                {/* Send Button */}
                <AnalyzeButton
                  isAnalyzing={isAnalyzing}
                  isDisabled={text.length > LIMITS.maxCharacters || !text.trim()}
                  onClick={handleAnalyze}
                />
              </div>

            </>
          )}
        </div>
      </div>
    </div>
  );
}

