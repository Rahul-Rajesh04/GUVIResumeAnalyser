// Import necessary packages
const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
const cors = require('cors');
const axios = require('axios');

// Load environment variables from .env file
dotenv.config();

// Initialize Express app
const app = express();
const port = 3001;

// --- Middleware ---
app.use(cors());
// --- THIS IS A CRITICAL FIX ---
// Increase the limit for JSON payloads to handle large resumes
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
// --- END OF FIX ---

// --- Gemini AI Setup ---
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// --- API Endpoints ---
app.post('/api/analyze-resume', async (req, res) => {
    try {
        const { userProfile, resumeText, goalJob, goalJobDescription } = req.body;
        const prompt = `
            You are an expert career coach...
            Client's Profile Information:
            - Long-Term Goal: ${userProfile.goals.longTermGoal}
            - Key Skills: ${userProfile.skills.map(s => s.name).join(', ')}
            - Interests: ${userProfile.goals.interests.join(', ')}
            Target Job Information:
            - Job Title: "${goalJob}"
            - Job Description: "${goalJobDescription}"
            Client's Resume Text:
            "${resumeText}"
            Your Task: ...
            JSON Output Structure: ...
        `;
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = await response.text();
        const startIndex = text.indexOf('{');
        const endIndex = text.lastIndexOf('}');
        if (startIndex !== -1 && endIndex !== -1) {
            text = text.substring(startIndex, endIndex + 1);
        }
        res.json(JSON.parse(text));
    } catch (error) {
        console.error("Error in /api/analyze-resume:", error);
        res.status(500).json({ error: true, message: "An error occurred on the server." });
    }
});

app.post('/api/generate-roadmap', async (req, res) => {
    try {
        const { userProfile } = req.body;
        if (!userProfile) {
            return res.status(400).json({ error: true, message: 'User profile is required.' });
        }
        const prompt = `
            Based on the following user profile, create a personalized 4-week career roadmap...
        `;
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = await response.text();
        const startIndex = text.indexOf('{');
        const endIndex = text.lastIndexOf('}');
        if (startIndex !== -1 && endIndex !== -1) {
            text = text.substring(startIndex, endIndex + 1);
        }
        res.json(JSON.parse(text));
    } catch (error) {
        console.error("Error in /api/generate-roadmap:", error);
        res.status(500).json({ error: true, message: "An error occurred on the server." });
    }
});

// --- OLLAMA ENDPOINT WITH DETAILED LOGGING ---
app.post('/api/opensource-analyze-resume', async (req, res) => {
    console.log("--- [1] Received request for open-source analysis ---");
    try {
      const { userProfile, resumeText, goalJob, goalJobDescription } = req.body;
      const ollamaApiUrl = 'http://127.0.0.1:11434/api/generate';

      console.log("--- [2] Building the prompt... ---");
      const prompt = `
          You are an expert career coach. Analyze the following resume based on the user's profile and the target job.
          USER PROFILE: ${JSON.stringify(userProfile)}
          TARGET JOB: ${goalJob} - ${goalJobDescription}
          RESUME: "${resumeText}"
          Provide your analysis in a single, valid JSON object with the following keys: tailoringScore, alignmentAnalysis, strengths, improvementAreas, actionableSuggestions.
          Do not include any text or markdown formatting before or after the JSON object.
      `;
      console.log("--- [3] Prompt built. Preparing to call Ollama... ---");

      const response = await axios.post(ollamaApiUrl, {
          model: "phi3:mini",
          prompt: prompt,
          format: "json",
          stream: false
      }, {
          timeout: 120000 
      });

      console.log("--- [4] Successfully received response from Ollama. ---");
      const responseData = response.data;
      const parsedJson = JSON.parse(responseData.response);

      console.log("--- [5] Sending final JSON to frontend. ---");
      res.json(parsedJson);

    } catch (error) {
      console.error("--- [ERROR] An error occurred in the Ollama route ---");
      console.error("Error message:", error.message);
      if (error.code === 'ECONNABORTED') {
          res.status(504).json({ error: true, message: "The AI model took too long to respond." });
      } else {
          res.status(500).json({ error: true, message: "Failed to get response from local AI model." });
      }
    }
  });

// --- Start the Server ---
app.listen(port, () => {
  console.log(`🚀 Server is running on http://localhost:${port}`);
});