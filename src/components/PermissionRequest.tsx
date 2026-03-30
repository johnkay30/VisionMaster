import React from 'react';
import { Lock, EyeOff, Database } from 'lucide-react';
import { Button } from './Button';
import { Card } from './Card';

interface PermissionRequestProps {
  onGrant: () => void;
}

export const PermissionRequest = ({ onGrant }: PermissionRequestProps) => (
  <div className="max-w-2xl mx-auto text-center space-y-6 md:space-y-10 py-6 md:py-10">
    <div className="flex justify-center">
      <div className="w-20 h-20 md:w-24 md:h-24 neo-out rounded-[1.5rem] md:rounded-[2rem] flex items-center justify-center text-blue-600">
        <Lock className="w-10 h-10 md:w-12 md:h-12" />
      </div>
    </div>
    
    <div className="space-y-3 md:space-y-4 px-4">
      <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-slate-900 dark:text-white">Security & Privacy Check</h2>
      <p className="text-slate-600 dark:text-slate-400 font-medium text-base md:text-lg leading-relaxed">
        VisionMaster Pro requires access to your camera and gallery to process images. 
        <span className="block mt-2 text-blue-600 dark:text-blue-400 font-bold">
          No biometric data or photos ever leave your device.
        </span>
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 text-left px-4">
      <Card variant="in" className="p-6">
        <div className="flex items-start gap-4">
          <EyeOff className="w-6 h-6 text-purple-500 shrink-0" />
          <div>
            <h4 className="font-black text-sm uppercase tracking-widest text-slate-900 dark:text-white">Zero Cloud Storage</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Photos are processed in a transient local buffer and purged immediately.</p>
          </div>
        </div>
      </Card>
      <Card variant="in" className="p-6">
        <div className="flex items-start gap-4">
          <Database className="w-6 h-6 text-green-500 shrink-0" />
          <div>
            <h4 className="font-black text-sm uppercase tracking-widest text-slate-900 dark:text-white">Local AI Engine</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">All matting and extraction logic runs on your device's neural processor.</p>
          </div>
        </div>
      </Card>
    </div>

    <Button onClick={onGrant} className="w-full py-6 text-xl bg-blue-600 text-slate-900 dark:text-slate-50 shadow-blue-500/20">
      I Understand & Grant Access
    </Button>
  </div>
);
