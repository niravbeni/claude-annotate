'use client';

import { AnalyzeButtonProps } from '@/types';

export function AnalyzeButton({ isAnalyzing, isDisabled, onClick }: AnalyzeButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={isDisabled || isAnalyzing}
      className={`
        relative flex items-center justify-center rounded-lg transition-all cursor-pointer
        ${isDisabled || isAnalyzing 
          ? 'bg-gray-300 cursor-not-allowed' 
          : 'bg-[#C6613F] hover:bg-[#E08A68] active:scale-95'
        }
        disabled:opacity-50
      `}
      style={{
        width: '40px',
        height: '40px',
        border: '0.5px solid rgba(31, 30, 29, 0.15)',
        boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)'
      }}
      aria-label={isAnalyzing ? 'Analyzing text' : 'Send text for analysis'}
      aria-busy={isAnalyzing}
    >
      {/* Custom arrow */}
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
        {/* Vertical line */}
        <line x1="12" y1="18" x2="12" y2="7" />
        {/* Arrow head */}
        <polyline points="7 11 12 7 17 11" />
      </svg>
    </button>
  );
}

