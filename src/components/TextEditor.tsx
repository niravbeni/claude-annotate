'use client';

import { useAppStore } from '@/lib/store';
import { AnalyzeButton } from './AnalyzeButton';
import { AnnotatedText } from './AnnotatedText';
import { LIMITS } from '@/lib/constants';
import { toast } from 'sonner';
import { useEffect } from 'react';

export function TextEditor() {
  const {
    text,
    setText,
    isAnalyzing,
    annotations,
    startAnalysis,
    finishAnalysis,
  } = useAppStore();

  const handleAnalyze = async () => {
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
      toast.loading('Analyzing your text with Claude AI...', { id: 'analysis' });

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
      toast.success(`Found ${data.annotations.length} annotations!`, { id: 'analysis' });
    } catch (error: any) {
      console.error('Analysis error:', error);
      if (error.name === 'AbortError') {
        toast.error('Analysis timed out. Please try with shorter text.', { id: 'analysis' });
      } else {
        toast.error(error.message || 'Failed to analyze text', { id: 'analysis' });
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

  const hasAnnotations = annotations.length > 0;

  return (
    <div className="relative h-full flex flex-col">
      {/* Status Header */}
      {hasAnnotations && (
        <div className="sticky top-0 z-10 bg-white border-b px-8 py-3">
          <div className="text-ui-body-small-bold text-green-600">
            {annotations.length} annotation{annotations.length !== 1 ? 's' : ''} active
          </div>
        </div>
      )}

      {/* Text Content - Always Editable with Annotation Overlay */}
      <div className="flex-1 px-8 py-6">
        <div className="relative">
          <div className="relative w-full min-h-[600px] border rounded-lg bg-white focus-within:ring-2 focus-within:ring-[#C6613F]">
            {/* Editable textarea - always on bottom layer */}
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className={`absolute inset-0 w-full h-full p-4 pb-16 editor-text resize-none bg-transparent z-10 ${
                hasAnnotations ? 'text-transparent caret-gray-900' : 'text-gray-900'
              }`}
              style={{
                caretColor: hasAnnotations ? '#1a1a1a' : undefined,
              }}
              placeholder="Paste your text here..."
              disabled={isAnalyzing}
            />
            
            {/* Annotation overlay - shows on top when annotations exist */}
            {hasAnnotations && (
              <div className="absolute inset-0 w-full h-full p-4 pb-16 pointer-events-none z-20 overflow-auto">
                <div className="pointer-events-auto">
                  <AnnotatedText />
                </div>
              </div>
            )}
          </div>
          
          {/* Analyze Button - Always visible at bottom right */}
          <div className="absolute bottom-3 right-3 z-30">
            <AnalyzeButton
              isAnalyzing={isAnalyzing}
              isDisabled={text.length > LIMITS.maxCharacters || !text.trim()}
              onClick={handleAnalyze}
            />
          </div>

          {/* Analyzing Overlay */}
          {isAnalyzing && (
            <div className="absolute inset-0 bg-gray-100 bg-opacity-60 flex items-center justify-center rounded-lg pointer-events-none z-40">
              <div className="text-ui-body text-gray-600">Analyzing...</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

