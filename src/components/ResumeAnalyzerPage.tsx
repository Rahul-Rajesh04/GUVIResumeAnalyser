// src/components/ResumeAnalyzerPage.tsx
import React, { useReducer } from 'react';
import { useDropzone } from 'react-dropzone';
import * as pdfjsLib from 'pdfjs-dist';
import { ArrowLeft, Target } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useApp } from '../contexts/AppContext';
import { analyzeResume, ResumeAnalysis } from '../ai/ResumeEngine';

// Import our new components
import { ResumeUploadForm } from './analyzer/ResumeUploadForm';
import { JobDetailsForm } from './analyzer/JobDetailsForm';
import { AnalysisResultDisplay } from './analyzer/AnalysisResultDisplay';

pdfjsLib.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.mjs`;

// --- State Management with useReducer ---

// 1. Define the shape of our state
interface AnalyzerState {
  resumeFile: File | null;
  resumeText: string;
  goalJob: string;
  goalJobDescription: string;
  status: 'idle' | 'processingFile' | 'analyzing' | 'success' | 'error';
  analysisResult: ResumeAnalysis | null;
}

// 2. Define the initial state
const initialState: AnalyzerState = {
  resumeFile: null,
  resumeText: '',
  goalJob: '',
  goalJobDescription: '',
  status: 'idle',
  analysisResult: null,
};

// 3. Define the actions that can change the state
type Action =
  | { type: 'SET_FILE'; payload: File }
  | { type: 'SET_RESUME_TEXT'; payload: string }
  | { type: 'SET_GOAL_JOB'; payload: string }
  | { type: 'SET_GOAL_JOB_DESCRIPTION'; payload: string }
  | { type: 'START_ANALYSIS' }
  | { type: 'SET_ANALYSIS_RESULT'; payload: ResumeAnalysis }
  | { type: 'RESET' };

// 4. Create the reducer function to handle actions
function analyzerReducer(state: AnalyzerState, action: Action): AnalyzerState {
  switch (action.type) {
    case 'SET_FILE':
      return { ...initialState, resumeFile: action.payload, status: 'processingFile' };
    case 'SET_RESUME_TEXT':
      return { ...state, resumeText: action.payload, status: 'idle' };
    case 'SET_GOAL_JOB':
      return { ...state, goalJob: action.payload };
    case 'SET_GOAL_JOB_DESCRIPTION':
      return { ...state, goalJobDescription: action.payload };
    case 'START_ANALYSIS':
      return { ...state, status: 'analyzing', analysisResult: null };
    case 'SET_ANALYSIS_RESULT':
      return { ...state, analysisResult: action.payload, status: action.payload.error ? 'error' : 'success' };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

export function ResumeAnalyzerPage() {
  const { state: appState, navigateToPage } = useApp();
  const { currentUser } = appState;
  
  // Use the reducer for state management
  const [state, dispatch] = useReducer(analyzerReducer, initialState);
  const { resumeFile, goalJob, goalJobDescription, status, analysisResult } = state;

  const onDrop = React.useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    dispatch({ type: 'SET_FILE', payload: file });

    const reader = new FileReader();
    let textContent = '';

    if (file.type === 'application/pdf') {
        reader.onload = async (event) => {
            const arrayBuffer = event.target?.result as ArrayBuffer;
            try {
                const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const content = await page.getTextContent();
                    textContent += content.items.map(item => (item as any).str).join(' ');
                }
            } catch (error) {
                console.error("Error parsing PDF:", error);
                textContent = "Error: Could not read text from PDF file.";
            } finally {
                dispatch({ type: 'SET_RESUME_TEXT', payload: textContent });
            }
        };
        reader.readAsArrayBuffer(file);
    } else { // Handles .txt and other file types
        reader.onload = (event) => {
            textContent = event.target?.result as string;
            dispatch({ type: 'SET_RESUME_TEXT', payload: textContent });
        };
        reader.readAsText(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/plain': ['.txt'], 'application/pdf': ['.pdf'] },
    maxFiles: 1,
  });

  const handleAnalyze = async () => {
    // Ensure all required fields and user data are present
    if (!state.resumeText || !currentUser || !goalJob || !goalJobDescription) return;
    
    // Extract the user's name from the AppContext for backend validation
    const userName = currentUser.personalDetails.fullName; // <-- NEW LINE

    dispatch({ type: 'START_ANALYSIS' });
    
    // Pass the new userName argument to the analysis engine
    const result = await analyzeResume(
      currentUser, 
      state.resumeText, 
      goalJob, 
      goalJobDescription,
      userName // <-- NEW ARGUMENT PASSED
    );
    
    dispatch({ type: 'SET_ANALYSIS_RESULT', payload: result });
  };

  const clearFile = () => dispatch({ type: 'RESET' });
  
  if (!currentUser) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold">Loading User Data...</h2>
        <Button onClick={() => navigateToPage('dashboard')} className="mt-4">Back to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <Button onClick={() => navigateToPage('dashboard')} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><Target className="mr-2" /> AI Resume Tailoring</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <ResumeUploadForm
            resumeFile={resumeFile}
            isProcessingFile={status === 'processingFile'}
            isDragActive={isDragActive}
            getRootProps={getRootProps}
            getInputProps={getInputProps}
            clearFile={clearFile}
          />

          {resumeFile && !analysisResult && (
            <JobDetailsForm
              goalJob={goalJob}
              goalJobDescription={goalJobDescription}
              isAnalyzing={status === 'analyzing'}
              isProcessingFile={status === 'processingFile'}
              setGoalJob={(value) => dispatch({ type: 'SET_GOAL_JOB', payload: value })}
              setGoalJobDescription={(value) => dispatch({ type: 'SET_GOAL_JOB_DESCRIPTION', payload: value })}
              handleAnalyze={handleAnalyze}
            />
          )}

          <AnalysisResultDisplay
            isAnalyzing={status === 'analyzing'}
            analysisResult={analysisResult}
            clearFile={clearFile}
          />
        </CardContent>
      </Card>
    </div>
  );
}