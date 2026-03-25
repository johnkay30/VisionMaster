import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import '@tensorflow/tfjs-backend-webgl';
import * as tf from '@tensorflow/tfjs-core';
import { 
  Image as ImageIcon, 
  PenTool, 
  Settings as SettingsIcon, 
  LogOut, 
  ChevronLeft, 
  Upload, 
  Download, 
  RefreshCw,
  Sun,
  Moon,
  Check,
  Camera,
  ShieldCheck,
  Zap,
  Scan,
  Maximize,
  Lock,
  EyeOff,
  Database,
  Info
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { cn } from './lib/utils';
import { ThemeProvider, useTheme } from './components/ThemeProvider';
import { ApiService } from './services/apiService';
import confetti from 'canvas-confetti';

// --- Types ---
type View = 'dashboard' | 'image' | 'signature' | 'passport' | 'settings' | 'permissions';

// --- Components ---

const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'neo' }>(
  ({ className, variant = 'primary', ...props }, ref) => {
    const variants = {
      primary: 'bg-blue-600 text-slate-50 hover:bg-blue-700 active:scale-95 shadow-lg',
      secondary: 'bg-gray-200 text-gray-900 dark:bg-gray-800 dark:text-slate-200 hover:bg-gray-300 dark:hover:bg-gray-700 active:scale-95',
      ghost: 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95',
      danger: 'bg-red-600 text-slate-50 hover:bg-red-700 active:scale-95',
      neo: 'neo-btn font-black text-gray-900 dark:text-slate-200',
    };
    return (
      <button
        ref={ref}
        className={cn('px-6 py-3 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed', variants[variant], className)}
        {...props}
      />
    );
  }
);

const Card = ({ children, className, onClick, variant = 'out' }: { children: React.ReactNode; className?: string; onClick?: () => void; variant?: 'out' | 'in' }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={cn(
      'rounded-[2rem] p-8 cursor-pointer transition-all duration-300',
      variant === 'out' ? 'neo-out' : 'neo-in',
      className
    )}
  >
    {children}
  </motion.div>
);

const Header = ({ title, onBack }: { title: string; onBack?: () => void }) => (
  <div className="flex items-center gap-4 md:gap-6 mb-6 md:mb-10">
    {onBack && (
      <Button variant="neo" onClick={onBack} className="p-2 md:p-3 rounded-full w-10 h-10 md:w-12 md:h-12 shrink-0">
        <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
      </Button>
    )}
    <h1 className="text-2xl md:text-4xl font-black tracking-tighter text-slate-950 dark:text-white truncate">{title}</h1>
  </div>
);

const PrivacyBadge = () => (
  <div className="flex items-center gap-2 px-4 py-2 bg-blue-600/10 dark:bg-blue-400/10 text-blue-600 dark:text-blue-400 rounded-full text-xs font-black uppercase tracking-widest mb-6 w-fit shadow-sm border border-blue-200 dark:border-blue-800">
    <Zap className="w-4 h-4" />
    Neural Engine Active: Secure Processing
  </div>
);

const ImageUploader = ({ onUpload, label = "Drop image here or click to upload" }: { onUpload: (file: File) => void; label?: string }) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => acceptedFiles[0] && onUpload(acceptedFiles[0]),
    accept: { 'image/*': [] },
    multiple: false,
  } as any);

  return (
    <div
      {...getRootProps()}
      className={cn(
        'neo-in rounded-[2rem] md:rounded-[2.5rem] p-8 md:p-16 flex flex-col items-center justify-center gap-4 md:gap-6 transition-all cursor-pointer border-2 border-transparent',
        isDragActive && 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/10'
      )}
    >
      <input {...getInputProps()} />
      <div className="w-16 h-16 md:w-20 md:h-20 neo-out rounded-full flex items-center justify-center text-blue-500">
        <Upload className="w-8 h-8 md:w-10 md:h-10" />
      </div>
      <p className="text-gray-900 dark:text-slate-200 text-center font-black text-base md:text-lg px-4">{label}</p>
    </div>
  );
};

