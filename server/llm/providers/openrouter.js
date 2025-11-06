// server/llm/providers/openrouter.js
// Provider for OpenRouter with retry/backoff and attribution headers

const fetch = globalThis.fetch;
const DEFAULT_RETRIES = 3;

class OpenRouterProvider {
  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY;
    if (!this.apiKey) throw new Error("OPENROUTER_API_KEY missing in .env");
    this.base = process.env.OPENROUTER_BASE || "https://openrouter.ai/api/v1";
    this.temperature = Number(process.env.OPENROUTER_TEMPERATURE || 0.1);
    this.maxTokens = Number(process.env.OPENROUTER_MAX_TOKENS || 800);
    this.retries = DEFAULT_RETRIES;
  }

  // model is full id like "deepseek/deepseek-chat-v3-0324:free"
  async call(prompt, model) {
    const body = {
      model,
      temperature: this.temperature,
      max_tokens: this.maxTokens,
      messages: [
        {
          role: "system",
          content:
            "You are a strict JSON generator. Output ONLY valid JSON matching the provided schema. No explanations or markdown.",
        },
        { role: "user", content: prompt },
      ],
    };

    // Simple exponential backoff for 429 / transient failures
    let attempt = 0;
    let lastErr = null;
    while (attempt < this.retries) {
      attempt++;
      try {
        const resp = await fetch(`${this.base}/chat/completions`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
            // attribution headers OpenRouter likes
            "HTTP-Referer": process.env.WEB_ORIGIN || "http://localhost:5173",
            "X-Title": "GUVI Resume Analyzer",
          },
          body: JSON.stringify(body),
        });

        // network-level failure leads here as well
        const data = await resp.json().catch(() => ({}));

        if (!resp.ok) {
          
          // ---!!! THIS IS THE IMPORTANT DEBUG LINE !!!---
          // This will print the *exact* error from OpenRouter
          console.error(`[OpenRouter] Not OK response for model ${model}. Status: ${resp.status}, Body:`, JSON.stringify(data));
          // ---!!! END DEBUG LOG !!!---

          // If 429, wait and retry with backoff
          if (resp.status === 429) {
            const wait = Math.pow(2, attempt) * 1000 + Math.floor(Math.random() * 500);
            console.warn(`[OpenRouter] 429 received, backing off ${wait}ms (attempt ${attempt})`);
            await new Promise(r => setTimeout(r, wait));
            lastErr = new Error(data?.error?.message || `HTTP ${resp.status}`);
            continue;
          }
          // other HTTP errors -> bubble up
          throw new Error(data?.error?.message || `OpenRouter error HTTP ${resp.status}`);
        }

        // success
        const text = data?.choices?.[0]?.message?.content || "";
        if (!text) throw new Error("OpenRouter returned empty content");
        return text.trim();
      } catch (err) {
        lastErr = err;
        // network error or JSON parse error => retry a few times
        const wait = Math.pow(2, attempt) * 500;
        console.warn(`[OpenRouter] attempt ${attempt} failed: ${err.message}. retrying in ${wait}ms`);
        await new Promise(r => setTimeout(r, wait));
      }
    }
    throw lastErr || new Error("OpenRouter call failed after retries");
  }
}

// export singleton pattern
const provider = new OpenRouterProvider();
module.exports = { provider };