import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Check } from 'lucide-react';
import { Button } from './Button';

interface FirstRunModalProps {
  onAccept: () => void;
}

export const FirstRunModal = ({ onAccept }: FirstRunModalProps) => {
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      // Use a small buffer to account for rounding errors
      if (scrollTop + clientHeight >= scrollHeight - 20) {
        setIsScrolledToBottom(true);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-black/60 backdrop-blur-md">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-2xl neo-out rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 flex flex-col max-h-[90vh]"
      >
        <div className="flex items-center gap-4 mb-6 md:mb-8">
          <div className="w-10 h-10 md:w-12 md:h-12 neo-in rounded-xl md:rounded-2xl flex items-center justify-center text-blue-600">
            <ShieldCheck className="w-5 h-5 md:w-6 md:h-6" />
          </div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tighter text-slate-900 dark:text-white">User Agreement</h2>
        </div>

        <div 
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto pr-4 space-y-8 mb-8 custom-scrollbar"
        >
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-blue-600">
              <Check className="w-5 h-5" />
              <h3 className="font-black uppercase tracking-widest text-sm text-slate-900 dark:text-white">Ethical Use Policy</h3>
            </div>
            <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
              VisionMaster Pro is designed for professional productivity. By using the Signature Pro feature, you agree to use it only for documents you are authorized to sign. Any form of signature forgery or unauthorized replication is strictly prohibited and may carry legal consequences.
            </p>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3 text-green-600">
              <Check className="w-5 h-5" />
              <h3 className="font-black uppercase tracking-widest text-sm text-slate-900 dark:text-white">Privacy Promise</h3>
            </div>
            <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
              We believe your data belongs to you. Our "VisionClean" architecture ensures that all image processing, AI matting, and extraction logic occurs exclusively on your device's local hardware. No photos, biometric data, or extracted signatures are ever uploaded to our servers or stored permanently.
            </p>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3 text-purple-600">
              <Check className="w-5 h-5" />
              <h3 className="font-black uppercase tracking-widest text-sm text-slate-900 dark:text-white">Terms of Service</h3>
            </div>
            <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
              By accepting, you acknowledge that VisionMaster Pro is a tool for image enhancement and extraction. You retain full ownership and responsibility for all content processed through the application. We provide no warranty for the accuracy of AI-generated results in legal contexts.
            </p>
            <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
              You must scroll to the bottom of this agreement to enable the acceptance button. This ensures you have had the opportunity to review our ethical and privacy standards.
            </p>
            <div className="h-20" /> {/* Spacer to force scrolling */}
            <p className="text-center text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">
              End of Agreement
            </p>
          </section>
        </div>

        <Button 
          onClick={onAccept} 
          disabled={!isScrolledToBottom}
          className="w-full py-6 text-xl bg-blue-600 text-slate-900 dark:text-slate-50 shadow-blue-500/20 disabled:grayscale transition-all duration-500"
        >
          {isScrolledToBottom ? "I Accept & Agree" : "Scroll to Read All"}
        </Button>
      </motion.div>
    </div>
  );
};
