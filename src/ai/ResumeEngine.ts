// src/ai/ResumeEngine.ts
import { analyzeResumeWithGemini } from './gemini.server';

// Define a type for the analysis structure for better type safety
export interface ResumeAnalysis {
  score: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: Array<{
    category: string;
    priority: 'high' | 'medium' | 'low';
    items: string[];
  }>;
  error?: string;
  message?: string;
}

export async function analyzeResume(resumeText: string): Promise<ResumeAnalysis> {
  if (!resumeText || resumeText.trim().length < 50) {
    return {
      score: 0,
      strengths: [],
      weaknesses: [],
      suggestions: [],
      error: "Resume text is too short.",
      message: "Please provide a resume with sufficient content to analyze."
    };
  }

  // Call the Gemini function from your server file
  const result = await analyzeResumeWithGemini(resumeText);
  
  // A quick check to make sure the AI response is in the right format
  if (result.error || !result.score) {
     // If the AI gives an error, we pass it along
     return result;
  }
  
  return result;
}