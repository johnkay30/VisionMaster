import React from 'react';
import { motion } from 'motion/react';
import { Image as ImageIcon, PenTool, Camera, Settings as SettingsIcon, Zap } from 'lucide-react';
import { Card } from './Card';
import { Button } from './Button';
import { PrivacyBadge } from './PrivacyBadge';
import { View } from '../types';

interface DashboardProps {
  setView: (v: View) => void;
}

export const Dashboard = ({ setView }: DashboardProps) => (
  <>
    <div className="mb-16 text-center">
      <motion.div 
        initial={{ y: -20 }} 
        animate={{ y: 0 }}
        className="inline-block p-4 neo-in rounded-3xl mb-6"
      >
        <Zap className="w-10 h-10 text-blue-600" />
      </motion.div>
      <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4 text-slate-900 dark:text-white">
        VisionMaster Pro
      </h1>
      <div className="flex justify-center">
        <PrivacyBadge />
      </div>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8">
    <Card onClick={() => setView('image')} className="flex flex-col items-center text-center gap-4 md:gap-6 p-6 md:p-8">
      <div className="w-16 h-16 md:w-20 md:h-20 neo-in rounded-2xl md:rounded-3xl flex items-center justify-center text-blue-600 dark:text-blue-400">
        <ImageIcon className="w-8 h-8 md:w-10 md:h-10" />
      </div>
      <div>
        <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">Image Engine</h3>
        <p className="text-slate-700 dark:text-slate-400 text-xs md:text-sm mt-1 md:mt-2 font-bold">95%+ Precision Removal</p>
      </div>
    </Card>

    <Card onClick={() => setView('signature')} className="flex flex-col items-center text-center gap-4 md:gap-6 p-6 md:p-8">
      <div className="w-16 h-16 md:w-20 md:h-20 neo-in rounded-2xl md:rounded-3xl flex items-center justify-center text-purple-600 dark:text-purple-400">
        <PenTool className="w-8 h-8 md:w-10 md:h-10" />
      </div>
      <div>
        <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">Signature Pro</h3>
        <p className="text-slate-700 dark:text-slate-400 text-xs md:text-sm mt-1 md:mt-2 font-bold">Ink Smoothing Algorithm</p>
      </div>
    </Card>

    <Card onClick={() => setView('passport')} className="flex flex-col items-center text-center gap-4 md:gap-6 p-6 md:p-8">
      <div className="w-16 h-16 md:w-20 md:h-20 neo-in rounded-2xl md:rounded-3xl flex items-center justify-center text-green-600 dark:text-green-400">
        <Camera className="w-8 h-8 md:w-10 md:h-10" />
      </div>
      <div>
        <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">Passport Studio</h3>
        <p className="text-slate-700 dark:text-slate-400 text-xs md:text-sm mt-1 md:mt-2 font-bold">AR Compliance Overlay</p>
      </div>
    </Card>

    <Card onClick={() => setView('settings')} className="flex flex-col items-center text-center gap-4 md:gap-6 p-6 md:p-8">
      <div className="w-16 h-16 md:w-20 md:h-20 neo-in rounded-2xl md:rounded-3xl flex items-center justify-center text-gray-600 dark:text-zinc-400">
        <SettingsIcon className="w-8 h-8 md:w-10 md:h-10" />
      </div>
      <div>
        <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">Settings</h3>
        <p className="text-slate-700 dark:text-slate-400 text-xs md:text-sm mt-1 md:mt-2 font-bold">Privacy & Themes</p>
      </div>
    </Card>
  </div>

    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.8 }}
      className="mt-20 flex justify-center"
    >
      <Button variant="neo" className="text-slate-600 dark:text-slate-400 gap-3 px-10" onClick={() => setView('settings')}>
        <SettingsIcon className="w-6 h-6" />
        System Preferences
      </Button>
    </motion.div>
  </>
);
