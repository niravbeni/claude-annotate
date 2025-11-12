'use client';

import { useAppStore } from '@/lib/store';
import { AnalyzeButton } from './AnalyzeButton';
import { AnnotatedText } from './AnnotatedText';
import { LIMITS } from '@/lib/constants';
import { toast } from 'sonner';
import { useEffect, useRef } from 'react';

export function TextEditor() {
  const {
    text,
    setText,
    isAnalyzing,
    isEditing,
    annotations,
    startAnalysis,
    finishAnalysis,
  } = useAppStore();

  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  const showAnnotations = annotations.length > 0 && !isEditing;

  return (
    <div className="relative h-full flex flex-col">
      {/* Status Header */}
      {showAnnotations && (
        <div className="sticky top-0 z-10 bg-white border-b px-8 py-3">
          <div className="text-ui-body-small-bold text-green-600">
            {annotations.length} annotation{annotations.length !== 1 ? 's' : ''} found
          </div>
        </div>
      )}

      {/* Text Content */}
      <div className="flex-1 px-8 py-6">
        {showAnnotations ? (
          <AnnotatedText />
        ) : (
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full min-h-[600px] p-4 pb-16 editor-text border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C6613F] resize-none"
              placeholder="Paste your text here..."
              disabled={isAnalyzing}
            />
            
            {/* Send Button - positioned at bottom right */}
            <div className="absolute bottom-3 right-3 z-10">
              <AnalyzeButton
                isAnalyzing={isAnalyzing}
                isDisabled={text.length > LIMITS.maxCharacters || !text.trim()}
                onClick={handleAnalyze}
              />
            </div>

            {isAnalyzing && (
              <div className="absolute inset-0 bg-gray-100 bg-opacity-60 flex items-center justify-center rounded-lg pointer-events-none">
                <div className="text-ui-body text-gray-600">Analyzing...</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

