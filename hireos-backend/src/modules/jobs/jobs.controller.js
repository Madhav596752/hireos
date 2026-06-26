// src/modules/jobs/jobs.controller.js  (REPLACE EXISTING FILE)
//
// FIX: Pass req.user.id to listJobs and getJob for data-isolation enforcement.
//
import * as jobsService from "./jobs.service.js";

function handleError(res, err) {
  return res.status(err.status || 500).json({ error: err.message || "Internal server error" });
}

export async function listJobs(req, res) {
  try {
    const { search = "", status = "all", department = "all", page = 1, limit = 20 } = req.query;
    // Pass the authenticated user's id so the service can scope by company
    const result = await jobsService.listJobs(
      { search, status, department, page: +page, limit: +limit },
      req.user.id   // ← NEW
    );
    res.json(result);
  } catch (err) {
    handleError(res, err);
  }
}

export async function getJob(req, res) {
  try {
    const job = await jobsService.getJob(req.params.id, req.user.id); // ← NEW
    res.json(job);
  } catch (err) {
    handleError(res, err);
  }
}

export async function createJob(req, res) {
  try {
    const job = await jobsService.createJob(req.body, req.user.id);
    res.status(201).json(job);
  } catch (err) {
    handleError(res, err);
  }
}

export async function updateJob(req, res) {
  try {
    const job = await jobsService.updateJob(req.params.id, req.body, req.user.id, req.user.role);
    res.json(job);
  } catch (err) {
    handleError(res, err);
  }
}

export async function deleteJob(req, res) {
  try {
    const result = await jobsService.deleteJob(req.params.id, req.user.id, req.user.role);
    res.json(result);
  } catch (err) {
    handleError(res, err);
  }
}