// --- Permission Request Screen ---

const FirstRunModal = ({ onAccept }: { onAccept: () => void }) => {
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
          <h2 className="text-2xl md:text-3xl font-black tracking-tighter">User Agreement</h2>
        </div>

        <div 
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto pr-4 space-y-8 mb-8 custom-scrollbar"
        >
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-blue-600">
              <Check className="w-5 h-5" />
              <h3 className="font-black uppercase tracking-widest text-sm">Ethical Use Policy</h3>
            </div>
            <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
              VisionMaster Pro is designed for professional productivity. By using the Signature Pro feature, you agree to use it only for documents you are authorized to sign. Any form of signature forgery or unauthorized replication is strictly prohibited and may carry legal consequences.
            </p>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3 text-green-600">
              <Check className="w-5 h-5" />
              <h3 className="font-black uppercase tracking-widest text-sm">Privacy Promise</h3>
            </div>
            <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
              We believe your data belongs to you. Our "VisionClean" architecture ensures that all image processing, AI matting, and extraction logic occurs exclusively on your device's local hardware. No photos, biometric data, or extracted signatures are ever uploaded to our servers or stored permanently.
            </p>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3 text-purple-600">
              <Check className="w-5 h-5" />
              <h3 className="font-black uppercase tracking-widest text-sm">Terms of Service</h3>
            </div>
            <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
              By accepting, you acknowledge that VisionMaster Pro is a tool for image enhancement and extraction. You retain full ownership and responsibility for all content processed through the application. We provide no warranty for the accuracy of AI-generated results in legal contexts.
            </p>
            <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
              You must scroll to the bottom of this agreement to enable the acceptance button. This ensures you have had the opportunity to review our ethical and privacy standards.
            </p>
            <div className="h-20" /> {/* Spacer to force scrolling */}
            <p className="text-center text-xs text-gray-400 font-bold uppercase tracking-widest">
              End of Agreement
            </p>
          </section>
        </div>

        <Button 
          onClick={onAccept} 
          disabled={!isScrolledToBottom}
          className="w-full py-6 text-xl bg-blue-600 text-slate-50 shadow-blue-500/20 disabled:grayscale transition-all duration-500"
        >
          {isScrolledToBottom ? "I Accept & Agree" : "Scroll to Read All"}
        </Button>
      </motion.div>
    </div>
  );
};

const PermissionRequest = ({ onGrant }: { onGrant: () => void }) => (
  <div className="max-w-2xl mx-auto text-center space-y-6 md:space-y-10 py-6 md:py-10">
    <div className="flex justify-center">
      <div className="w-20 h-20 md:w-24 md:h-24 neo-out rounded-[1.5rem] md:rounded-[2rem] flex items-center justify-center text-blue-600">
        <Lock className="w-10 h-10 md:w-12 md:h-12" />
      </div>
    </div>
    
    <div className="space-y-3 md:space-y-4 px-4">
      <h2 className="text-3xl md:text-4xl font-black tracking-tighter">Security & Privacy Check</h2>
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
            <h4 className="font-black text-sm uppercase tracking-widest">Zero Cloud Storage</h4>
            <p className="text-xs text-slate-500 mt-1">Photos are processed in a transient local buffer and purged immediately.</p>
          </div>
        </div>
      </Card>
      <Card variant="in" className="p-6">
        <div className="flex items-start gap-4">
          <Database className="w-6 h-6 text-green-500 shrink-0" />
          <div>
            <h4 className="font-black text-sm uppercase tracking-widest">Local AI Engine</h4>
            <p className="text-xs text-slate-500 mt-1">All matting and extraction logic runs on your device's neural processor.</p>
          </div>
        </div>
      </Card>
    </div>

    <Button onClick={onGrant} className="w-full py-6 text-xl bg-blue-600 text-slate-50 shadow-blue-500/20">
      I Understand & Grant Access
    </Button>
  </div>
);

