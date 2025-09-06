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

export async function analyzeResumeWithGemini(resumeText: string): Promise<any> {
    const prompt = `
        Your first task is to determine if the following text is a professional resume. A resume typically includes sections like "Experience", "Education", "Skills", and contact information.

        If the text does NOT appear to be a resume, return ONLY the following JSON object:
        {
          "error": "Not a Resume",
          "message": "The uploaded text does not appear to be a resume. Please upload a proper resume for analysis."
        }

        If the text IS a resume, please analyze it from the perspective of a helpful and constructive career coach.

        Resume Text: "${resumeText}"

        If it is a resume, generate a JSON object with the following structure. Calculate the score based on the rubric provided.
        {
          "score": 0, // Calculate a score from 0-100 based on the resume's overall quality. A score below 60 indicates significant issues. A score between 70-85 is good and should be earned. A score of 90+ is exceptional and rare, reserved for resumes with clear, quantifiable achievements, strong action verbs, and perfect formatting. The score should directly reflect the strengths and weaknesses you identify.
          "strengths": ["Identify key strengths such as clear impact statements, good formatting, and relevant skills."],
          "weaknesses": ["Point out areas for improvement in a constructive manner. Focus on things like weak action verbs or lack of metrics."],
          "suggestions": [
            {
              "category": "Impact and Metrics",
              "priority": "high",
              "items": ["Provide actionable suggestions to help the user quantify their achievements and show more impact."]
            },
            {
              "category": "Clarity and Readability",
              "priority": "medium",
              "items": ["Suggest improvements for clarity, conciseness, and professional formatting."]
            }
          ]
        }
    `;

    return run(prompt);
}

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