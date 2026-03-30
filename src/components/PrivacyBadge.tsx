import React from 'react';
import { Zap } from 'lucide-react';

export const PrivacyBadge = () => (
  <div className="flex items-center gap-2 px-4 py-2 bg-blue-600/10 dark:bg-blue-400/10 text-blue-600 dark:text-blue-400 rounded-full text-xs font-black uppercase tracking-widest mb-6 w-fit shadow-sm border border-blue-200 dark:border-blue-800">
    <Zap className="w-4 h-4" />
    Neural Engine Active: Secure Processing
  </div>
);
