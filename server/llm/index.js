// server/llm/index.js
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { RequestQueue } = require("./queue");
const { provider } = require("./providers/openrouter");

// Config
const MODELS = (process.env.OPENROUTER_MODELS || "deepseek/deepseek-chat-v3-0324:free,qwen/qwen3-8b:free")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

const RPM = Number(process.env.QUEUE_RPM || 20);
const queue = new RequestQueue(RPM);

// simple persistent cache
const CACHE_FILE = process.env.CACHE_FILE || path.join(__dirname, "..", "llm_cache.json");
let CACHE = {};
try {
  if (fs.existsSync(CACHE_FILE)) {
    const raw = fs.readFileSync(CACHE_FILE, "utf8");
    CACHE = raw ? JSON.parse(raw) : {};
  }
} catch (e) {
  console.warn("[llm] failed to load cache:", e.message);
}

function persistCache() {
  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(CACHE, null, 2), "utf8");
  } catch (e) {
    console.warn("[llm] failed to persist cache:", e.message);
  }
}

function cacheKey(prompt, model) {
  const h = crypto.createHash("sha256");
  h.update(model + "::" + prompt);
  return h.digest("hex");
}

/**
 * generateJson(prompt, order, schema)
 * - Checks cache first
 * - Enqueues call to respect RPM
 * - Tries models in MODELS list (fallback)
 */
async function generateJson(prompt /* string */, order /* array - ignored for now */, schema /* unused here */) {
  // Use MODELS order (or env override). order param is ignored for now — easier to control through env.
  for (const model of MODELS) {
    const key = cacheKey(prompt, model);
    if (CACHE[key]) {
      // cached result
      return CACHE[key];
    }
    // Enqueue provider call
    try {
      const out = await queue.push(() => provider.call(prompt, model));
      // persist to cache
      CACHE[key] = out;
      // persist file (async-safe)
      try { persistCache(); } catch(_) {}
      return out;
    } catch (err) {
      console.error(`[llm] model ${model} failed: ${err.message}`);
      // try next model
    }
  }
  throw new Error("All LLM models failed");
}

module.exports = { generateJson };
