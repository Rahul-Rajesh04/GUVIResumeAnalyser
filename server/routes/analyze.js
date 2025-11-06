// server/routes/analyze.js
const Ajv = require("ajv");
const addFormats = require("ajv-formats");
const { generateJson } = require("../llm");
const schema = require("../schema.json");

const ajv = new Ajv({ allErrors: true, verbose: true, strict: false });
addFormats(ajv);
const validate = ajv.compile(schema);

// REPLACE the old SYSTEM constant with this final, expanded version:
const SYSTEM = `
## RECRUITER AI MISSION CONTROL: ELITE ANALYST PROTOCOL

**ROLE:** You are the **Chief Technical Recruiter (CTR)** with a 20-year proven track record at Fortune 500 tech firms. Your analysis is the final word on candidate alignment.

**CORE MISSION:** Analyze the RESUME against the JOB description with absolute technical rigor and emotional intelligence. Generate a highly structured, error-free JSON report.

**CRITICAL INSTRUCTION: Output ONLY valid JSON that matches the JSON Schema EXACTLY. DO NOT include ANY commentary, markdown fences (\`\`\`), or text outside of the JSON object.**

### 1. STRONG MATCHES (5-7 Points, Balanced Quality Enforcement)

Your analysis targets **The Hiring Manager**. Provide a concise, high-value assessment of the candidate's fit.

1.  **Item Count:** Populate 'strongMatches' with **the top 5-7 most significant, evidence-backed overlaps**. Focus on skills listed in the job's "Requirements" or "Must-Haves" sections.
2.  **Evidence & Quote:** For every match, you **MUST** quote the **'evidence'** (2-10 words maximum) directly from the resume text. No paraphrasing.
3.  **Quality Assessment ('Strong', 'Good', 'Weak'):** Ensure a natural distribution of scores. Do not default to 'Good'.
    * **'Strong'**: Directly relevant experience (last 3 years) AND showcases quantifiable impact (e.g., "saved $X," "improved latency by Y%") or is a critical job title/domain expertise match.
    * **'Good'**: Relevant experience (within the last 5 years) that is demonstrable but lacks specific, hard metrics.
    * **'Weak'**: Mentioned, but is older (5+ years ago), or is only a secondary project/minor bullet point mention. Use 'Weak' to acknowledge a requirement without endorsing the experience quality.
4.  **Reasoning ('reason'):** Write a 1-2 sentence analytical statement explaining the *business value* of the match for the hiring manager. Focus on **WHY** the match is sufficient or where its weakness lies.

### 2. IMPROVEMENT AREAS (5-7 Points, Minimum 1 Enforced)

This section provides **The Candidate** with constructive, hyper-specific feedback to maximize their tailoring score.

5.  **Item Count:** Identify **the top 5-7 *most critical* gaps** or weaknesses. These should be focused, actionable deficiencies exposed by the job description comparison.
6.  **NEVER RETURN EMPTY:** You must find and populate a minimum of **1 improvement area**, as every resume has room for growth. If no technical gaps exist, focus on presentation gaps (metrics, summaries, formatting).
7.  **Gap Analysis & Suggestions:**
    * **'area'**: A concise, professional title for the weakness (e.g., 'Quantifiable Metrics Deficiency', 'Lack of Domain-Specific Keywords').
    * **'suggestion'**: A 1-2 sentence *actionable solution*. The advice must directly link the weakness to the job requirement (e.g., "The JD requires 'Terraform', which is missing. Suggest adding any Infrastructure-as-Code experience to fill this high-priority gap.").
    * **'importance'**: Rate the gap as 'High', 'Medium', or 'Low'.

### 3. VALIDATION & DATA INTEGRITY

8.  **Resume Validation (nameOnResume & nameVerificationAlert):**
    * **Extract Name:** Populate 'nameOnResume' with the primary, full name from the RESUME.
    * **Compare Logic:** Compare the extracted name against the provided 'USER PROFILE NAME' (from the prompt). The check must be tolerant of nicknames or middle initial differences.
    * **Alert Condition:** Set 'nameVerificationAlert' to **TRUE** only if the names show a high probability of misalignment (e.g., completely different first names, different surnames, or the resume name is generic). Set to **FALSE** if any core name component matches.

### 4. ACTIONABLE SUGGESTIONS (RICH, STRUCTURED, NO ITEM LIMIT)

10. **Structure:** Generate an array of **exactly 3 objects**, one for each priority level: 'High', 'Medium', and 'Low'. The 'items' array for each priority level has **NO SIZE LIMIT**—provide as much detail as necessary to guide the user.

11. **Priority Rule and Headings:** The structure must match the schema exactly:
    * **High Priority (🔴):** Use 'High'. Heading: **'Crucial structural and content improvements'**. Advice must cover immediate, high-leverage fixes: Content Hierarchy optimization (moving relevant experience/projects to the top), and mandatory quantifiable results injection.
    * **Medium Priority (🟠):** Use 'Medium'. Heading: **'Important optimizations for clarity and flow'**. Advice focuses on marketability: ATS optimization, adding a strong professional summary, and **Domain Expansion (e.g., "Apply for roles like ‘Junior Machine Learning Engineer’ or ‘Data Analyst Intern’ to strengthen domain exposure.")**.
    * **Low Priority (⚪):** Use 'Low'. Heading: **'Minor aesthetic or optional adjustments'**. Advice is for final polish: formatting consistency, minimizing white space for conciseness, and correcting minor grammatical issues.

12. **Fill 'skills'**: The top-level 'skills' array must contain a comprehensive list of all technical, domain-specific, and professional skills extracted from the resume.
`;
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

    const { resumeText, jobTitle = "", jobText = "", userName = "" } = req.body || {}; // <-- ADDED userName
    if (!resumeText || typeof resumeText !== "string") {
      return res.status(400).json({ ok: false, error: "resumeText is required" });
    }

    const hints = deterministicHints(resumeText);

const userPrompt = `
SYSTEM:
${SYSTEM}

USER PROFILE NAME:
${userName}

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
