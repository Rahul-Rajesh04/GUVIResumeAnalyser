const { callOpenAI } = require("./providers/openai");

async function generateJson(prompt, order, schema) {
  const providers = (process.env.PROVIDERS || "openai")
    .split(",")
    .map((s) => s.trim().toLowerCase());

  let out;
  for (const p of providers) {
    try {
      if (p === "openai") {
        out = await callOpenAI(prompt, schema);
        if (out) return out;
      }
    } catch (e) {
      console.error("[llm] provider", p, "failed:", e.message);
    }
  }

  throw new Error("All providers failed");
}

module.exports = { generateJson };
