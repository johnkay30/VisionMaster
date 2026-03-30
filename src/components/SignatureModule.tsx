import React, { useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { RefreshCw, Download } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Header } from './Header';
import { ProcessingOverlay } from './ProcessingOverlay';
import { PrivacyBadge } from './PrivacyBadge';
import { ImageUploader } from './ImageUploader';
import { Button } from './Button';
import { ApiService } from '../services/apiService';
import { cn } from '../lib/utils';

interface SignatureModuleProps {
  onBack: () => void;
}

export const SignatureModule = ({ onBack }: SignatureModuleProps) => {
  const [original, setOriginal] = useState<string | null>(null);
  const [processed, setProcessed] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => setOriginal(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleProcess = async () => {
    if (!original) return;
    setLoading(true);
    setProgress(0);
    const result = await ApiService.extractSignature(original, (p) => setProgress(p));
    if (result) {
      setProcessed(result);
      if ('vibrate' in navigator) navigator.vibrate(100);
    }
    setLoading(false);
    setProgress(0);
  };

  const handleFinish = async () => {
    await ApiService.clearTransientCache();
    setOriginal(null);
    setProcessed(null);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Header title="Signature Pro" onBack={onBack} />
      <AnimatePresence>
        {loading && <ProcessingOverlay message="Extracting Signature..." progress={progress} />}
      </AnimatePresence>
      <PrivacyBadge />
      
      {!original ? (
        <ImageUploader onUpload={handleUpload} label="Upload signature photo" />
      ) : (
        <div className="space-y-8">
          <div className="neo-in rounded-[3rem] p-8 min-h-[300px] flex items-center justify-center relative">
            {processed ? (
              <img src={processed} className="max-h-[400px] object-contain drop-shadow-2xl" referrerPolicy="no-referrer" />
            ) : (
              <img src={original} className="max-h-[400px] object-contain opacity-40 grayscale" referrerPolicy="no-referrer" />
            )}
            
            {loading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
                <div className="w-24 h-24 neo-out rounded-full flex items-center justify-center animate-spin-slow">
                  <RefreshCw className="w-12 h-12 text-purple-600 animate-spin" />
                </div>
                <p className="font-black text-xl text-purple-600">Processing via VisionMaster Neural Engine...</p>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4 w-full">
            {!processed ? (
              <>
                <Button onClick={handleProcess} disabled={loading} variant="neo" className="w-full py-6 text-xl">
                  Extract & Smooth
                </Button>
                <Button onClick={handleFinish} variant="ghost" className="w-full text-slate-600 dark:text-slate-400 font-bold">
                  Select Another Image
                </Button>
              </>
            ) : (
              <div className="flex gap-6 w-full">
                <Button onClick={handleFinish} variant="neo" className="flex-1">
                  New
                </Button>
                <Button 
                  onClick={async () => {
                    if (processed) {
                      try {
                        const response = await fetch(processed);
                        const blob = await response.blob();
                        await navigator.clipboard.write([
                          new ClipboardItem({ [blob.type]: blob })
                        ]);
                        confetti({ particleCount: 50, spread: 30, origin: { y: 0.8 } });
                      } catch (err) {
                        console.error("Clipboard error:", err);
                      }
                    }
                  }}
                  variant="ghost"
                  className="flex-1 text-purple-600 font-black"
                >
                  Copy
                </Button>
                <a href={processed} download="signature.png" className="flex-1">
                  <Button className="w-full bg-purple-600 text-slate-900 dark:text-slate-50 hover:bg-purple-700">
                    <Download className="w-6 h-6" />
                    Save
                  </Button>
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
