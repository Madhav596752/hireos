// src/modules/dashboard/dashboard.controller.js  (REPLACE EXISTING FILE)
//
// FIX 1: getDashboardStats — all counts now scoped to the requester's company.
// FIX 2: getSchedule — interviews now scoped to the requester's company.
// FIX 3: createInterview / updateInterview — removed from here entirely.
//        The /api/interviews module handles these (with email + isolation).
//        Dashboard routes for create/update now proxy to the interviews service
//        so the Scheduler frontend keeps working without any changes.
//
import prisma from "../../config/db.js";
import * as interviewsService from "../interviews/interviews.service.js";

function handleError(res, err) {
  console.error("[Dashboard Error]", err);
  return res.status(err.status || 500).json({ error: err.message || "Internal server error" });
}

// ── Helper: build company-level Prisma filters ─────────────────────────────
async function getCompanyFilters(userId) {
  const user = await prisma.user.findUnique({
    where:  { id: userId },
    select: { company: true, role: true },
  });

  if (user.role === "ADMIN" || !user.company) {
    // ADMIN sees everything; users with no company set see everything (backward-compat)
    return { candidateFilter: {}, jobFilter: {}, interviewFilter: {}, company: null };
  }

  const companyOwnerIds = await prisma.user
    .findMany({ where: { company: user.company }, select: { id: true } })
    .then((users) => users.map((u) => u.id));

  return {
    // Candidates whose linked job is owned by someone in this company
    candidateFilter: {
      OR: [
        { job: { ownerId: { in: companyOwnerIds } } },
        { jobId: null, screenings: { some: { userId: { in: companyOwnerIds } } } },
      ],
    },
    // Jobs owned by someone in this company
    jobFilter: { ownerId: { in: companyOwnerIds } },
    // Interviews scheduled by someone in this company
    interviewFilter: { recruiterId: { in: companyOwnerIds } },
    company: user.company,
  };
}

export async function getDashboardStats(req, res) {
  try {
    const { candidateFilter, jobFilter, interviewFilter } = await getCompanyFilters(req.user.id);

    const quarterStart = new Date(
      new Date().getFullYear(),
      Math.floor(new Date().getMonth() / 3) * 3,
      1
    );

    const [
      totalCandidates,
      activeInterviews,
      hiredThisQuarter,
      totalJobs,
      recentCandidates,
      stageCounts,
      topJobs,
    ] = await Promise.all([
      prisma.candidate.count({ where: candidateFilter }),

      prisma.interview.count({
        where: { ...interviewFilter, status: "scheduled" },
      }),

      prisma.candidate.count({
        where: {
          ...candidateFilter,
          stage:     "HIRED",
          updatedAt: { gte: quarterStart },
        },
      }),

      prisma.job.count({ where: { ...jobFilter, status: "OPEN" } }),

      prisma.candidate.findMany({
        where:   candidateFilter,
        orderBy: { createdAt: "desc" },
        take:    8,
      }),

      prisma.candidate.groupBy({
        by:    ["stage"],
        where: candidateFilter,
        _count: { stage: true },
      }),

      prisma.job.findMany({
        where:   { ...jobFilter, status: "OPEN" },
        select:  { id: true, title: true, department: true, applicants: true, posted: true },
        orderBy: { applicants: "desc" },
        take:    5,
      }),
    ]);

    const stageMap = Object.fromEntries(
      stageCounts.map((s) => [s.stage, s._count.stage])
    );

    res.json({
      kpis: [
        { label: "Total Applicants",   value: String(totalCandidates),  delta: "", trend: "up" },
        { label: "Active Interviews",  value: String(activeInterviews), delta: "", trend: "up" },
        { label: "Hires this Quarter", value: String(hiredThisQuarter), delta: "", trend: "up" },
        { label: "Open Jobs",          value: String(totalJobs),        delta: "", trend: "up" },
      ],
      pipeline: {
        new:       stageMap.NEW       || 0,
        screened:  stageMap.SCREENED  || 0,
        interview: stageMap.INTERVIEW || 0,
        offer:     stageMap.OFFER     || 0,
        hired:     stageMap.HIRED     || 0,
        rejected:  stageMap.REJECTED  || 0,
      },
      recentActivity: recentCandidates.map((c) => ({
        id: c.id, name: c.name, stage: c.stage, score: c.score,
        appliedFor: c.appliedFor, createdAt: c.createdAt, avatarUrl: c.avatarUrl,
      })),
      topJobs,
    });
  } catch (err) {
    handleError(res, err);
  }
}

export async function getSchedule(req, res) {
  try {
    const { interviewFilter } = await getCompanyFilters(req.user.id);

    const interviews = await prisma.interview.findMany({
      where: {
        ...interviewFilter,
        date: { gte: new Date() },
      },
      include: {
        candidate: { select: { id: true, name: true, avatarUrl: true, appliedFor: true } },
        recruiter: { select: { id: true, name: true, avatarUrl: true } },
      },
      orderBy: { date: "asc" },
      take:    50,
    });

    res.json(interviews);
  } catch (err) {
    handleError(res, err);
  }
}

// ── Proxy to interviews service (keeps Scheduler.jsx working) ──────────────

export async function createInterview(req, res) {
  try {
    const { candidateId, title, date, duration, type, notes, meetingUrl } = req.body;
    if (!candidateId || !date || !title)
      return res.status(400).json({ error: "candidateId, title, date required" });

    // Delegates to interviews.service which also sends the email + enforces isolation
    const interview = await interviewsService.scheduleInterview(
      { candidateId, title, date, duration, type, notes, meetingUrl },
      req.user.id
    );

    res.status(201).json(interview);
  } catch (err) {
    handleError(res, err);
  }
}

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
