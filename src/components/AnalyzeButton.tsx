'use client';

import { motion } from 'framer-motion';
import { AnalyzeButtonProps } from '@/types';

export function AnalyzeButton({ isAnalyzing, isDisabled, onClick }: AnalyzeButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={isDisabled || isAnalyzing}
      className={`
        relative rounded-full p-2 transition-all cursor-pointer
        ${isDisabled || isAnalyzing 
          ? 'bg-gray-300 cursor-not-allowed' 
          : 'hover:opacity-90 active:scale-95'
        }
        disabled:opacity-50 shadow-md hover:shadow-lg
      `}
      style={{
        backgroundColor: isDisabled || isAnalyzing ? undefined : '#C6613F'
      }}
      aria-label={isAnalyzing ? 'Analyzing text' : 'Send text for analysis'}
      aria-busy={isAnalyzing}
    >
      {/* Custom arrow with longer vertical line */}
      <svg 
        className="h-6 w-6 text-white" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="1.75" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {/* Long vertical line - from bottom connecting to arrow point */}
        <line x1="12" y1="21" x2="12" y2="4" />
        {/* Arrow head - sides only */}
        <polyline points="6 8 12 4 18 8" />
      </svg>
    </button>
  );
}

