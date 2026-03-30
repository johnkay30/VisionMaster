import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Sun, Moon, Info, Maximize, RefreshCw, LogOut, Scan } from 'lucide-react';
import { Header } from './Header';
import { Card } from './Card';
import { Button } from './Button';
import { useTheme } from './ThemeProvider';
import { cn } from '../lib/utils';

interface SettingsViewProps {
  onBack: () => void;
}

export const SettingsView = ({ onBack }: SettingsViewProps) => {
  const { theme, toggleTheme } = useTheme();
  const [showPolicy, setShowPolicy] = useState(false);

  return (
    <div className="max-w-2xl mx-auto space-y-6 md:space-y-8">
      <Header title="Settings" onBack={onBack} />
      
      <div className="space-y-4 md:space-y-6">
        <Card variant="out" className="flex items-center justify-between p-4 md:p-6">
          <div className="flex items-center gap-4 md:gap-6">
            <div className="w-12 h-12 md:w-16 md:h-16 neo-in rounded-xl md:rounded-2xl flex items-center justify-center">
              {theme === 'light' ? <Sun className="w-6 h-6 md:w-8 md:h-8 text-orange-500" /> : <Moon className="w-6 h-6 md:w-8 md:h-8 text-blue-400" />}
            </div>
            <div>
              <h4 className="text-lg md:text-xl font-black text-slate-900 dark:text-white">Interface Theme</h4>
              <p className="text-xs md:text-sm text-slate-700 dark:text-slate-400 font-bold">OLED Dark / Neomorphic Light</p>
            </div>
          </div>
          <button 
            onClick={toggleTheme}
            className={cn(
              "w-14 h-8 md:w-16 md:h-10 rounded-full transition-all neo-in relative",
              theme === 'dark' ? "bg-blue-600/20" : "bg-gray-200"
            )}
          >
            <div className={cn(
              "absolute top-1 w-6 h-6 md:w-8 md:h-8 rounded-full transition-all neo-out",
              theme === 'dark' ? "left-7 md:left-7 bg-blue-500" : "left-1 bg-white"
            )} />
          </button>
        </Card>

        <Card variant="out" className="flex items-center justify-between p-4 md:p-6" onClick={() => setShowPolicy(!showPolicy)}>
          <div className="flex items-center gap-4 md:gap-6">
            <div className="w-12 h-12 md:w-16 md:h-16 neo-in rounded-xl md:rounded-2xl flex items-center justify-center">
              <Info className="w-6 h-6 md:w-8 md:h-8 text-blue-500" />
            </div>
            <div>
              <h4 className="text-lg md:text-xl font-black text-slate-900 dark:text-white">Privacy Promise</h4>
              <p className="text-xs md:text-sm text-slate-700 dark:text-slate-400 font-bold">VisionClean Policy Highlights</p>
            </div>
          </div>
          <Button variant="neo" className="p-2 rounded-full w-8 h-8 md:w-10 md:h-10">
            <Maximize className={cn("w-4 h-4 transition-transform", showPolicy && "rotate-45")} />
          </Button>
        </Card>

        <AnimatePresence>
          {showPolicy && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <Card variant="in" className="space-y-4 md:space-y-6 p-4 md:p-6">
                <h5 className="font-black text-blue-600 uppercase tracking-widest text-xs md:text-sm">VisionClean Privacy Promise</h5>
                <ul className="space-y-3 md:space-y-4">
                  <li className="flex gap-3 md:gap-4 text-xs md:text-sm font-bold text-slate-700 dark:text-slate-300">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 shrink-0" />
                    <span>Local Processing: All AI matting and extraction logic runs on your device's local neural processor.</span>
                  </li>
                  <li className="flex gap-3 md:gap-4 text-xs md:text-sm font-bold text-slate-700 dark:text-slate-300">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 shrink-0" />
                    <span>Zero Data Persistence: We do not store, upload, or transmit your photos to any cloud server.</span>
                  </li>
                  <li className="flex gap-3 md:gap-4 text-xs md:text-sm font-bold text-slate-700 dark:text-slate-300">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 shrink-0" />
                    <span>Transient Buffers: Temporary files are purged from RAM immediately after a task is completed.</span>
                  </li>
                </ul>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <Card variant="out" className="flex items-center justify-between p-4 md:p-6" onClick={() => {
          if (confirm("This will clear all preferences and agreements. Continue?")) {
            localStorage.clear();
            window.location.reload();
          }
        }}>
          <div className="flex items-center gap-4 md:gap-6">
            <div className="w-12 h-12 md:w-16 md:h-16 neo-in rounded-xl md:rounded-2xl flex items-center justify-center">
              <RefreshCw className="w-6 h-6 md:w-8 md:h-8 text-red-500" />
            </div>
            <div>
              <h4 className="text-lg md:text-xl font-black text-slate-900 dark:text-white">Reset Application</h4>
              <p className="text-xs md:text-sm text-slate-700 dark:text-slate-400 font-bold">Clear Cache & Permissions</p>
            </div>
          </div>
          <Button variant="neo" className="p-2 rounded-full w-8 h-8 md:w-10 md:h-10">
            <LogOut className="w-4 h-4 text-red-500" />
          </Button>
        </Card>

        <div className="pt-16 text-center">
          <div className="inline-block p-6 neo-in rounded-[2rem] mb-6">
            <Scan className="w-12 h-12 text-blue-500" />
          </div>
          <p className="text-slate-600 dark:text-slate-400 font-black tracking-widest uppercase text-xs">VisionMaster Pro v2.5</p>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-2 font-medium">© 2026 AI Vision Specialist Isaac Idol</p>
        </div>
      </div>
    </div>
  );
};
