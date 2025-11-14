'use client';

import { useAppStore } from '@/lib/store';
import { AnalyzeButton } from './AnalyzeButton';
import { AnnotatedText } from './AnnotatedText';
import { LIMITS } from '@/lib/constants';
import { toast } from 'sonner';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Switch } from '@/components/ui/switch';

export function TextEditor() {
  const {
    text,
    setText,
    isAnalyzing,
    isEditing,
    annotations,
    annotationsVisible,
    toggleAnnotations,
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

  const charCount = text.length;
  const isNearLimit = charCount >= LIMITS.warnAtCharacters;
  const isOverLimit = charCount > LIMITS.maxCharacters;

  return (
    <div className="relative h-full flex flex-col overflow-hidden">
      {/* Text Content */}
      <div className="h-[calc(100vh-80px)] px-8 pt-6 pb-6 overflow-hidden" style={{ backgroundColor: '#FAF9F5' }}>
        <div className="relative max-w-[700px] mx-auto h-full flex flex-col overflow-hidden">
          {/* Controls Bar - Above Text Box */}
          <div className="pb-2 flex items-center justify-between">
            {/* Left: Show Annotations Toggle */}
            <div className="flex items-center gap-2 cursor-pointer">
              <label
                htmlFor="annotations-toggle-editor"
                className="text-ui-body-small text-gray-700 cursor-pointer"
              >
                Show Annotations
              </label>
              <Switch
                id="annotations-toggle-editor"
                checked={annotationsVisible}
                onCheckedChange={toggleAnnotations}
                className="cursor-pointer"
              />
            </div>

            {/* Right: Annotation Count + Character Count */}
            <div className="flex items-center gap-4">
              {annotations.length > 0 && (
                <div className="text-ui-body-small text-gray-600">
                  {annotations.length} annotation{annotations.length !== 1 ? 's' : ''}
                </div>
              )}
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
            </div>
          </div>
          {showAnnotations ? (
            <>
              {/* Annotated Text inside textbox outline */}
              <div className="w-full flex-1 px-[56px] py-4 pt-[96px] pb-24 border rounded-lg bg-white overflow-hidden relative">
                <AnnotatedText showTooltips={false} />
                
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

                {/* Copy Button - top right */}
                <button
                  onClick={() => navigator.clipboard.writeText(text)}
                  className="absolute top-3 right-3 z-10 flex items-center justify-center transition-all cursor-pointer hover:bg-gray-50 active:scale-95 bg-white"
                  style={{
                    height: '32px',
                    padding: '0px 12px',
                    borderWidth: '0.5px 0.5px 1px 0.5px',
                    borderStyle: 'solid',
                    borderColor: 'rgba(31, 30, 29, 0.15)',
                    borderRadius: '8px',
                  }}
                  aria-label="Copy to clipboard"
                >
                  <span className="text-ui-body-small" style={{ color: '#1F1E1D' }}>
                    Copy
                  </span>
                </button>
              </div>
              {/* Action Buttons - positioned at bottom right */}
              <div className="absolute bottom-6 right-6 z-10 flex items-center gap-2">
                {/* Edit Button */}
                <button
                  onClick={() => setEditing(true)}
                  className="rounded-lg transition-all cursor-pointer hover:bg-gray-100 active:scale-95 flex items-center justify-center"
                  style={{
                    width: '40px',
                    height: '40px'
                  }}
                  aria-label="Edit text"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Edit mode - clean textarea for editing */}
              <div className="relative flex-1 flex flex-col">
                <textarea
                  ref={textareaRef}
                  value={text}
                  onChange={(e) => {
                    // Only allow changes if under the limit
                    if (e.target.value.length <= LIMITS.maxCharacters) {
                      setText(e.target.value);
                    }
                  }}
                  className="w-full flex-1 px-[56px] py-4 pt-[88px] pb-16 editor-text border-2 border-gray-200 rounded-lg bg-white resize-none focus:outline-none focus:border-[#C6613F]"
                  style={{
                    cursor: 'text',
                    overflow: 'hidden',
                  }}
                  placeholder="Write your text here..."
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

                {/* Copy Button - top right */}
                <button
                  onClick={() => navigator.clipboard.writeText(text)}
                  className="absolute top-3 right-3 z-10 flex items-center justify-center transition-all cursor-pointer hover:bg-gray-50 active:scale-95 bg-white"
                  style={{
                    height: '32px',
                    padding: '0px 12px',
                    borderWidth: '0.5px 0.5px 1px 0.5px',
                    borderStyle: 'solid',
                    borderColor: 'rgba(31, 30, 29, 0.15)',
                    borderRadius: '8px',
                  }}
                  aria-label="Copy to clipboard"
                >
                  <span className="text-ui-body-small" style={{ color: '#1F1E1D' }}>
                    Copy
                  </span>
                </button>
              </div>
              
              {/* Action Buttons - positioned at bottom right */}
              <div className="absolute bottom-6 right-6 z-20 flex items-center gap-2">
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

