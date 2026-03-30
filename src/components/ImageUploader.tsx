import React from 'react';
import { Upload } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { cn } from '../lib/utils';

interface ImageUploaderProps {
  onUpload: (file: File) => void;
  label?: string;
}

export const ImageUploader = ({ onUpload, label = "Drop image here or click to upload" }: ImageUploaderProps) => {
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
