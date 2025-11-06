// src/ai/ResumeEngine.ts
import { UserProfile } from "../contexts/AppContext";

/* ------------------------------------------------------------------ */
/* 1. Structure expected by your existing UI                          */
/* ------------------------------------------------------------------ */
export interface ResumeAnalysis {
  tailoringScore: number;
  alignmentAnalysis: string;
  strengths: DetailedMatch[];
  improvementAreas: ImprovementArea[];
  actionableSuggestions: Array<{
    category: string;
    priority: "high" | "medium" | "low";
    items: string[];
  }>;
  error?: boolean | string;
  message?: string;
}

// --- NEW HELPER INTERFACE ---
// This defines the new, detailed match object we expect from the AI
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

// ... around line 28, near DetailedMatch and ImprovementArea interfaces

// Check if the match object has data we can actually display
const isValidMatch = (match: DetailedMatch): boolean => {
  // Must have a match keyword and a reason to be considered valid
  return !!match.match && !!match.reason;
};

/* ------------------------------------------------------------------ */
/* 2. Main function: now calls your local Express backend             */
/* ------------------------------------------------------------------ */
export async function analyzeResume(
  userProfile: UserProfile,
  resumeText: string,
  goalJob: string,
  goalJobDescription: string
): Promise<ResumeAnalysis> {
  const API_ENDPOINT = "http://localhost:3001/api/analyze";

  // Pre-flight guard (same as before)
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

// ...
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
    /* 3. Map backend JSON → UI-friendly structure (NEW LOGIC)        */
    /* -------------------------------------------------------------- */
    const result = await response.json(); // { ok, data, ... }
    const data = result?.data || {};
    const validationErrors = result?.validationErrors || [];

// --- NEW DETAILED STRENGTHS LOGIC ---
const detailedMatches: DetailedMatch[] = data.strongMatches || [];

// NEW: Filter out any corrupted/empty match objects
const filteredMatches = detailedMatches.filter(isValidMatch); 

let strongMatchCount = 0;

// We count the strong matches only on the CLEANED list
filteredMatches.forEach(match => {
  if (match.quality === "Strong") strongMatchCount++;
});

// This will be our new array of objects (either clean matches or empty)
let strengths: DetailedMatch[] = filteredMatches;

// Handle the "no job description" case only if filteredMatches is zero
if (filteredMatches.length === 0 && (!goalJobDescription || goalJobDescription.trim().length === 0)) {
  // No job desc, so just list resume skills. We must map them to the DetailedMatch shape.
  strengths = (data.skills || []).slice(0, 5).map((skill: string) => ({
    match: skill,
    evidence: 'From resume skills list',
    quality: 'Good',
    reason: 'This is a general skill listed on your resume.'
  }));
} else if (filteredMatches.length === 0 && goalJobDescription && goalJobDescription.trim().length > 0) {
  // Explicitly handle: Job desc provided, but after filtering, no strong matches remain.
  // We will let 'strengths' remain as an empty array here, which triggers the 'No strong matches found' message in the UI.
}
// --- END NEW LOGIC ---
// Handle the "no job description" case
if (detailedMatches.length === 0 && (!goalJobDescription || goalJobDescription.trim().length === 0)) {
  // No job desc, so just list resume skills. We must map them to the DetailedMatch shape.
  strengths = (data.skills || []).slice(0, 5).map((skill: string) => ({
    match: skill,
    evidence: 'From resume skills list', // Add placeholder evidence
    quality: 'Good',
    reason: 'This is a general skill listed on your resume.' // Add placeholder reason
  }));
}
// --- END NEW LOGIC ---

// Map the new detailed improvement areas from the backend data
    const improvementAreas: ImprovementArea[] = data.improvementAreas || [];

    // Base the score only on 'Strong' quality matches
    const tailoringScore = Math.min(100, strongMatchCount * 25); // 25 points per "Strong" match

    return {
  tailoringScore,
  alignmentAnalysis: `Found ${strongMatchCount} 'Strong' quality matches.`,
  strengths, // This is now our new, detailed list!

  // --- FIX #1: REMOVE THE HACK ---
  // This passes the full object array to your component,
  // which is now working correctly.
  improvementAreas,

  // --- FIX #2: REMOVE THE BUGGY DATA ---
  // This stops the data from being copied.
  actionableSuggestions: [], 

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