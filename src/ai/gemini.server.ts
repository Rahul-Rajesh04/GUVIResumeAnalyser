// src/ai/gemini.server.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { UserProfile } from '../contexts/AppContext';

console.log("API Key Loaded:", import.meta.env.VITE_GEMINI_API_KEY);


// Make sure to set your GEMINI_API_KEY in your environment variables
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY!);

// src/ai/gemini.server.ts

async function run(prompt: string) {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = await response.text();

        // --- THIS IS THE FIX ---
        // Clean the response to ensure it's valid JSON
        const startIndex = text.indexOf('{');
        const endIndex = text.lastIndexOf('}');
        if (startIndex !== -1 && endIndex !== -1) {
            text = text.substring(startIndex, endIndex + 1);
        }
        // --------------------

        console.log("Cleaned AI Response:", text); // For debugging
        return JSON.parse(text);

    } catch (error) {
        console.error("Error generating or parsing content:", error);
        return {
            error: "Failed to process the AI's response.",
            message: "The AI model's response was not in the expected format. Please try again."
        };
    }
}


export async function generateRoadmapWithGemini(user: UserProfile): Promise<any> {
    const prompt = `
        Based on the following user profile, create a personalized 4-week career roadmap.
        The user's long-term goal is: "${user.goals.longTermGoal}".
        The user's skills are: ${user.skills.map(s => s.name).join(', ')}.
        The user's interests are: ${user.goals.interests.join(', ')}.

        Please generate a JSON object with the following structure:
        {
          "title": "Your AI Roadmap to Becoming a [User's Long-Term Goal]",
          "focus": "A 4-week plan focusing on key skills.",
          "weeks": [
            {
              "week": 1,
              "title": "Week 1: [Skill/Topic]",
              "focus": "Description of the week's focus.",
              "tasks": [
                {"id": "task-1-1", "title": "Task 1", "description": "Description of the task.", "completed": false},
                {"id": "task-1-2", "title": "Task 2", "description": "Description of the task.", "completed": false}
              ]
            },
            ... (3 more weeks)
          ]
        }
    `;

    return run(prompt);
}

// src/ai/gemini.server.ts
// ... (keep the rest of the file the same)

// Note: The function signature now accepts the user's profile and goal job info.
export async function analyzeResumeWithGemini(
  userProfile: UserProfile,
  resumeText: string,
  goalJob: string,
  goalJobDescription: string
): Promise<any> {
    const prompt = `
        You are an expert career coach reviewing a client's resume. Your primary goal is to determine how well their resume is tailored for a specific job they are targeting and align it with their personal career aspirations.

        **Client's Profile Information:**
        - Long-Term Goal: ${userProfile.goals.longTermGoal}
        - Key Skills: ${userProfile.skills.map(s => s.name).join(', ')}
        - Interests: ${userProfile.goals.interests.join(', ')}

        **Target Job Information:**
        - Job Title: "${goalJob}"
        - Job Description: "${goalJobDescription}"

        **Client's Resume Text:**
        "${resumeText}"

        **Your Task:**
        1.  First, determine if the provided text is a professional resume. If not, return an error.
        2.  Analyze the resume and compare it against the target job description and the client's profile.
        3.  Provide a "Tailoring Score" from 0-100, indicating how well the resume is customized for the target job.
        4.  Offer clear, actionable suggestions for improvement.

        **JSON Output Structure:**
        If the text is not a resume, return:
        {
          "error": "Not a Resume",
          "message": "The uploaded text does not appear to be a resume. Please upload a proper document for analysis."
        }

        If it IS a resume, return:
        {
          "tailoringScore": 0, // A score from 0-100 based on alignment with the job description. 85+ is excellent.
          "alignmentAnalysis": "Provide a 2-3 sentence analysis of how well the resume aligns with the target job and the user's long-term goals.",
          "strengths": ["List specific elements from the resume that are strong matches for the job description."],
          "improvementAreas": ["Identify key gaps or weaknesses in the resume when compared to the job requirements."],
          "actionableSuggestions": [
            {
              "category": "Keyword Optimization",
              "priority": "high",
              "items": ["Suggest specific keywords from the job description that should be included in the resume."]
            },
            {
              "category": "Experience Framing",
              "priority": "high",
              "items": ["Advise on how to rephrase bullet points from their experience to better match the responsibilities listed in the job description."]
            },
            {
              "category": "Skills Gap",
              "priority": "medium",
              "items": ["Based on the user's profile skills and the job's needs, suggest which skills to highlight, add, or elaborate on."]
            }
          ]
        }
    `;

    return run(prompt);
}

// ... (keep the other functions like `run` the same)

export async function getInterviewResponseWithGemini(question: string, previousMessages: any[]): Promise<any> {
    const prompt = `
        You are an AI interviewer. Your current question is "${question}".
        The conversation history is: ${JSON.stringify(previousMessages)}.

        Please generate a concise and relevant follow-up or the next question based on the conversation. Return a JSON object with the following structure:
        {
          "response": "Your response here."
        }
    `;
    return run(prompt);
}