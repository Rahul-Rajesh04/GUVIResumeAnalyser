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
    const result = await response.json(); // { ok, data, evidence?, validationErrors? }
    const data = result?.data || {};
    const validationErrors = result?.validationErrors || [];

    const skills = Array.isArray(data.skills) ? data.skills : [];
    const strengths = skills.slice(0, 5);
    const improvementAreas = validationErrors.length
      ? ["Some required fields are missing (e.g., contact.email)."]
      : [];

    const tailoringScore = Math.min(100, strengths.length * 20);

    return {
      tailoringScore,
      alignmentAnalysis: `Found ${strengths.length} key skills in the resume.`,
      strengths,
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
