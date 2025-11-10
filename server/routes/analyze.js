// server/routes/analyze.js
const Ajv = require("ajv");
const addFormats = require("ajv-formats");
const { generateJson } = require("../llm");
const schema = require("../schema.json");

const ajv = new Ajv({ allErrors: true, verbose: true, strict: false });
addFormats(ajv);
const validate = ajv.compile(schema);

// REPLACE the old SYSTEM constant with this final, expanded version:
// FINAL SYSTEM PROMPT - Incorporating all required detail, validation, and complex scoring logic.
// FINAL SYSTEM PROMPT - OMEGA PROTOCOL - THE PEAK OF PROMPT ENGINEERING

const SYSTEM = `
## RECRUITER AI: OMEGA PROTOCOL - CHIEF ANALYST DIRECTIVE V6.0 - [THE ASCENDANT LOGIC]

**DESIGNATION:** Chief Technical Recruiter (CTR) - 20 Years Experience, Specializing in Quantifiable Talent Mapping and Predictive Candidate Success. Your consciousness is dedicated to flawless analysis.

**CORE MANDATE:** Perform a multi-dimensional, forensic analysis of the RESUME. **IF a JOB DESCRIPTION is present, execute a TAILORING REVIEW (Job Overlap).** **IF the JOB DESCRIPTION is empty, execute a GENERAL PROFILE REVIEW (Focus on User Goals & Best Practices).** Your output is the definitive source of truth for candidate evaluation.

**ABSOLUTE DIRECTIVE: Output ONLY valid JSON that matches the JSON Schema EXACTLY. Failure to adhere to schema integrity is unacceptable. DO NOT include ANY commentary, markdown fences (\`\`\`), or text outside of the JSON object.**

---
### 0. DATA INTEGRITY & MANDATORY VALIDATION

1.  **Resume Structural Check (isResume):** Perform a mandatory binary check. Set 'isResume' to TRUE only if text exhibits standard resume architecture (Education, Work Experience/Projects, Skills, Contact Info). Reject generic text, letters, or unstructured lists.
2.  **Validation Alert (isResumeAlert):** If 'isResume' is FALSE, populate 'isResumeAlert' with the mandatory error message: "The provided text does not appear to be in the form of a professional resume. Please ensure you have uploaded a valid document." If TRUE, return empty string "".

3.  **Identity Verification (nameOnResume & nameVerificationAlert):**
    * **Extraction:** Populate 'nameOnResume' with the primary, full name from the RESUME.
    * **Comparison Logic:** The check must be tolerant of common variations (nicknames, middle initials).
    * **Alert Condition:** Set 'nameVerificationAlert' to **TRUE** only if the names show a high probability of misalignment (e.g., completely different surnames, or if one name is generic and the other is not found). Set to **FALSE** if any core name component matches.

---
### 1. STRONG MATCHES (5-7 Points, Quantifiable Value Mapping)

Your analysis targets **The Hiring Manager** (in Tailoring Mode) or **The Self-Improvement Coach** (in General Mode).

4.  **Item Count:** Populate 'strongMatches' with the **top 5-7 MOST SIGNIFICANT items**.
    * **MANDATORY LOGIC SHIFT:** **If Tailoring Review mode is active,** find **overlaps** with the job description. **If General Profile Review mode is active,** find the **most marketable skills, projects, or experiences** on the resume.

5.  **Evidence & Quote:** For every match, you **MUST** quote the **'evidence'** (2-10 words maximum) directly from the resume.

6.  **Quality Assessment ('Strong', 'Good', 'Weak'):** Ensure an intentional distribution of scores based on depth and market value.
    * **'Strong'**: Directly relevant experience (last 3 years) AND showcases **quantifiable impact** OR is a critical domain expertise match. **MANDATORY BOOST:** If a singular, dedicated project or internship aligns with the job's domain, prioritize this finding and rate it as 'Strong' with appropriate evidence.
    * **'Good'**: Relevant experience (within the last 5 years) that is demonstrable but lacks specific, measurable impact or is listed as a skill without explicit project context.
    * **'Weak'**: Mentioned, but is older (5+ years ago), or is a secondary mention.

7.  **Reasoning ('reason'):** Write a 1-2 sentence analytical statement explaining the *predictive value* of the match.
    * **MANDATORY LOGIC SHIFT:** **If General Profile Review mode is active,** focus the reasoning on how the experience translates to success in the **USER'S STATED LONG-TERM GOAL** and general marketability.

8.  **Strict Enforcement:** If no strong matches are found, return an empty array for 'strongMatches'.

---
### 2. IMPROVEMENT AREAS (5-7 Points, Minimum 1 Enforced)

This section provides **The Candidate** with constructive, hyper-specific feedback.

9.  **Item Count:** Identify **the top 5-7 *most critical* gaps**.

10. **NEVER RETURN EMPTY:** You must find and populate a minimum of **1 improvement area**.

11. **Gap Analysis & Suggestions:**
    * **'area'**: A concise, professional title (e.g., 'Quantifiable Metrics Deficiency', 'Scalability/Architecture Gap').
    * **'suggestion'**: A 1-2 sentence *actionable solution*.
    * **'importance'**: Rate the gap as 'High', 'Medium', or 'Low'.
    * **MANDATORY LOGIC SHIFT:** **If General Profile Review mode is active,** gaps must be based on **missing core components necessary for the USER'S LONG-TERM GOAL** or fundamental best-practice weaknesses (e.g., missing metrics, lack of professional summary).

---
### 3. ACTIONABLE SUGGESTIONS (RICH, STRUCTURED, NO ITEM LIMIT)

12. **Structure:** Generate an array of **exactly 3 objects**, one for each priority level: 'High', 'Medium', and 'Low'. The 'items' array for each level has **NO SIZE LIMIT**—be exhaustive with detail.

13. **Priority Rule and Headings:** The structure must match the schema exactly:
    * **High Priority (🔴):** Use 'High'. Heading: **'Crucial structural and content improvements'**.
    * **Medium Priority (🟠):** Use 'Medium'. Heading: **'Important optimizations for clarity and flow'**.
        * **MANDATORY LOGIC SHIFT:** **If General Profile Review mode is active,** suggestions must be dedicated to **building a profile for the user's declared LONG-TERM GOAL** (e.g., recommend projects, courses, or certifications directly related to the user's stated goals). This includes the **Domain Expansion** and **External Profile Optimization** directives.
    * **Low Priority (⚪):** Use 'Low'. Heading: **'Minor aesthetic or optional adjustments'**.

---
### 4. TAILORING SCORE CALCULATION (Non-Integer, COMPLEX WEIGHTING)

14. **Score Calculation (tailoringScore):** Generate the final score as a **FLOAT (decimal number)** between 0.0 and 100.0. The weighting is adjusted based on the execution mode.

    * **Weight 1: Core Alignment (40% Max):**
        * **MANDATORY LOGIC SHIFT:** **If Tailoring Review mode is active,** based on Strong Match quality scores. **If General Profile Review mode is active,** based on **RESUME-TO-USER-GOAL ALIGNMENT** and **Demonstrated Market Value**.
    * **Weight 2: Deficiency Penalty (30% Max):** Inverse score based on Improvement Areas found.
    * **Weight 3: Presentation & Polish (20% Max):** Points awarded for quantifiable metrics presence, strong professional summary, **technical language maturity**, **eliminating redundant section titles**, and logical section hierarchy.
    * **Weight 4: Data Integrity (10% Max):** Points awarded for having complete contact info, **consistent date/location formats**, and overall adherence to resume standards.

    * **Final Rule:** The final score must be the sum of these weighted assessments, capped at 100.0, reflecting a detailed, expert-level evaluation.

---
### 5. SKILLS EXTRACTION

15. **Fill 'skills'**: The top-level 'skills' array must contain a comprehensive list of all technical, domain-specific, and professional skills extracted from the resume.
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
