// src/ai/ResumeEngine.ts
import { UserProfile } from '../contexts/AppContext';

// Define the structure of the AI's analysis response, which will now come from your server.
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
  error?: boolean | string; // Made this flexible to handle different error shapes
  message?: string;
}

// This function now calls YOUR backend server, not Google's API directly.
export async function analyzeResume(
  userProfile: UserProfile,
  resumeText: string,
  goalJob: string,
  goalJobDescription: string
): Promise<ResumeAnalysis> {
  // Your local backend server endpoint
  const API_ENDPOINT = 'http://localhost:3001/api/opensource-analyze-resume';

  // The pre-analysis check from your original code is still a good idea.
  if (!resumeText || resumeText.trim().length < 50) {
    return {
      tailoringScore: 0,
      alignmentAnalysis: "",
      strengths: [],
      improvementAreas: [],
      actionableSuggestions: [],
      error: "Resume text is too short.",
      message: "Please provide a resume with sufficient content to analyze."
    };
  }

  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // Send all the necessary data in the request body to your server
      body: JSON.stringify({
        userProfile,
        resumeText,
        goalJob,
        goalJobDescription,
      }),
    });

    // If the server responds with an error (e.g., status 500), handle it
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Server responded with an error:', errorData);
      return {
        error: true,
        message: errorData.message || 'An unknown error occurred on the server.',
        tailoringScore: 0,
        alignmentAnalysis: '',
        strengths: [],
        improvementAreas: [],
        actionableSuggestions: [],
      };
    }

    // If the response is successful, parse the JSON from your server and return it
    const analysisResult: ResumeAnalysis = await response.json();
    return analysisResult;

  } catch (error) {
    console.error('Failed to fetch from backend:', error);
    // Return a structured error object if the fetch call itself fails (e.g., server is not running)
    return {
      error: true,
      message: 'Could not connect to the analysis server. Please ensure it is running and try again.',
      tailoringScore: 0,
      alignmentAnalysis: '',
      strengths: [],
      improvementAreas: [],
      actionableSuggestions: [],
    };
  }
}