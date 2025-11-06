// src/ai/ResumeEngine.ts
import { UserProfile } from "../contexts/AppContext";

/* ------------------------------------------------------------------ */
/* 1. Structure expected by your existing UI                          */
/* ------------------------------------------------------------------ */
export interface ResumeAnalysis {
  tailoringScore: number;
  alignmentAnalysis: string;
  strengths: string[];
  improvementAreas: string[];
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
    let strengths: string[] = [];
    const detailedMatches: DetailedMatch[] = data.strongMatches || [];
    let strongMatchCount = 0;
    
    if (detailedMatches.length > 0) {
      // We have real, detailed matches from the AI!
      strengths = detailedMatches.map(
        (match: DetailedMatch) => {
          if (match.quality === "Strong") strongMatchCount++;
          // Format the detailed analysis for the UI:
          // [Quality] Match: Reason
          return `[${match.quality}] ${match.match}: ${match.reason}`;
        }
      );
    } else if (!goalJobDescription || goalJobDescription.trim().length === 0) {
      // No job description was provided, so just list resume skills
      strengths = (data.skills || []).slice(0, 5).map(skill => `[Good] ${skill} (from resume)`);
    } else {
      // A job was provided, but no matches were found
      strengths = ["No strong matches found between your resume and this job."];
    }
    // --- END NEW LOGIC ---

    const improvementAreas = validationErrors.length
      ? ["Some required fields are missing (e.g., contact.email)."]
      : [];

    // Base the score only on 'Strong' quality matches
    const tailoringScore = Math.min(100, strongMatchCount * 25); // 25 points per "Strong" match

    return {
      tailoringScore,
      alignmentAnalysis: `Found ${strongMatchCount} 'Strong' quality matches.`,
      strengths, // This is now our new, detailed list!
      improvementAreas,
      actionableSuggestions: [
        { category: "skills", priority: "medium", items: improvementAreas },
      ],
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