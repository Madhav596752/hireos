// src/modules/screening/screening.service.js
import Groq from "groq-sdk";
import prisma from "../../config/db.js";

function getGroqClient() {
  if (!process.env.GROQ_API_KEY) {
    throw { status: 500, message: "GROQ_API_KEY .env mein set nahi hai. console.groq.com se key lo." };
  }
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
}

export async function screenResume({ resumeText, jobDescription, candidateId, jobId, userId }) {
  const groq = getGroqClient();

  const prompt = `You are an expert AI recruiter. Analyse the resume and job description.
Return ONLY a valid JSON object. No markdown, no backticks, no explanation — just raw JSON.

{
  "matchScore": <integer 0-100>,
  "parsedData": {
    "name": "<full name or Unknown>",
    "title": "<current/recent job title>",
    "email": "<email or null>",
    "phone": "<phone or null>",
    "location": "<city, country or null>",
    "summary": "<2-3 sentence professional summary>",
    "skills": ["skill1", "skill2", "skill3"],
    "experience": [
      {
        "company": "<company name>",
        "role": "<job title>",
        "period": "<e.g. 2021-2023>",
        "bullets": ["achievement 1", "achievement 2"]
      }
    ],
    "education": [
      { "school": "<university>", "degree": "<degree>", "year": "<year>" }
    ]
  },
  "insights": [
    { "label": "Skill match",      "score": <0-100>, "note": "<one line>" },
    { "label": "Seniority",        "score": <0-100>, "note": "<one line>" },
    { "label": "Culture signals",  "score": <0-100>, "note": "<one line>" },
    { "label": "Risk flags",       "score": <0-100>, "note": "<one line>" }
  ],
  "interviewQuestions": [
    "<question 1>",
    "<question 2>",
    "<question 3>",
    "<question 4>",
    "<question 5>"
  ]
}

RESUME TEXT:
${resumeText}

JOB DESCRIPTION:
${jobDescription || "Not provided. Evaluate resume on general professional merit."}`;

  let raw;
  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile", // fast + free model
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 2048,
    });
    raw = completion.choices[0]?.message?.content?.trim();
  } catch (groqErr) {
    console.error("[Groq Error]", groqErr.message);
    if (groqErr.status === 401) {
      throw { status: 500, message: "Groq API key invalid hai. console.groq.com se sahi key lo." };
    }
    if (groqErr.status === 429) {
      throw { status: 429, message: "Groq rate limit hit ho gayi. Thodi der baad try karo." };
    }
    throw { status: 502, message: `Groq API error: ${groqErr.message}` };
  }

  // Parse JSON — handle markdown code blocks if model wraps response
  let parsed;
  try {
    const cleaned = raw
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/, "")
      .trim();
    parsed = JSON.parse(cleaned);
  } catch {
    // Safe JSON extraction using indexOf instead of [\s\S]* regex (ReDoS prevention)
    const start = raw.indexOf("{");
    const end   = raw.lastIndexOf("}");
    if (start === -1 || end === -1 || end <= start) {
      console.error("[Screening] Raw Groq response:", raw.substring(0, 500));
      throw { status: 502, message: "AI returned invalid response. Please try again." };
    }
    try {
      parsed = JSON.parse(raw.slice(start, end + 1));
    } catch {
      throw { status: 502, message: "AI response could not be parsed. Please try again." };
    }
  }

  // Validate required fields
  if (typeof parsed.matchScore !== "number") parsed.matchScore = 50;
  if (!parsed.parsedData) parsed.parsedData = { name: "Unknown", skills: [] };
  if (!parsed.insights) parsed.insights = [];
  if (!parsed.interviewQuestions) parsed.interviewQuestions = [];

  // Save to DB
  const screening = await prisma.screening.create({
    data: {
      matchScore:  parsed.matchScore,
      insights:    parsed.insights,
      parsedData:  parsed.parsedData,
      interviewQs: parsed.interviewQuestions,
      candidateId,
      jobId:       jobId || null,
      userId,
    },
  });

  // Update candidate with extracted data
  await prisma.candidate.update({
    where: { id: candidateId },
    data: {
      score:   parsed.matchScore,
      skills:  parsed.parsedData.skills || [],
      summary: parsed.parsedData.summary || null,
      stage:   "SCREENED",
    },
  });

  return {
    ...screening,
    parsedData:         parsed.parsedData,
    interviewQuestions: parsed.interviewQuestions,
  };
}

export async function generateInterviewQuestions({ jobTitle, skills, experienceSummary }) {
  const groq = getGroqClient();

  const prompt = `Generate 8 targeted interview questions for a ${jobTitle} role.
Skills: ${skills.join(", ")}.
Background: ${experienceSummary}
Return ONLY a JSON array of strings. No markdown, no backticks:
["question1", "question2", ...]`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.5,
    max_tokens: 1024,
  });

  const raw     = completion.choices[0]?.message?.content?.trim();
  const cleaned = raw.replace(/^```json?\s*/i, "").replace(/\s*```$/, "").trim();
  // Safe array extraction using indexOf instead of [\s\S]* regex (ReDoS prevention)
  const start = cleaned.indexOf("[");
  const end   = cleaned.lastIndexOf("]");
  if (start === -1 || end === -1 || end <= start) throw { status: 502, message: "AI returned invalid format" };
  return JSON.parse(cleaned.slice(start, end + 1));
}

export async function listScreenings(candidateId) {
  return prisma.screening.findMany({
    where:   { candidateId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getScreening(id) {
  const s = await prisma.screening.findUnique({ where: { id } });
  if (!s) throw { status: 404, message: "Screening not found" };
  return s;
}