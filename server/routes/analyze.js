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

// single-flight lock (optional)
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

    const order = (process.env.PROVIDERS || "openrouter").split(",").map(s => s.trim());
    let out = await generateJson(userPrompt, order, schema);

    // one repair attempt if needed
    for (let i = 0; i < 1; i++) {
      try {
        let obj = parseCandidateJson(out);
        const ok = validate(obj);
        if (ok) return res.json({ ok: true, data: obj, providerOrderTried: order });

        const errText = ajv.errorsText(validate.errors, { separator: "\n" });
        const repair = `${userPrompt}

Top-level MUST be the schema object with keys: name, contact, education, experience, skills.
Do NOT wrap inside "ResumeExtraction" or "data".
No markdown fences. Only a single JSON object.

VALIDATION ERROR:
${errText}

Fix and return ONLY valid JSON.`;
        out = await generateJson(repair, order, schema);
      } catch (e) {
        const repair = `${userPrompt}

Top-level MUST be the schema object with keys: name, contact, education, experience, skills.
Do NOT wrap inside "ResumeExtraction" or "data".
No markdown fences. Only a single JSON object.

PARSING ERROR: ${e.message}
Return ONLY valid JSON.`;
        out = await generateJson(repair, order, schema);
      }
    }

    try {
      let obj = parseCandidateJson(out);
      const ok = validate(obj);
      return res.json({
        ok,
        data: obj,
        validationErrors: validate.errors || null,
        providerOrderTried: order
      });
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
