import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ThemeProvider } from './components/ThemeProvider';
import { View } from './types';

// Import extracted components
import { FirstRunModal } from './components/FirstRunModal';
import { PermissionRequest } from './components/PermissionRequest';
import { Dashboard } from './components/Dashboard';
import { ImageModule } from './components/ImageModule';
import { SignatureModule } from './components/SignatureModule';
import { PassportStudio } from './components/PassportStudio';
import { SettingsView } from './components/SettingsView';

export default function App() {
  const [showAgreement, setShowAgreement] = useState(() => {
    return localStorage.getItem('visionmaster_agreement') !== 'true';
  });

  const [view, setView] = useState<View>(() => {
    const granted = localStorage.getItem('visionmaster_permissions');
    return granted === 'true' ? 'dashboard' : 'permissions';
  });

  const handleAcceptAgreement = () => {
    localStorage.setItem('visionmaster_agreement', 'true');
    setShowAgreement(false);
  };

  const handleGrantPermissions = () => {
    localStorage.setItem('visionmaster_permissions', 'true');
    setView('dashboard');
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-[var(--bg)] text-slate-900 dark:text-slate-50 transition-colors font-sans selection:bg-blue-500 selection:text-slate-900 dark:selection:text-white pb-20">
        <AnimatePresence>
          {showAgreement && <FirstRunModal onAccept={handleAcceptAgreement} />}
        </AnimatePresence>

        <div className="max-w-4xl mx-auto px-4 md:px-6 pt-8 md:pt-16 pb-16 md:pb-24">
          
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              {view === 'permissions' && <PermissionRequest onGrant={handleGrantPermissions} />}
              {view === 'dashboard' && <Dashboard setView={setView} />}

              {view === 'image' && <ImageModule onBack={() => setView('dashboard')} />}
              {view === 'signature' && <SignatureModule onBack={() => setView('dashboard')} />}
              {view === 'passport' && <PassportStudio onBack={() => setView('dashboard')} />}
              {view === 'settings' && <SettingsView onBack={() => setView('dashboard')} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </ThemeProvider>
  );
}
