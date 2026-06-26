// src/modules/jobs/jobs.service.js  (REPLACE EXISTING FILE)
//
// FIX: Data isolation — listJobs now scopes results to the requester's company.
// A Recruiter/HR from Company A cannot see jobs created by Company B.
// ADMIN role bypasses the filter and sees all jobs.
//
import prisma from "../../config/db.js";

export async function listJobs(
  { search = "", status = "all", department = "all", page = 1, limit = 20 } = {},
  requesterId   // the authenticated user's id
) {
  // Fetch requester to determine company scope
  const requester = await prisma.user.findUnique({
    where:  { id: requesterId },
    select: { company: true, role: true },
  });

  // Company filter: non-ADMIN users only see jobs whose owner shares the same company
  const companyFilter =
    requester.role !== "ADMIN" && requester.company
      ? { owner: { company: requester.company } }
      : {};

  const where = {
    AND: [
      companyFilter,
      search
        ? {
            OR: [
              { title:      { contains: search, mode: "insensitive" } },
              { location:   { contains: search, mode: "insensitive" } },
              { department: { contains: search, mode: "insensitive" } },
            ],
          }
        : {},
      status !== "all"     ? { status: status.toUpperCase() }  : {},
      department !== "all" ? { department }                     : {},
    ],
  };

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where,
      include: { owner: { select: { id: true, name: true, avatarUrl: true } } },
      orderBy: { posted: "desc" },
      skip:  (page - 1) * limit,
      take:  limit,
    }),
    prisma.job.count({ where }),
  ]);

  return { jobs, total, page, pages: Math.ceil(total / limit) };
}

export async function getJob(id, requesterId) {
  const job = await prisma.job.findUnique({
    where: { id },
    include: {
      owner:      { select: { id: true, name: true, email: true, avatarUrl: true, company: true } },
      candidates: { take: 5, orderBy: { score: "desc" } },
    },
  });
  if (!job) throw { status: 404, message: "Job not found" };

  // Isolation guard
  if (requesterId) {
    const requester = await prisma.user.findUnique({
      where:  { id: requesterId },
      select: { company: true, role: true },
    });
    if (
      requester.role !== "ADMIN" &&
      requester.company &&
      job.owner.company !== requester.company
    ) {
      throw { status: 403, message: "Access denied" };
    }
  }

  return job;
}

export async function createJob(data, ownerId) {
  const job = await prisma.job.create({
    data: { ...data, ownerId, status: data.status?.toUpperCase() || "OPEN" },
    include: { owner: { select: { id: true, name: true, avatarUrl: true } } },
  });
  return job;
}

export async function updateJob(id, data, userId, userRole) {
  const job = await prisma.job.findUnique({ where: { id } });
  if (!job) throw { status: 404, message: "Job not found" };
  if (job.ownerId !== userId && userRole !== "ADMIN")
    throw { status: 403, message: "Not authorised" };

  return prisma.job.update({
    where: { id },
    data:  { ...data, ...(data.status ? { status: data.status.toUpperCase() } : {}) },
    include: { owner: { select: { id: true, name: true, avatarUrl: true } } },
  });
}

export async function deleteJob(id, userId, userRole) {
  const job = await prisma.job.findUnique({ where: { id } });
  if (!job) throw { status: 404, message: "Job not found" };
  if (job.ownerId !== userId && userRole !== "ADMIN")
    throw { status: 403, message: "Not authorised" };
  await prisma.job.delete({ where: { id } });
  return { message: "Job deleted" };
}
