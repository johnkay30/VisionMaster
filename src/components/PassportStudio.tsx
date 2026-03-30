import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'motion/react';
import { Camera, RefreshCw, Download, Zap } from 'lucide-react';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import '@tensorflow/tfjs-backend-webgl';
import * as tf from '@tensorflow/tfjs-core';
import confetti from 'canvas-confetti';
import { Header } from './Header';
import { ProcessingOverlay } from './ProcessingOverlay';
import { PrivacyBadge } from './PrivacyBadge';
import { ImageUploader } from './ImageUploader';
import { Button } from './Button';
import { Card } from './Card';
import { ApiService } from '../services/apiService';
import { cn } from '../lib/utils';

interface PassportStudioProps {
  onBack: () => void;
}

export const PassportStudio = ({ onBack }: PassportStudioProps) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [original, setOriginal] = useState<string | null>(null);
  const [processed, setProcessed] = useState<string | null>(null);
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
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
        await tf.setBackend('webgl');
        await tf.ready();
        const model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
        const detectorConfig: any = {
          runtime: 'tfjs',
          refineLandmarks: false,
          maxFaces: 1
        };
        const newDetector = await faceLandmarksDetection.createDetector(model, detectorConfig);
        setDetector(newDetector);
      } catch (err) {
        console.error("Detector init error:", err);
      }
    };
    initDetector();
    return () => {
      if (detector) {
        detector.dispose();
      }
    };
  }, []);

  const detectFace = useCallback(async () => {
    if (!isCameraActive) return;
    
    if (detector && videoRef.current && videoRef.current.readyState === 4) {
      try {
        const faces = await detector.estimateFaces(videoRef.current);
        if (faces.length > 0) {
          const face = faces[0];
          const box = face.box;
          const videoWidth = videoRef.current.videoWidth;
          const videoHeight = videoRef.current.videoHeight;

          const centerX = box.xMin + box.width / 2;
          const centerY = box.yMin + box.height / 2;
          
          const isCentered = Math.abs(centerX - videoWidth / 2) < videoWidth * 0.15 &&
                            Math.abs(centerY - videoHeight / 2) < videoHeight * 0.15;
          
          const faceSizeRatio = box.height / videoHeight;
          const isSized = faceSizeRatio > 0.35 && faceSizeRatio < 0.75;

          const isEyesLevel = centerY < videoHeight * 0.65 && centerY > videoHeight * 0.25;

          setCompliance({ centered: isCentered, sized: isSized, eyesLevel: isEyesLevel });
        } else {
          setCompliance({ centered: false, sized: false, eyesLevel: false });
        }
      } catch (err) {
        console.error("Detection error:", err);
      }
    }
    
    requestRef.current = window.setTimeout(() => {
      detectFace();
    }, 200) as unknown as number;
  }, [detector, isCameraActive]);

  useEffect(() => {
    if (isCameraActive && detector) {
      detectFace();
    } else {
      if (requestRef.current) clearTimeout(requestRef.current);
    }
    return () => {
      if (requestRef.current) clearTimeout(requestRef.current);
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
    setProgress(0);
    const result = autoCrop 
      ? await ApiService.processPassportPhoto(original, size, bgColor, (p) => setProgress(p))
      : await ApiService.removeBackground(original, (p) => setProgress(p));
    
    if (result) {
      setProcessed(result);
      if ('vibrate' in navigator) navigator.vibrate(200);
    }
    setLoading(false);
    setProgress(0);
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
      if (size === '2x2') {
        canvas.width = 600;
        canvas.height = 600;
      } else {
        canvas.width = 413;
        canvas.height = 531;
      }

      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
      const x = (canvas.width / 2) - (img.width / 2) * scale;
      const y = (canvas.height / 2) - (img.height / 2) * scale;
      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

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
      <AnimatePresence>
        {loading && <ProcessingOverlay message="Generating Passport Photo..." progress={progress} />}
      </AnimatePresence>
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
                <img src={processed} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <img src={original} className="w-full h-full object-cover opacity-60" referrerPolicy="no-referrer" />
              )}
              
              <div className="absolute inset-0 border-2 border-blue-500/20 pointer-events-none">
                <div className="absolute top-1/3 left-0 right-0 border-t border-blue-500/10" />
                <div className="absolute top-2/3 left-0 right-0 border-t border-blue-500/10" />
                <div className="absolute left-1/2 top-0 bottom-0 border-l border-blue-500/10" />
              </div>

              {loading && (
                <div className="absolute inset-0 bg-white/60 dark:bg-black/50 flex items-center justify-center">
                  <RefreshCw className="w-10 h-10 animate-spin text-blue-600 dark:text-slate-50" />
                </div>
              )}
            </div>
          </div>

          <Card variant="in" className="space-y-8">
            <div className="space-y-4">
              <label className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Background Color</label>
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
              <p className="text-[10px] text-slate-600 dark:text-slate-400 font-bold">Automatically detect face and align to standard dimensions.</p>
            </div>

            <div className="flex flex-col gap-4 pt-4">
              {!processed ? (
                <>
                  <Button onClick={handleProcess} disabled={loading} className="w-full py-6 bg-blue-600 text-slate-900 dark:text-slate-50">
                    Neural Compliance Check
                  </Button>
                  <Button onClick={handleFinish} variant="ghost" className="w-full text-slate-600 dark:text-slate-400 font-bold">
                    Take Another Photo
                  </Button>
                </>
              ) : (
                <div className="flex gap-6 w-full">
                  <Button onClick={handleFinish} variant="neo" className="flex-1">
                    Reset
                  </Button>
                  <Button onClick={handleSave} className="flex-1 bg-green-600 text-slate-900 dark:text-slate-50">
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
