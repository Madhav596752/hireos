// src/modules/candidates/bulk-screen.service.js
//
// Pipeline: CSV rows → create candidates → AI screen each → email shortlisted ones
//
import Groq from "groq-sdk";
import nodemailer from "nodemailer";
import prisma from "../../config/db.js";

// ── Groq client ──────────────────────────────────────────────────────────────
function getGroq() {
  if (!process.env.GROQ_API_KEY) throw { status: 500, message: "GROQ_API_KEY not set" };
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
}

// ── Mailer ───────────────────────────────────────────────────────────────────
function getTransporter() {
  return nodemailer.createTransport({
    host:   process.env.SMTP_HOST  || "smtp.gmail.com",
    port:   Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth:   { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

async function sendShortlistEmail({ candidateEmail, candidateName, score, companyName }) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("[BulkScreen] SMTP not configured — skipping email for", candidateEmail);
    return false;
  }
  try {
    const transporter = getTransporter();
    await transporter.sendMail({
      from:    `"${companyName || "HireOS"}" <${process.env.SMTP_USER}>`,
      to:      candidateEmail,
      subject: `Congratulations! You've been shortlisted 🎉`,
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px">
          <h2 style="color:#6366f1;margin-bottom:8px">You've been shortlisted!</h2>
          <p style="color:#374151">Hi <strong>${candidateName}</strong>,</p>
          <p style="color:#6b7280">
            We reviewed your profile and we're impressed! You've been shortlisted for the next stage of our hiring process.
          </p>
          <div style="background:#f9fafb;border-radius:8px;padding:16px;margin:20px 0">
            <p style="margin:0;color:#6b7280;font-size:14px">AI Match Score</p>
            <p style="margin:4px 0 0;font-size:28px;font-weight:700;color:#6366f1">${score}<span style="font-size:16px;color:#9ca3af">/100</span></p>
          </div>
          <p style="color:#6b7280">Our team will be in touch shortly with next steps. Stay tuned!</p>
          <p style="color:#9ca3af;font-size:12px;margin-top:32px">— ${companyName || "HireOS"} Hiring Team</p>
        </div>
      `,
    });
    return true;
  } catch (err) {
    console.error("[BulkScreen] Email failed for", candidateEmail, err.message);
    return false;
  }
}

// ── AI Screening (lightweight — uses candidate info, no resume needed) ────────
async function aiScreenCandidate({ name, appliedFor, skills, location }) {
  const groq = getGroq();

  const prompt = `You are an AI recruiter. Rate this candidate profile and return ONLY raw JSON, no markdown.

{
  "score": <integer 0-100>,
  "summary": "<2 sentence assessment>",
  "skills": ["skill1", "skill2"]
}

Candidate:
- Name: ${name}
- Applied for: ${appliedFor || "Not specified"}
- Skills: ${Array.isArray(skills) ? skills.join(", ") : skills || "Not specified"}
- Location: ${location || "Not specified"}`;

  try {
    const res = await groq.chat.completions.create({
      model:       "llama-3.3-70b-versatile",
      messages:    [{ role: "user", content: prompt }],
      temperature: 0.2,
      max_tokens:  256,
    });
    const raw     = res.choices[0]?.message?.content?.trim() || "{}";
    const cleaned = raw.replace(/^```json?\s*/i, "").replace(/\s*```$/, "").trim();
    // Safe JSON extraction using indexOf (ReDoS prevention)
    const start = cleaned.indexOf("{");
    const end   = cleaned.lastIndexOf("}");
    const parsed = (start !== -1 && end > start) ? JSON.parse(cleaned.slice(start, end + 1)) : {};
    return {
      score:   typeof parsed.score === "number" ? Math.min(100, Math.max(0, parsed.score)) : 50,
      summary: parsed.summary || "",
      skills:  parsed.skills  || [],
    };
  } catch (err) {
    console.error("[BulkScreen] Groq error for", name, err.message);
    return { score: 50, summary: "", skills: [] };
  }
}

// ── Main pipeline ─────────────────────────────────────────────────────────────
export async function bulkImportAndScreen({ rows, minScore = 70, sendEmails = true, userId }) {
  const STAGE_MAP = {
    new: "NEW", screened: "SCREENED", interview: "INTERVIEW",
    offer: "OFFER", hired: "HIRED", rejected: "REJECTED",
  };

  // Get recruiter info for emails
  const recruiter = userId
    ? await prisma.user.findUnique({ where: { id: userId }, select: { name: true, company: true } })
    : null;

  const results = {
    total:      rows.length,
    created:    0,
    screened:   0,
    shortlisted: 0,
    emailed:    0,
    skipped:    0,
    details:    [], // per-candidate result
  };

  for (const row of rows) {
    const email = String(row.email || "").trim().toLowerCase();
    const name  = String(row.name  || "").trim();
    if (!name || !email) { results.skipped++; continue; }

    // 1. Create candidate (skip duplicate emails)
    let candidate;
    try {
      const existing = await prisma.candidate.findFirst({ where: { email } });
      if (existing) {
        candidate = existing;
        results.skipped++;
      } else {
        candidate = await prisma.candidate.create({
          data: {
            name,
            email,
            phone:      row.phone      ? String(row.phone).trim()    : null,
            location:   row.location   ? String(row.location).trim() : null,
            appliedFor: String(row.appliedFor || row.applied_for || "").trim(),
            stage:      STAGE_MAP[(row.stage || "new").toLowerCase()] || "NEW",
            score:      isNaN(+row.score) ? 0 : Math.min(100, Math.max(0, +row.score)),
            skills:     row.skills
              ? (Array.isArray(row.skills) ? row.skills : String(row.skills).split(";").map(s => s.trim()).filter(Boolean))
              : [],
          },
        });
        results.created++;
      }
    } catch (err) {
      results.details.push({ name, email, status: "error", reason: err.message });
      continue;
    }

    // 2. AI Screen
    const aiResult = await aiScreenCandidate({
      name:       candidate.name,
      appliedFor: candidate.appliedFor,
      skills:     candidate.skills,
      location:   candidate.location,
    });

    // Save screening result & update candidate score
    await prisma.screening.create({
      data: {
        matchScore:  aiResult.score,
        insights:    [],
        parsedData:  { name: candidate.name, summary: aiResult.summary, skills: aiResult.skills },
        interviewQs: [],
        candidateId: candidate.id,
        userId:      userId || null,
      },
    });

    await prisma.candidate.update({
      where: { id: candidate.id },
      data: {
        score:   aiResult.score,
        stage:   "SCREENED",
        summary: aiResult.summary || null,
        skills:  aiResult.skills.length > 0 ? aiResult.skills : candidate.skills,
      },
    });

    results.screened++;

    const detail = { name, email, score: aiResult.score, shortlisted: false, emailed: false };

    // 3. Email if score >= threshold
    if (aiResult.score >= minScore) {
      results.shortlisted++;
      detail.shortlisted = true;

      if (sendEmails) {
        const sent = await sendShortlistEmail({
          candidateEmail: candidate.email,
          candidateName:  candidate.name,
          score:          aiResult.score,
          companyName:    recruiter?.company || "HireOS",
        });
        if (sent) { results.emailed++; detail.emailed = true; }
      }
    }

    results.details.push(detail);
  }

  return results;
}