// --- Main Views ---

const Dashboard = ({ setView }: { setView: (v: View) => void }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8">
    <Card onClick={() => setView('image')} className="flex flex-col items-center text-center gap-4 md:gap-6 p-6 md:p-8">
      <div className="w-16 h-16 md:w-20 md:h-20 neo-in rounded-2xl md:rounded-3xl flex items-center justify-center text-blue-600 dark:text-blue-400">
        <ImageIcon className="w-8 h-8 md:w-10 md:h-10" />
      </div>
      <div>
        <h3 className="text-xl md:text-2xl font-black">Image Engine</h3>
        <p className="text-slate-600 dark:text-slate-400 text-xs md:text-sm mt-1 md:mt-2 font-bold">95%+ Precision Removal</p>
      </div>
    </Card>

    <Card onClick={() => setView('signature')} className="flex flex-col items-center text-center gap-4 md:gap-6 p-6 md:p-8">
      <div className="w-16 h-16 md:w-20 md:h-20 neo-in rounded-2xl md:rounded-3xl flex items-center justify-center text-purple-600 dark:text-purple-400">
        <PenTool className="w-8 h-8 md:w-10 md:h-10" />
      </div>
      <div>
        <h3 className="text-xl md:text-2xl font-black">Signature Pro</h3>
        <p className="text-slate-600 dark:text-slate-400 text-xs md:text-sm mt-1 md:mt-2 font-bold">Ink Smoothing Algorithm</p>
      </div>
    </Card>

    <Card onClick={() => setView('passport')} className="flex flex-col items-center text-center gap-4 md:gap-6 p-6 md:p-8">
      <div className="w-16 h-16 md:w-20 md:h-20 neo-in rounded-2xl md:rounded-3xl flex items-center justify-center text-green-600 dark:text-green-400">
        <Camera className="w-8 h-8 md:w-10 md:h-10" />
      </div>
      <div>
        <h3 className="text-xl md:text-2xl font-black">Passport Studio</h3>
        <p className="text-slate-600 dark:text-slate-400 text-xs md:text-sm mt-1 md:mt-2 font-bold">AR Compliance Overlay</p>
      </div>
    </Card>

    <Card onClick={() => setView('settings')} className="flex flex-col items-center text-center gap-4 md:gap-6 p-6 md:p-8">
      <div className="w-16 h-16 md:w-20 md:h-20 neo-in rounded-2xl md:rounded-3xl flex items-center justify-center text-gray-600 dark:text-zinc-400">
        <SettingsIcon className="w-8 h-8 md:w-10 md:h-10" />
      </div>
      <div>
        <h3 className="text-xl md:text-2xl font-black">Settings</h3>
        <p className="text-slate-600 dark:text-slate-400 text-xs md:text-sm mt-1 md:mt-2 font-bold">Privacy & Themes</p>
      </div>
    </Card>
  </div>
);

