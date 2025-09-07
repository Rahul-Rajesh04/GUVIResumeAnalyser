// src/ai/ResumeEngine.ts
import { analyzeResumeWithGemini } from './gemini.server';
import { UserProfile } from '../contexts/AppContext'; // Import UserProfile

// Define a new, more detailed type for the analysis
export interface ResumeAnalysis {
  tailoringScore: number;
  alignmentAnalysis: string;
  strengths: string[];
  improvementAreas: string[];
  actionableSuggestions: Array<{
    category: string;
    priority: 'high' | 'medium' | 'low';
    items: string[];
  }>;
  error?: string;
  message?: string;
}

// The function now accepts the user's profile and job details
export async function analyzeResume(
  userProfile: UserProfile,
  resumeText: string,
  goalJob: string,
  goalJobDescription: string
): Promise<ResumeAnalysis> {
  if (!resumeText || resumeText.trim().length < 50) {
    return {
      // Return a default error structure that matches the new type
      tailoringScore: 0,
      alignmentAnalysis: "",
      strengths: [],
      improvementAreas: [],
      actionableSuggestions: [],
      error: "Resume text is too short.",
      message: "Please provide a resume with sufficient content to analyze."
    };
  }

  // Pass all the necessary data to the Gemini function
  const result = await analyzeResumeWithGemini(userProfile, resumeText, goalJob, goalJobDescription);
  
  if (result.error || !result.tailoringScore) {
     return result;
  }
  
  return result;
}