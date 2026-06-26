// src/modules/candidates/candidates.controller.js  (REPLACE EXISTING FILE)
//
// FIX: Pass req.user.id to listCandidates and getCandidate for data-isolation.
//
import * as candidatesService from "./candidates.service.js";
import { bulkImportAndScreen } from "./bulk-screen.service.js";

function handleError(res, err) {
  return res.status(err.status || 500).json({ error: err.message || "Internal server error" });
}

export async function listCandidates(req, res) {
  try {
    const { search, stage, minScore, jobId, page = 1, limit = 20 } = req.query;
    const result = await candidatesService.listCandidates(
      { search, stage, minScore, jobId, page: +page, limit: +limit },
      req.user.id   // ← NEW
    );
    res.json(result);
  } catch (err) {
    handleError(res, err);
  }
}

export async function getCandidate(req, res) {
  try {
    const candidate = await candidatesService.getCandidate(req.params.id, req.user.id); // ← NEW
    res.json(candidate);
  } catch (err) {
    handleError(res, err);
  }
}

export async function createCandidate(req, res) {
  try {
    const candidate = await candidatesService.createCandidate(req.body);
    res.status(201).json(candidate);
  } catch (err) {
    handleError(res, err);
  }
}

export async function updateCandidate(req, res) {
  try {
    const candidate = await candidatesService.updateCandidate(req.params.id, req.body);
    res.json(candidate);
  } catch (err) {
    handleError(res, err);
  }
}

export async function deleteCandidate(req, res) {
  try {
    const result = await candidatesService.deleteCandidate(req.params.id);
    res.json(result);
  } catch (err) {
    handleError(res, err);
  }
}

export async function updateStage(req, res) {
  try {
    const { stage } = req.body;
    if (!stage) return res.status(400).json({ error: "stage is required" });
    const candidate = await candidatesService.updateStage(req.params.id, stage);
    res.json(candidate);
  } catch (err) {
    handleError(res, err);
  }
}

export async function bulkImportCandidates(req, res) {
  try {
    const rows = req.body.candidates;
    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ error: "candidates array required" });
    }

    // LDoS prevention: hard limit on bulk import size
    const MAX_ROWS = 500;
    if (rows.length > MAX_ROWS) {
      return res.status(400).json({ error: `Maximum ${MAX_ROWS} candidates per import. You sent ${rows.length}.` });
    }
    // Validate & sanitize each row
    const STAGE_MAP = {
      new: "NEW", screened: "SCREENED", interview: "INTERVIEW",
      offer: "OFFER", hired: "HIRED", rejected: "REJECTED",
    };
    const clean = rows.map((r) => ({
      name:       String(r.name       || "").trim(),
      email:      String(r.email      || "").trim().toLowerCase(),
      phone:      r.phone      ? String(r.phone).trim()    : null,
      location:   r.location   ? String(r.location).trim() : null,
      appliedFor: String(r.appliedFor || r.applied_for || "").trim(),
      stage:      "NEW",   // always start fresh
      score:      0,       // set only after actual AI resume screening
      skills:     [],      // populated after screening
    })).filter((r) => r.name && r.email);

    if (clean.length === 0) {
      return res.status(400).json({ error: "No valid rows found. name and email are required." });
    }

    const result = await candidatesService.bulkCreateCandidates(clean, req.user.id);
    res.status(201).json(result);
  } catch (err) {
    handleError(res, err);
  }
}

export async function bulkImportAndScreenCandidates(req, res) {
  try {
    const { candidates, minScore = 70, sendEmails = true } = req.body;
    if (!Array.isArray(candidates) || candidates.length === 0) {
      return res.status(400).json({ error: "candidates array required" });
    }
    const result = await bulkImportAndScreen({
      rows: candidates,
      minScore: +minScore,
      sendEmails,
      userId: req.user.id,
    });
    res.status(201).json(result);
  } catch (err) {
    handleError(res, err);
  }
}

export async function getRecommendations(req, res) {
  try {
    const results = await candidatesService.getRecommendations(
      req.params.id,
      req.user?.id,
    );
    res.json({ recommendations: results });
  } catch (err) {
    handleError(res, err);
  }
}
