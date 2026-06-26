// src/modules/interviews/interviews.controller.js
import * as interviewsService from "./interviews.service.js";

function handleError(res, err) {
  console.error("[Interviews Error]", err);
  return res.status(err.status || 500).json({ error: err.message || "Internal server error" });
}

/** POST /api/interviews */
export async function scheduleInterview(req, res) {
  try {
    const { candidateId, title, date, duration, type, notes, meetingUrl } = req.body;
    if (!candidateId) return res.status(400).json({ error: "candidateId is required" });
    if (!title)       return res.status(400).json({ error: "title is required" });
    if (!date)        return res.status(400).json({ error: "date is required" });

    const interview = await interviewsService.scheduleInterview(
      { candidateId, title, date, duration, type, notes, meetingUrl },
      req.user.id
    );
    res.status(201).json(interview);
  } catch (err) {
    handleError(res, err);
  }
}

/** GET /api/interviews */
export async function listInterviews(req, res) {
  try {
    const { candidateId, status } = req.query;
    const interviews = await interviewsService.listInterviews({
      recruiterId: req.user.id,
      candidateId,
      status,
    });
    res.json(interviews);
  } catch (err) {
    handleError(res, err);
  }
}

/** GET /api/interviews/:id */
export async function getInterview(req, res) {
  try {
    const interview = await interviewsService.getInterview(req.params.id, req.user.id);
    res.json(interview);
  } catch (err) {
    handleError(res, err);
  }
}

/** PATCH /api/interviews/:id */
export async function updateInterview(req, res) {
  try {
    const interview = await interviewsService.updateInterview(
      req.params.id,
      req.body,
      req.user.id
    );
    res.json(interview);
  } catch (err) {
    handleError(res, err);
  }
}

/** DELETE /api/interviews/:id */
export async function deleteInterview(req, res) {
  try {
    const result = await interviewsService.deleteInterview(req.params.id, req.user.id);
    res.json(result);
  } catch (err) {
    handleError(res, err);
  }
}
