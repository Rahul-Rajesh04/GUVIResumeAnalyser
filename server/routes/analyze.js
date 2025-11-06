// server/routes/analyze.js
const Ajv = require("ajv");
const addFormats = require("ajv-formats");
const { generateJson } = require("../llm");
const schema = require("../schema.json");

const ajv = new Ajv({ allErrors: true, verbose: true, strict: false });
addFormats(ajv);
const validate = ajv.compile(schema);

const SYSTEM = `You are a strict JSON generator.
Output ONLY valid JSON that matches the JSON Schema EXACTLY at the TOP LEVEL.
Do NOT wrap inside any parent key (e.g., { "ResumeExtraction": { ... } } or { "data": { ... } }).
No markdown, no comments, no prose. If unsure, use empty strings or empty arrays.`;

// helpers
function stripCodeFences(s) {
  if (typeof s !== "string") return s;
  return s.replace(/^\s*```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "").trim();
}
function normalizeTopLevel(obj) {
  if (!obj || typeof obj !== "object") return obj;
  const keys = Object.keys(obj);
  if (keys.length === 1) {
    const k = keys[0].toLowerCase();
    if (["resumeextraction","data","result","response","output"].includes(k)) return obj[keys[0]];
  }
  return obj;
}
function parseCandidateJson(text) {
  const s = stripCodeFences(text || "");
  let obj = JSON.parse(s);
  obj = normalizeTopLevel(obj);
  return obj;
}
function deterministicHints(text) {
  const email = (text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)||[])[0] || "";
  const phone = (text.match(/(\+?\d[\d\s\-()]{8,}\d)/)||[])[0] || "";
  const links = Array.from(new Set((text.match(/https?:\/\/[^\s)]+/g)||[]).slice(0,5)));
  return { email, phone, links };
}
function trimResume(text) {
  if (!text) return "";
  const MAX = Number(process.env.RESUME_CHAR_LIMIT || 8000);
  let t = text.replace(/\r/g, "").replace(/\n{3,}/g, "\n\n");
  return t.length > MAX ? t.slice(0, MAX) : t;
}

// single-flight lock to avoid concurrent heavy calls (optional)
let busy = false;

async function analyze(req, res) {
  try {
    if (busy) return res.status(429).json({ ok: false, error: "Analyzer busy, retry shortly." });
    busy = true;

    const { resumeText, jobText = "" } = req.body || {};
    if (!resumeText || typeof resumeText !== "string") {
      return res.status(400).json({ ok: false, error: "resumeText is required" });
    }

    const hints = deterministicHints(resumeText);

    const userPrompt = `
SYSTEM:
${SYSTEM}

RESUME (raw text):
${trimResume(resumeText)}

JOB (optional):
${jobText}

SCHEMA:
${JSON.stringify(schema)}

HINTS (non-binding):
${JSON.stringify(hints)}

Return ONLY the JSON, nothing else.
`.trim();

    // generate via LLM(s)
    let out = await generateJson(userPrompt, null, schema);

    // attempt auto-repair once if invalid
    for (let i = 0; i < 1; i++) {
      try {
        const obj = parseCandidateJson(out);
        const ok = validate(obj);
        if (ok) return res.json({ ok: true, data: obj, providerOrderTried: (process.env.OPENROUTER_MODELS||"").split(",") });
        const errText = ajv.errorsText(validate.errors, { separator: "\n" });
        const repairPrompt = `${userPrompt}\n\nVALIDATION ERROR:\n${errText}\nFix and return ONLY valid JSON.`;
        out = await generateJson(repairPrompt, null, schema);
      } catch (e) {
        const repairPrompt = `${userPrompt}\n\nPARSING ERROR: ${e.message}\nReturn ONLY valid JSON.`;
        out = await generateJson(repairPrompt, null, schema);
      }
    }

    try {
      let obj = parseCandidateJson(out);
      obj = normalizeTopLevel(obj);
      const ok = validate(obj);
      return res.json({ ok, data: obj, validationErrors: validate.errors || null, providerOrderTried: (process.env.OPENROUTER_MODELS||"").split(",") });
    } catch (e) {
      return res.status(502).json({ ok: false, error: "Failed to produce valid JSON", detail: e.message });
    }
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message || "Internal error" });
  } finally {
    busy = false;
  }
}

module.exports = { analyze };
