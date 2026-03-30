import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import { RefreshCw, Download, Zap, Save } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Header } from './Header';
import { ProcessingOverlay } from './ProcessingOverlay';
import { PrivacyBadge } from './PrivacyBadge';
import { ImageUploader } from './ImageUploader';
import { Button } from './Button';
import { Card } from './Card';
import { ApiService } from '../services/apiService';
import { cn } from '../lib/utils';

interface ImageModuleProps {
  onBack: () => void;
}

export const ImageModule = ({ onBack }: ImageModuleProps) => {
  const [original, setOriginal] = useState<string | null>(() => {
    return localStorage.getItem('visionmaster_autosave_original');
  });
  const [processed, setProcessed] = useState<string | null>(() => {
    return localStorage.getItem('visionmaster_autosave_processed');
  });
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [sensitivity, setSensitivity] = useState(50);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  // Auto-save logic: every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (original || processed) {
        if (original) localStorage.setItem('visionmaster_autosave_original', original);
        if (processed) localStorage.setItem('visionmaster_autosave_processed', processed);
        
        const now = new Date().toLocaleTimeString();
        setLastSaved(now);
        console.log('VisionMaster Auto-save completed at:', now);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [original, processed]);

  const handleUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setOriginal(dataUrl);
      // Immediate save on upload for better UX
      localStorage.setItem('visionmaster_autosave_original', dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const triggerHaptic = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100]);
    }
  };

  const handleProcess = async () => {
    if (!original) return;
    setLoading(true);
    setProgress(0);
    const result = await ApiService.removeBackground(original, (p) => setProgress(p));
    if (result) {
      setProcessed(result);
      // Immediate save after processing
      localStorage.setItem('visionmaster_autosave_processed', result);
      triggerHaptic();
      confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 }, colors: ['#3b82f6', '#8b5cf6', '#ffffff'] });
    }
    setLoading(false);
    setProgress(0);
  };

  const handleFinish = async () => {
    await ApiService.clearTransientCache();
    localStorage.removeItem('visionmaster_autosave_original');
    localStorage.removeItem('visionmaster_autosave_processed');
    setOriginal(null);
    setProcessed(null);
    setLastSaved(null);
  };

  const handleDownload = () => {
    if (!processed) return;
    const link = document.createElement('a');
    link.download = `visionmaster-pro-bg-removed-${Date.now()}.png`;
    link.href = processed;
    link.click();
    confetti({ 
      particleCount: 150, 
      spread: 70, 
      origin: { y: 0.6 },
      colors: ['#3b82f6', '#8b5cf6', '#ffffff']
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Header title="Image Engine" onBack={onBack} />
      <AnimatePresence>
        {loading && <ProcessingOverlay message="Removing Background..." progress={progress} />}
      </AnimatePresence>
      <div className="flex justify-between items-center mb-4">
        <PrivacyBadge />
        {lastSaved && (
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <Save className="w-3 h-3" />
            Auto-saved {lastSaved}
          </div>
        )}
      </div>
      
      {!original ? (
        <ImageUploader onUpload={handleUpload} />
      ) : (
        <div className="space-y-8">
          <div className="neo-in rounded-[3rem] p-4 overflow-hidden relative group">
            <div className="aspect-square rounded-[2.5rem] overflow-hidden bg-zinc-100 dark:bg-zinc-800 relative">
              {processed ? (
                <div className="relative w-full h-full">
                  <img src={processed} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                </div>
              ) : (
                <div className="relative w-full h-full">
                  <img src={original} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                  {loading && <div className="absolute inset-x-0 top-0 scanning-line" />}
                </div>
              )}
              
              {loading && (
                <div className="absolute inset-0 bg-white/60 dark:bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center text-slate-900 dark:text-slate-50 gap-6">
                  <div className="w-20 h-20 neo-out rounded-full flex items-center justify-center animate-pulse">
                    <Zap className="w-10 h-10 text-yellow-400" />
                  </div>
                  <p className="font-black text-xl tracking-tight">Processing via VisionMaster Neural Engine...</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-6 w-full">
            {!processed && (
              <Card variant="in" className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">Edge Sensitivity</label>
                  <span className="text-blue-500 font-black text-sm">{sensitivity}%</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="100" 
                  value={sensitivity} 
                  onChange={(e) => setSensitivity(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-[10px] text-slate-600 dark:text-slate-400 font-bold uppercase tracking-tighter">
                  <span>Soft Edges</span>
                  <span>Sharp Edges</span>
                </div>
              </Card>
            )}

            {!processed ? (
              <>
                <Button onClick={handleProcess} disabled={loading} variant="neo" className="w-full py-6 text-xl">
                  <RefreshCw className={cn("w-6 h-6", loading && "animate-spin")} />
                  Process Subject
                </Button>
                <Button onClick={handleFinish} variant="ghost" className="w-full text-slate-600 dark:text-slate-400 font-bold">
                  Select Another Image
                </Button>
              </>
            ) : (
              <div className="flex gap-6 w-full">
                <Button onClick={handleFinish} variant="neo" className="flex-1">
                  New Image
                </Button>
                <Button onClick={handleDownload} className="flex-1 bg-blue-600 text-slate-900 dark:text-slate-50 hover:bg-blue-700">
                  <Download className="w-6 h-6" />
                  Save to Gallery
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
