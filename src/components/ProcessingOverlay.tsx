import React from 'react';
import { motion } from 'motion/react';
import { Zap } from 'lucide-react';

interface ProcessingOverlayProps {
  message?: string;
  progress?: number;
}

export const ProcessingOverlay = ({ message = "Neural Engine Processing...", progress }: ProcessingOverlayProps) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-100/80 dark:bg-slate-950/80 backdrop-blur-xl p-8 text-center"
  >
    <div className="relative w-24 h-24 mb-8">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 border-4 border-blue-500/20 rounded-full"
      />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        className="absolute inset-2 border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full shadow-[0_0_20px_rgba(59,130,246,0.5)]"
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <Zap className="w-8 h-8 text-blue-500 animate-pulse" />
      </div>
    </div>
    
    <div className="w-full max-w-xs mb-6">
      <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">{message}</h2>
      
      {progress !== undefined && (
        <div className="space-y-2">
          <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-blue-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-blue-500">{progress}% Complete</p>
        </div>
      )}
    </div>

    <p className="text-slate-600 dark:text-slate-400 text-sm max-w-xs">
      This may take a few seconds on mobile devices as we process everything locally for your privacy.
    </p>
  </motion.div>
);
