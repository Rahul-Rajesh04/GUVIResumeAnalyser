// src/ai/ResumeEngine.ts
import { UserProfile } from "../contexts/AppContext";

/* ------------------------------------------------------------------ */
/* 1. STRUCTURE DEFINITIONS (Interfaces)                              */
/* ------------------------------------------------------------------ */

interface DetailedMatch {
  match: string;
  evidence: string;
  quality: "Strong" | "Good" | "Weak";
  reason: string;
}

interface ImprovementArea {
  area: string;
  suggestion: string;
  importance: "High" | "Medium" | "Low";
}

interface ActionableSuggestion {
  priority: "High" | "Medium" | "Low";
  heading: string;
  items: string[];
}

export interface ResumeAnalysis {
  tailoringScore: number;
  alignmentAnalysis: string;
  strengths: DetailedMatch[];
  improvementAreas: ImprovementArea[];
  actionableSuggestions: ActionableSuggestion[]; // FINAL STRUCTURE
  error?: boolean | string;
  message?: string;
}

// Check if the match object has enough content to be displayed.
const isValidMatch = (match: DetailedMatch): boolean => {
  return !!match.match && !!match.reason;
};

/* ------------------------------------------------------------------ */
/* 2. MAIN ANALYSIS FUNCTION                                          */
/* ------------------------------------------------------------------ */
export async function analyzeResume(
  userProfile: UserProfile,
  resumeText: string,
  goalJob: string,
  goalJobDescription: string
): Promise<ResumeAnalysis> {
  const API_ENDPOINT = "http://localhost:3001/api/analyze";

  // Pre-flight guard
  if (!resumeText || resumeText.trim().length < 50) {
    return {
      tailoringScore: 0,
      alignmentAnalysis: "",
      strengths: [],
      improvementAreas: [],
      actionableSuggestions: [],
      error: "Resume text is too short.",
      message: "Please provide a resume with sufficient content to analyze.",
    };
  }

  try {
    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        resumeText,
        jobTitle: goalJob || "",
        jobText: goalJobDescription || "",
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Server responded with an error:", errorData);
      return {
        tailoringScore: 0,
        alignmentAnalysis: "",
        strengths: [],
        improvementAreas: [],
        actionableSuggestions: [],
        error: true,
        message:
          errorData.message ||
          "An unknown error occurred on the server. Please check the API logs.",
      };
    }

    /* -------------------------------------------------------------- */
    /* 3. Map backend JSON → UI-friendly structure                    */
    /* -------------------------------------------------------------- */
    const result = await response.json(); // { ok, data, validationErrors, ... }
    const validationErrors = result?.validationErrors || [];
    
    // CRITICAL: Check for internal server validation failure (AI failed schema)
    if (!result.ok) {
        console.error("Backend validation error:", result.validationErrors);
        const errorMsg = validationErrors?.map(
            (err: any) => `${err.instancePath || 'Root'} ${err.message}`
        ).join(', ');
        
        return {
            tailoringScore: 0,
            alignmentAnalysis: "",
            strengths: [],
            improvementAreas: [],
            actionableSuggestions: [],
            error: true,
            message: `The AI failed to return a valid analysis. Please try again. (Details: ${errorMsg || 'Unknown validation error'})`,
        };
    }
    
    const data = result?.data || {};

    // --- DETAILED STRENGTHS LOGIC (FILTER FIX) ---
    const detailedMatches: DetailedMatch[] = data.strongMatches || [];
    const filteredMatches = detailedMatches.filter(isValidMatch); 
    
    let strongMatchCount = 0;
    filteredMatches.forEach(match => {
      if (match.quality === "Strong") strongMatchCount++;
    });

    let strengths: DetailedMatch[] = filteredMatches;

    // Handle the "no job description" case only if filteredMatches is zero
    if (filteredMatches.length === 0 && (!goalJobDescription || goalJobDescription.trim().length === 0)) {
        strengths = (data.skills || []).slice(0, 5).map((skill: string) => ({
            match: skill,
            evidence: 'From resume skills list',
            quality: 'Good',
            reason: 'This is a general skill listed on your resume.'
        }));
    }
    // --- END NEW LOGIC ---

    // Map other fields
    const improvementAreas: ImprovementArea[] = data.improvementAreas || [];
    const actionableSuggestions: ActionableSuggestion[] = data.actionableSuggestions || [];

    // Base the score only on 'Strong' quality matches
    const tailoringScore = Math.min(100, strongMatchCount * 25); // 25 points per "Strong" match

    return {
      tailoringScore,
      alignmentAnalysis: `Found ${strongMatchCount} 'Strong' quality matches.`,
      strengths, 
      improvementAreas,
      actionableSuggestions, // Correctly mapped final structure
      error: false,
      message: validationErrors.length
        ? "Validation issues detected — resume data incomplete."
        : "Resume analysis completed successfully.",
    };
  } catch (error) {
    console.error("Failed to fetch from backend:", error);
    return {
      tailoringScore: 0,
      alignmentAnalysis: "",
      strengths: [],
      improvementAreas: [],
      actionableSuggestions: [],
      error: true,
      message:
        "Could not connect to the analysis server. Please ensure it is running and try again.",
    };
  }
}