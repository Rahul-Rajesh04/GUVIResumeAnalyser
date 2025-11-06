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
    * *Example*: "Job requires 'Risk Management'. Resume lists this under their most recent role. This is a Strong match."
    * *Example*: "Job requires 'React'. Resume mentions a project from 2019. This is a Weak match due to recency."
5.  **Be Strict:** If no strong matches are found, return an empty array for 'strongMatches'.

// --- NEW INSTRUCTIONS START HERE ---

6.  **Find Gaps (improvementAreas):** Identify the top 5-7 *most significant* gaps or weaknesses in the RESUME when compared to the JOB. This is for the *candidate*, so the tone should be constructive.
7.  **Analyze Gaps (improvementAreas):** For each gap, provide the following:
    * **'area'**: A short title for the problem (e.g., 'Missing Keyword: Cloud', 'Lack of Metrics', 'Outdated Tech Stack').
    * **'suggestion'**: Write a 1-2 sentence *actionable suggestion*. Explain the gap and what to add.
        * *Example*: "Job requires 'AWS or Azure'. Resume does not mention any cloud platforms. This is a High importance gap. Suggestion: If you have cloud experience, add it to your skills or project descriptions."
        * *Example*: "Resume mentions 'managing projects' but lacks specifics. This is a Medium importance gap. Suggestion: Add quantifiable results (e.g., 'managed 5 projects on time') to show impact."
    * **'importance'**: Rate the gap as 'High', 'Medium', or 'Low'.
        * **'High'**: A core, mandatory requirement from the job description is completely missing.
        * **'Medium'**: A skill is mentioned but lacks depth, or a secondary requirement is missing.
        * **'Low'**: A minor "nice-to-have" skill or a formatting issue.
8.  **Be Helpful:** If the resume is excellent and no gaps are found, return an empty array for 'improvementAreas'.

// --- NEW INSTRUCTIONS END HERE ---

9.  **Fill 'skills'**: The top-level 'skills' array should still contain a general list of all skills extracted from the resume.`;

// ... (the rest of the file stays exactly the same)

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
