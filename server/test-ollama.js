// server/test-ollama.js
const axios = require('axios');

async function testConnection() {
  console.log("Attempting to connect to Ollama at http://127.0.0.1:11434...");
  try {
    const ollamaApiUrl = 'http://127.0.0.1:11434/api/generate';

    const response = await axios.post(ollamaApiUrl, {
      model: "llama3",
      prompt: "Hello, are you there?",
      stream: false
    });

    console.log("✅ SUCCESS! Ollama responded.");
    console.log("Response data:", response.data);

  } catch (error) {
    console.error("❌ FAILED to connect to Ollama.");
    console.error("Error message:", error.message);
  }
}

testConnection();