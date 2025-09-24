// src/components/analyzer/ResumeUploadForm.tsx
import { useDropzone } from 'react-dropzone';
import { FileText, UploadCloud, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  resumeFile: File | null;
  isProcessingFile: boolean;
  isDragActive: boolean;
  getRootProps: ReturnType<typeof useDropzone>['getRootProps'];
  getInputProps: ReturnType<typeof useDropzone>['getInputProps'];
  clearFile: () => void;
}

export function ResumeUploadForm({
  resumeFile,
  isProcessingFile,
  isDragActive,
  getRootProps,
  getInputProps,
  clearFile,
}: Props) {
  if (isProcessingFile) {
    return <p className="text-center text-muted-foreground animate-pulse">Processing file...</p>;
  }

  if (resumeFile) {
    return (
      <div className="p-4 border rounded-lg bg-secondary/50 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <FileText className="w-8 h-8 text-primary" />
          <div>
            <p className="font-semibold">{resumeFile.name}</p>
            <p className="text-sm text-muted-foreground">
              {(resumeFile.size / 1024).toFixed(2)} KB
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={clearFile}>
          <X className="w-5 h-5" />
        </Button>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={`flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg cursor-pointer transition-colors
        ${isDragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}
    >
      <input {...getInputProps()} />
      <UploadCloud className="w-12 h-12 text-muted-foreground mb-4" />
      <p className="text-lg font-semibold">
        {isDragActive ? 'Drop the file here...' : 'Drag & drop your resume (.txt, .pdf)'}
      </p>
      <p className="text-muted-foreground">or click to select a file</p>
    </div>
  );
}