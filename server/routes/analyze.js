// server/routes/analyze.js
const Ajv = require("ajv");
const addFormats = require("ajv-formats");
const { generateJson } = require("../llm");
const schema = require("../schema.json");

const ajv = new Ajv({ allErrors: true, verbose: true, strict: false });
addFormats(ajv);
const validate = ajv.compile(schema);

// ... (keep all the 'require' statements at the top)

// ... (keep all the 'require' statements at the top)

// REPLACE the old SYSTEM constant with this new one:
// REPLACE the old SYSTEM constant with this new one:
// REPLACE the old SYSTEM constant with this new one:
const SYSTEM = `You are an expert technical recruiter with 20 years of experience.
Your task is to analyze the RESUME and compare it *vigilantly* against the provided JOB description.
Output ONLY valid JSON that matches the JSON Schema EXACTLY.

CRITICAL INSTRUCTIONS:
1.  **Be a Tough Grader (strongMatches):** Do not list everything. Only populate 'strongMatches' with the top 5-7 most significant overlaps between the RESUME and the JOB.
2.  **Find Evidence (strongMatches):** For each match, you *must* quote the 'evidence' directly from the resume.
3.  **Evaluate Quality (strongMatches):** For each match, rate its 'quality' as 'Strong', 'Good', or 'Weak'.
    * **'Strong'**: Recent (last 2 years) AND has high impact (quantifiable results) or is a direct job title match.
    * **'Good'**: Recent, but lacks quantifiable impact.
    * **'Weak'**: Mentioned, but is old (3+ years ago) or seems like a minor part of a project.
4.  **Write the 'reason' (strongMatches):** This is for a hiring manager. Write a 1-2 sentence analysis explaining the match's quality.
5.  **Be Strict:** If no strong matches are found, return an empty array for 'strongMatches'.

// --- IMPROVEMENT AREAS (5-7 POINTS ENFORCED) ---

6.  **Find Gaps (improvementAreas):** Identify the top 5-7 *most significant* gaps or weaknesses in the RESUME when compared to the JOB. This is for the *candidate*, so the tone should be constructive.
7.  **Analyze Gaps (improvementAreas):** For each gap, provide the following:
    * **'area'**: A short title for the problem (e.g., 'Missing Keyword: Cloud', 'Lack of Metrics', 'Outdated Tech Stack').
    * **'suggestion'**: Write a 1-2 sentence *actionable suggestion*. Explain the gap and what to add.
    * **'importance'**: Rate the gap as 'High', 'Medium', or 'Low'.
8.  **NEVER RETURN EMPTY:** You must find and populate a minimum of 1 improvement area, as all resumes have room for growth.

// --- ACTIONABLE SUGGESTIONS (RICH DATA FORMAT) ---
9. **Suggest Next Steps (actionableSuggestions):** Generate an array of exactly 3 objects, one for each priority level: 'High', 'Medium', and 'Low'. Ensure the tone is professionally encouraging.

10. **Priority Rule and Headings:** The structure must match the schema exactly:
    * **High Priority (🔴):** Use 'High' for the 'priority' field. Use heading: 'Crucial structural and content improvements'. Advice must cover hierarchy (moving key sections up) and adding quantifiable results/metrics. If projects are missing, suggest adding a relevant one, e.g., 'AI-Powered Resume Screener using Python and NLP' for data roles.
    * **Medium Priority (🟠):** Use 'Medium' for the 'priority' field. Use heading: 'Important optimizations for clarity and flow'. Advice must cover ATS optimization, professional summaries, and applying for more domain-relevant interviews (e.g., 'Junior Machine Learning Engineer').
    * **Low Priority (⚪):** Use 'Low' for the 'priority' field. Use heading: 'Minor aesthetic or optional adjustments'. Advice must cover minor formatting, font consistency, or spacing.

11. **Fill 'skills'**: The top-level 'skills' array should still contain a general list of all skills extracted from the resume.`;

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

    const { resumeText, jobTitle = "", jobText = "" } = req.body || {};
    if (!resumeText || typeof resumeText !== "string") {
      return res.status(400).json({ ok: false, error: "resumeText is required" });
    }

    const hints = deterministicHints(resumeText);

const userPrompt = `
SYSTEM:
${SYSTEM}

RESUME (raw text):
${trimResume(resumeText)}

JOB TITLE (optional):
${jobTitle}

JOB DESCRIPTION (optional):
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
