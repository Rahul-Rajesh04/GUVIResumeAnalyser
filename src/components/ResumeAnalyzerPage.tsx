// src/components/ResumeAnalyzerPage.tsx
import React, { useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import * as pdfjsLib from 'pdfjs-dist';
import { ArrowLeft, FileText, UploadCloud, X, Zap, ThumbsUp, ThumbsDown, Lightbulb } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useApp } from '../contexts/AppContext';
import { analyzeResume, ResumeAnalysis } from '../ai/ResumeEngine';
import { Progress } from './ui/progress';

// Configure the PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.mjs`;

export function ResumeAnalyzerPage() {
  const { navigateToPage } = useApp();
  const [resumeFile, setResumeFile] = React.useState<File | null>(null);
  const [resumeText, setResumeText] = React.useState<string>('');
  const [isProcessingFile, setIsProcessingFile] = React.useState(false);
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [analysisResult, setAnalysisResult] = React.useState<ResumeAnalysis | null>(null);

  const onDrop = React.useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setResumeFile(file);
    setIsProcessingFile(true);
    setResumeText(''); // Clear previous text

    const reader = new FileReader();

    if (file.type === 'application/pdf') {
      reader.onload = async (event) => {
        const arrayBuffer = event.target?.result as ArrayBuffer;
        try {
          const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
          let fullText = '';
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            fullText += textContent.items.map(item => ('str' in item ? item.str : '')).join(' ');
            fullText += '\n'; // Add a newline between pages
          }
          setResumeText(fullText);
        } catch (error) {
          console.error("Error parsing PDF:", error);
          setResumeText("Error: Could not read text from PDF file.");
        } finally {
          setIsProcessingFile(false);
        }
      };
      reader.readAsArrayBuffer(file);
    } else if (file.type === 'text/plain') {
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setResumeText(text);
        setIsProcessingFile(false);
      };
      reader.readAsText(file);
    } else {
        setResumeText(`File type "${file.type}" is not supported. Please use .txt or .pdf.`);
        setIsProcessingFile(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
  });

  const handleAnalyze = async () => {
    if (!resumeText) return;
    setIsAnalyzing(true);
    setAnalysisResult(null);
    const result = await analyzeResume(resumeText);
    setAnalysisResult(result);
    setIsAnalyzing(false);
  };

  const clearFile = () => {
    setResumeFile(null);
    setResumeText('');
    setAnalysisResult(null);
    setIsProcessingFile(false);
  };
  
  const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  }

  return (
    <div className="p-4 md:p-6">
      <Button onClick={() => navigateToPage('dashboard')} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><Zap className="mr-2" /> AI Resume Analyzer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {!resumeFile ? (
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
          ) : (
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
          )}

          {isProcessingFile && <p className="text-center text-muted-foreground">Processing file...</p>}
          
          {resumeFile && !isProcessingFile && !isAnalyzing && !analysisResult &&(
            <div className="text-center">
              <Button onClick={handleAnalyze} disabled={!resumeText || resumeText.startsWith('Error:')}>
                Analyze My Resume
              </Button>
            </div>
          )}

          {isAnalyzing && (
            <div className="flex flex-col items-center justify-center text-center p-4">
              <Zap className="h-10 w-10 mb-4 animate-pulse text-primary" />
              <h3 className="text-xl font-semibold mb-2">Analyzing...</h3>
              <p className="text-muted-foreground">Our AI is reviewing your resume. This may take a moment.</p>
              <Progress value={50} className="w-full max-w-sm mt-4" />
            </div>
          )}

          {analysisResult && (
             <div className="space-y-4">
                {analysisResult.error ? (
                    <div className="p-4 text-center text-red-600 bg-red-100 rounded-lg">
                        <h3 className="font-bold">Analysis Failed</h3>
                        <p>{analysisResult.message}</p>
                    </div>
                ) : (
                    <>
                        <Card>
                            <CardHeader>
                                <CardTitle>Overall Score: {analysisResult.score}/100</CardTitle>
                            </CardHeader>
                        </Card>
                        <div className="grid md:grid-cols-2 gap-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center text-green-600"><ThumbsUp className="mr-2"/> Strengths</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="list-disc pl-5 space-y-1">
                                        {analysisResult.strengths.map((s, i) => <li key={i}>{s}</li>)}
                                    </ul>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center text-red-600"><ThumbsDown className="mr-2"/> Weaknesses</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="list-disc pl-5 space-y-1">
                                        {analysisResult.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
                                    </ul>
                                </CardContent>
                            </Card>
                        </div>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center text-blue-600"><Lightbulb className="mr-2"/> Suggestions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {analysisResult.suggestions.map((s, i) => (
                                    <div key={i}>
                                        <h4 className={`font-semibold ${getPriorityColor(s.priority)}`}>
                                            {s.category} (Priority: {s.priority})
                                        </h4>
                                        <ul className="list-disc pl-5 text-sm">
                                            {s.items.map((item, j) => <li key={j}>{item}</li>)}
                                        </ul>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                        <div className="text-center">
                            <Button onClick={clearFile}>Analyze Another Resume</Button>
                        </div>
                    </>
                )}
             </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}