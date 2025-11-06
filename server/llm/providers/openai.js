// server/llm/providers/openai.js
// Clean native OpenAI provider

class OpenAILLM {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;
    if (!this.apiKey) throw new Error("OPENAI_API_KEY missing");

    this.model = process.env.OPENAI_MODEL || "gpt-4o-mini";
    this.apiBase = process.env.OPENAI_BASE || "https://api.openai.com/v1";
    this.temperature = Number(process.env.OPENAI_TEMPERATURE || 0.1);
    this.maxTokens = Number(process.env.OPENAI_MAX_TOKENS || 1000);
  }

  async generate(prompt) {
    const body = {
      model: this.model,
      temperature: this.temperature,
      max_tokens: this.maxTokens,
      messages: [
        {
          role: "system",
          content:
            "You are a strict JSON generator. Output ONLY valid JSON that matches the schema. No explanations.",
        },
        { role: "user", content: prompt },
      ],
    };

    const resp = await fetch(`${this.apiBase}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await resp.json();

    if (!resp.ok) {
      const msg = data?.error?.message || JSON.stringify(data);
      throw new Error(`OpenAI API error: ${msg}`);
    }

    const text = data?.choices?.[0]?.message?.content || "";
    return text.trim();
  }
}

const llm = new OpenAILLM();

async function callOpenAI(prompt, schema) {
  try {
    return await llm.generate(prompt, schema);
  } catch (err) {
    console.error("[OpenAILLM] Error:", err.message);
    throw err;
  }
}

module.exports = { callOpenAI, OpenAILLM };