const ImageModule = ({ onBack }: { onBack: () => void }) => {
  const [original, setOriginal] = useState<string | null>(null);
  const [processed, setProcessed] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sensitivity, setSensitivity] = useState(50);

  const handleUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => setOriginal(e.target?.result as string);
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
    const result = await ApiService.removeBackground(original, sensitivity);
    if (result) {
      setProcessed(result);
      triggerHaptic();
      confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 }, colors: ['#3b82f6', '#8b5cf6', '#ffffff'] });
    }
    setLoading(false);
  };

  const handleFinish = async () => {
    await ApiService.clearTransientCache();
    setOriginal(null);
    setProcessed(null);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Header title="Image Engine" onBack={onBack} />
      <PrivacyBadge />
      
      {!original ? (
        <ImageUploader onUpload={handleUpload} />
      ) : (
        <div className="space-y-8">
          <div className="neo-in rounded-[3rem] p-4 overflow-hidden relative group">
            <div className="aspect-square rounded-[2.5rem] overflow-hidden bg-zinc-100 dark:bg-zinc-800 relative">
              {processed ? (
                <div className="relative w-full h-full">
                  <img src={processed} className="w-full h-full object-contain" />
                </div>
              ) : (
                <div className="relative w-full h-full">
                  <img src={original} className="w-full h-full object-contain" />
                  {loading && <div className="absolute inset-x-0 top-0 scanning-line" />}
                </div>
              )}
              
              {loading && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center text-slate-50 gap-6">
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
                <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase tracking-tighter">
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
                <Button onClick={handleFinish} variant="ghost" className="w-full text-slate-500 font-bold">
                  Select Another Image
                </Button>
              </>
            ) : (
              <div className="flex gap-6 w-full">
                <Button onClick={handleFinish} variant="neo" className="flex-1">
                  New Image
                </Button>
                <a href={processed} download="visionmaster-pro-bg-removed.png" className="flex-1">
                  <Button className="w-full bg-blue-600 text-slate-50 hover:bg-blue-700">
                    <Download className="w-6 h-6" />
                    Save to Gallery
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

const SignatureModule = ({ onBack }: { onBack: () => void }) => {
  const [original, setOriginal] = useState<string | null>(null);
  const [processed, setProcessed] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => setOriginal(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleProcess = async () => {
    if (!original) return;
    setLoading(true);
    const result = await ApiService.extractSignature(original);
    if (result) {
      setProcessed(result);
      if ('vibrate' in navigator) navigator.vibrate(100);
    }
    setLoading(false);
  };

  const handleFinish = async () => {
    await ApiService.clearTransientCache();
    setOriginal(null);
    setProcessed(null);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Header title="Signature Pro" onBack={onBack} />
      <PrivacyBadge />
      
      {!original ? (
        <ImageUploader onUpload={handleUpload} label="Upload signature photo" />
      ) : (
        <div className="space-y-8">
          <div className="neo-in rounded-[3rem] p-8 min-h-[300px] flex items-center justify-center relative">
            {processed ? (
              <img src={processed} className="max-h-[400px] object-contain drop-shadow-2xl" />
            ) : (
              <img src={original} className="max-h-[400px] object-contain opacity-40 grayscale" />
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
                <Button onClick={handleFinish} variant="ghost" className="w-full text-slate-500 font-bold">
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
                  <Button className="w-full bg-purple-600 text-slate-50 hover:bg-purple-700">
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

const PassportStudio = ({ onBack }: { onBack: () => void }) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [original, setOriginal] = useState<string | null>(null);
  const [processed, setProcessed] = useState<string | null>(null);
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [loading, setLoading] = useState(false);
  const [size, setSize] = useState<'2x2' | '35x45'>('2x2');
  const [autoCrop, setAutoCrop] = useState(true);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [detector, setDetector] = useState<faceLandmarksDetection.FaceLandmarksDetector | null>(null);
  const [compliance, setCompliance] = useState({ centered: false, sized: false, eyesLevel: false });
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();

  useEffect(() => {
    const initDetector = async () => {
      try {
        await tf.ready();
        const model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
        const detectorConfig: any = {
          runtime: 'tfjs',
          refineLandmarks: true,
          maxFaces: 1
        };
        const newDetector = await faceLandmarksDetection.createDetector(model, detectorConfig);
        setDetector(newDetector);
      } catch (err) {
        console.error("Detector init error:", err);
      }
    };
    initDetector();
  }, []);

  const detectFace = useCallback(async () => {
    if (detector && videoRef.current && videoRef.current.readyState === 4) {
      const faces = await detector.estimateFaces(videoRef.current);
      if (faces.length > 0) {
        const face = faces[0];
        const box = face.box;
        const videoWidth = videoRef.current.videoWidth;
        const videoHeight = videoRef.current.videoHeight;

        // Compliance Logic
        const centerX = box.xMin + box.width / 2;
        const centerY = box.yMin + box.height / 2;
        
        const isCentered = Math.abs(centerX - videoWidth / 2) < videoWidth * 0.1 &&
                          Math.abs(centerY - videoHeight / 2) < videoHeight * 0.1;
        
        const faceSizeRatio = box.height / videoHeight;
        const isSized = faceSizeRatio > 0.4 && faceSizeRatio < 0.7;

        // Simple eye level check (should be roughly in the upper half)
        const isEyesLevel = centerY < videoHeight * 0.6 && centerY > videoHeight * 0.3;

        setCompliance({ centered: isCentered, sized: isSized, eyesLevel: isEyesLevel });
      } else {
        setCompliance({ centered: false, sized: false, eyesLevel: false });
      }
    }
    requestRef.current = requestAnimationFrame(detectFace);
  }, [detector]);

  useEffect(() => {
    if (isCameraActive && detector) {
      requestRef.current = requestAnimationFrame(detectFace);
    } else {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isCameraActive, detector, detectFace]);

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      setStream(s);
      if (videoRef.current) videoRef.current.srcObject = s;
      setIsCameraActive(true);
    } catch (err) {
      console.error("Camera error:", err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        setOriginal(canvasRef.current.toDataURL('image/png'));
        stopCamera();
      }
    }
  };

  const handleProcess = async () => {
    if (!original) return;
    setLoading(true);
    const result = autoCrop 
      ? await ApiService.processPassportPhoto(original, size, bgColor)
      : await ApiService.removeBackground(original);
    
    if (result) {
      setProcessed(result);
      if ('vibrate' in navigator) navigator.vibrate(200);
    }
    setLoading(false);
  };

  const handleFinish = async () => {
    await ApiService.clearTransientCache();
    setOriginal(null);
    setProcessed(null);
  };

  const handleSave = () => {
    if (!processed) return;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      // Set canvas size based on selected standard (300 DPI approx)
      if (size === '2x2') {
        canvas.width = 600;
        canvas.height = 600;
      } else {
        canvas.width = 413; // 35mm
        canvas.height = 531; // 45mm
      }

      // Fill background
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw image (centered and covered)
      const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
      const x = (canvas.width / 2) - (img.width / 2) * scale;
      const y = (canvas.height / 2) - (img.height / 2) * scale;
      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

      // Trigger download
      const link = document.createElement('a');
      link.download = `passport-photo-${size}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    };
    img.src = processed;
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  return (
    <div className="max-w-2xl mx-auto">
      <Header title="Passport Studio" onBack={() => { stopCamera(); onBack(); }} />
      <PrivacyBadge />
      
      {!original && !isCameraActive ? (
        <div className="grid grid-cols-1 gap-6">
          <Button onClick={startCamera} variant="neo" className="py-12 flex-col gap-4 text-2xl h-auto rounded-[3rem]">
            <Camera className="w-12 h-12 text-blue-500" />
            Live AR Camera
          </Button>
          <ImageUploader onUpload={(file) => {
            const reader = new FileReader();
            reader.onload = (e) => setOriginal(e.target?.result as string);
            reader.readAsDataURL(file);
          }} label="Or upload from gallery" />
        </div>
      ) : isCameraActive ? (
        <div className="space-y-8">
          <div className="relative neo-in rounded-[3rem] overflow-hidden aspect-[3/4] bg-black">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            
            {/* AR Compliance Overlay */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <svg className={cn(
                "w-full h-full transition-colors duration-500",
                compliance.centered && compliance.sized && compliance.eyesLevel ? "text-green-500" : "text-blue-500/50"
              )} viewBox="0 0 100 100">
                <path 
                  d="M50,20 Q70,20 75,45 Q80,70 50,85 Q20,70 25,45 Q30,20 50,20" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="0.5" 
                  strokeDasharray={compliance.centered && compliance.sized ? "0" : "2 2"} 
                  className="transition-all duration-500"
                />
                
                {/* Status Indicators */}
                <g className="font-black text-[2px] uppercase tracking-widest">
                  <text x="5" y="10" fill={compliance.centered ? "#22c55e" : "currentColor"}>• Centered: {compliance.centered ? "OK" : "Adjust"}</text>
                  <text x="5" y="14" fill={compliance.sized ? "#22c55e" : "currentColor"}>• Scale: {compliance.sized ? "OK" : "Distance"}</text>
                  <text x="5" y="18" fill={compliance.eyesLevel ? "#22c55e" : "currentColor"}>• Level: {compliance.eyesLevel ? "OK" : "Align"}</text>
                </g>

                <circle cx="35" cy="40" r="2" fill="currentColor" opacity={compliance.eyesLevel ? 1 : 0.3} />
                <circle cx="65" cy="40" r="2" fill="currentColor" opacity={compliance.eyesLevel ? 1 : 0.3} />
                
                <line x1="0" y1="50" x2="100" y2="50" stroke="currentColor" strokeWidth="0.1" opacity="0.2" />
                <line x1="50" y1="0" x2="50" y2="100" stroke="currentColor" strokeWidth="0.1" opacity="0.2" />
                
                <text x="50" y="95" textAnchor="middle" fill="currentColor" fontSize="3" className="font-black">
                  {compliance.centered && compliance.sized && compliance.eyesLevel 
                    ? "COMPLIANCE VERIFIED - READY" 
                    : "NEURAL COMPLIANCE ENGINE ACTIVE"}
                </text>
              </svg>
            </div>

            <div className="absolute bottom-10 inset-x-0 flex justify-center">
              <button 
                onClick={capturePhoto}
                className="w-20 h-20 rounded-full border-4 border-slate-200 flex items-center justify-center bg-slate-200/20 backdrop-blur-md active:scale-90 transition-transform"
              >
                <div className="w-14 h-14 rounded-full bg-slate-200" />
              </button>
            </div>
          </div>
          <Button variant="neo" onClick={stopCamera} className="w-full">Cancel</Button>
          <canvas ref={canvasRef} className="hidden" />
        </div>
      ) : (
        <div className="space-y-8">
          <div className="flex justify-center px-4">
            <div 
              className={cn(
                "relative overflow-hidden neo-out transition-all duration-500 rounded-2xl max-w-full",
                size === '2x2' ? "w-[300px] h-[300px]" : "w-[262px] h-[337px]"
              )}
              style={{ backgroundColor: bgColor }}
            >
              {processed ? (
                <img src={processed} className="w-full h-full object-cover" />
              ) : (
                <img src={original} className="w-full h-full object-cover opacity-60" />
              )}
              
              {/* Compliance Guides */}
              <div className="absolute inset-0 border-2 border-blue-500/20 pointer-events-none">
                <div className="absolute top-1/3 left-0 right-0 border-t border-blue-500/10" />
                <div className="absolute top-2/3 left-0 right-0 border-t border-blue-500/10" />
                <div className="absolute left-1/2 top-0 bottom-0 border-l border-blue-500/10" />
              </div>

              {loading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <RefreshCw className="w-10 h-10 animate-spin text-slate-50" />
                </div>
              )}
            </div>
          </div>

          <Card variant="in" className="space-y-8">
            <div className="space-y-4">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400">Background Color</label>
              <div className="flex gap-6">
                {['#FFFFFF', '#FF0000', '#3B82F6'].map(color => (
                  <button 
                    key={color}
                    onClick={() => setBgColor(color)}
                    className={cn(
                      "w-14 h-14 rounded-2xl neo-out transition-all",
                      bgColor === color ? "scale-110 border-2 border-blue-500" : "opacity-80"
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400">Standard Size</label>
              <div className="flex gap-4">
                <Button 
                  variant={size === '2x2' ? 'primary' : 'neo'} 
                  onClick={() => setSize('2x2')}
                  className="flex-1"
                >
                  2x2" (US)
                </Button>
                <Button 
                  variant={size === '35x45' ? 'primary' : 'neo'} 
                  onClick={() => setSize('35x45')}
                  className="flex-1"
                >
                  35x45mm (EU)
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Auto-Crop & Scale</label>
                <button 
                  onClick={() => setAutoCrop(!autoCrop)}
                  className={cn(
                    "w-12 h-6 rounded-full transition-all neo-in relative",
                    autoCrop ? "bg-blue-600/20" : "bg-gray-200"
                  )}
                >
                  <div className={cn(
                    "absolute top-0.5 w-5 h-5 rounded-full transition-all neo-out",
                    autoCrop ? "left-6 bg-blue-500" : "left-1 bg-white"
                  )} />
                </button>
              </div>
              <p className="text-[10px] text-slate-500 font-bold">Automatically detect face and align to standard dimensions.</p>
            </div>

            <div className="flex flex-col gap-4 pt-4">
              {!processed ? (
                <>
                  <Button onClick={handleProcess} disabled={loading} className="w-full py-6 bg-blue-600 text-slate-50">
                    Neural Compliance Check
                  </Button>
                  <Button onClick={handleFinish} variant="ghost" className="w-full text-slate-500 font-bold">
                    Take Another Photo
                  </Button>
                </>
              ) : (
                <div className="flex gap-6 w-full">
                  <Button onClick={handleFinish} variant="neo" className="flex-1">
                    Reset
                  </Button>
                  <Button onClick={handleSave} className="flex-1 bg-green-600 text-slate-50">
                    <Download className="w-6 h-6" />
                    Save to Gallery
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

const SettingsView = ({ onBack }: { onBack: () => void }) => {
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
              <h4 className="text-lg md:text-xl font-black">Interface Theme</h4>
              <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 font-bold">OLED Dark / Neomorphic Light</p>
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
              <h4 className="text-lg md:text-xl font-black">Privacy Promise</h4>
              <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 font-bold">VisionClean Policy Highlights</p>
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
              <h4 className="text-lg md:text-xl font-black">Reset Application</h4>
              <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 font-bold">Clear Cache & Permissions</p>
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
          <p className="text-slate-500 font-black tracking-widest uppercase text-xs">VisionMaster Pro v2.5</p>
          <p className="text-slate-400 text-xs mt-2 font-medium">© 2026 AI Vision Specialist Isaac Idol</p>
        </div>
      </div>
    </div>
  );
};

// --- Main App ---

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
      <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)] transition-colors font-sans selection:bg-blue-500 selection:text-white pb-20">
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

              {view === 'dashboard' && (
                <>
                  <div className="mb-16 text-center">
                    <motion.div 
                      initial={{ y: -20 }} 
                      animate={{ y: 0 }}
                      className="inline-block p-4 neo-in rounded-3xl mb-6"
                    >
                      <Zap className="w-10 h-10 text-blue-600" />
                    </motion.div>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4 text-slate-950 dark:text-white">
                      VisionMaster Pro
                    </h1>
                    <div className="flex justify-center">
                      <PrivacyBadge />
                    </div>
                  </div>
                  <Dashboard setView={setView} />
                </>
              )}

              {view === 'image' && <ImageModule onBack={() => setView('dashboard')} />}
              {view === 'signature' && <SignatureModule onBack={() => setView('dashboard')} />}
              {view === 'passport' && <PassportStudio onBack={() => setView('dashboard')} />}
              {view === 'settings' && <SettingsView onBack={() => setView('dashboard')} />}
            </motion.div>
          </AnimatePresence>

          {view === 'dashboard' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-20 flex justify-center"
            >
              <Button variant="neo" className="text-slate-500 gap-3 px-10" onClick={() => setView('settings')}>
                <SettingsIcon className="w-6 h-6" />
                System Preferences
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </ThemeProvider>
  );
}
