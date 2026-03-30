import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { Button } from './Button';

interface HeaderProps {
  title: string;
  onBack?: () => void;
}

export const Header = ({ title, onBack }: HeaderProps) => (
  <div className="flex items-center gap-4 md:gap-6 mb-6 md:mb-10">
    {onBack && (
      <Button variant="neo" onClick={onBack} className="p-2 md:p-3 rounded-full w-10 h-10 md:w-12 md:h-12 shrink-0">
        <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
      </Button>
    )}
    <h1 className="text-2xl md:text-4xl font-black tracking-tighter text-slate-900 dark:text-white truncate">{title}</h1>
  </div>
);
