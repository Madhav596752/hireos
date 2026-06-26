// src/modules/screening/screening.controller.js
import * as screeningService from "./screening.service.js";
import pdfParse from "pdf-parse/lib/pdf-parse.js";
import fetch from "node-fetch";

function handleError(res, err) {
  console.error("[Screening Error]", err);
  return res.status(err.status || 500).json({ error: err.message || "Internal server error" });
}

/**
 * POST /api/screening/screen
 * Accepts: multipart/form-data with { resume (PDF), jobDescription, candidateId, jobId }
 */
export async function screenResume(req, res) {
  try {
    const { candidateId, jobId, jobDescription } = req.body;

    if (!candidateId) return res.status(400).json({ error: "candidateId is required" });

    let resumeText = req.body.resumeText || "";

    // If PDF uploaded via Cloudinary, fetch and extract text
    if (req.file?.path) {
      let pdfBuffer;
      try {
        pdfBuffer = await fetch(req.file.path).then((r) => r.arrayBuffer());
        pdfBuffer = Buffer.from(pdfBuffer);
      } catch (fetchErr) {
        return res.status(400).json({ error: "PDF file fetch nahi ho saka. Dobara upload karo." });
      }

      try {
        const data = await pdfParse(pdfBuffer);
        resumeText = data.text?.trim();
        if (!resumeText) {
          return res.status(400).json({
            error: "PDF mein text nahi mila. Scanned/image PDF hai toh plain text paste karo.",
          });
        }
      } catch (pdfErr) {
        console.error("[PDF Parse Error]", pdfErr.message);
        // PDF corrupt ya invalid — user ko clear message
        return res.status(400).json({
          error:
            "PDF read nahi ho saka (corrupt ya password protected ho sakta hai). Dusra PDF try karo ya resume text directly paste karo.",
        });
      }
    }

    if (!resumeText) {
      return res.status(400).json({ error: "No resume text or PDF provided" });
    }

    const result = await screeningService.screenResume({
      resumeText,
      jobDescription,
      candidateId,
      jobId,
      userId: req.user.id,
    });

    res.status(201).json(result);
  } catch (err) {
    handleError(res, err);
  }
}

export async function generateInterviewQuestions(req, res) {
  try {
    const { jobTitle, skills, experienceSummary } = req.body;
    if (!jobTitle) return res.status(400).json({ error: "jobTitle is required" });

    const questions = await screeningService.generateInterviewQuestions({
      jobTitle,
      skills: skills || [],
      experienceSummary: experienceSummary || "",
    });
    res.json({ questions });
  } catch (err) {
    handleError(res, err);
  }
}

export async function listScreenings(req, res) {
  try {
    const screenings = await screeningService.listScreenings(req.params.candidateId);
    res.json(screenings);
  } catch (err) {
    handleError(res, err);
  }
}

export async function getScreening(req, res) {
  try {
    const screening = await screeningService.getScreening(req.params.id);
    res.json(screening);
  } catch (err) {
    handleError(res, err);
  }
}