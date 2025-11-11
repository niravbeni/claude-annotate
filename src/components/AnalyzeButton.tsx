'use client';

import { motion } from 'framer-motion';
import { ArrowUp, Loader2 } from 'lucide-react';
import { AnalyzeButtonProps } from '@/types';

export function AnalyzeButton({ isAnalyzing, isDisabled, onClick }: AnalyzeButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={isDisabled || isAnalyzing}
      className={`
        relative rounded-full p-2.5 transition-all cursor-pointer
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
      {isAnalyzing ? (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "linear"
          }}
          aria-hidden="true"
        >
          <Loader2 className="h-5 w-5 text-white" />
        </motion.div>
      ) : (
        <ArrowUp className="h-5 w-5 text-white" aria-hidden="true" />
      )}
    </button>
  );
}

