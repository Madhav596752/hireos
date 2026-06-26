// src/modules/candidates/candidates.service.js  (REPLACE EXISTING FILE)
//
// FIX: Data isolation — listCandidates and getCandidate are scoped to the
// requester's company. Candidates linked to a job whose owner is a different
// company are not visible.
//
import prisma from "../../config/db.js";

const STAGE_MAP = {
  new: "NEW", screened: "SCREENED", interview: "INTERVIEW",
  offer: "OFFER", hired: "HIRED", rejected: "REJECTED",
};

export async function listCandidates(
  { search, stage, minScore = 0, jobId, page = 1, limit = 20 },
  requesterId   // ← NEW param
) {
  // Determine company scope
  const requester = requesterId
    ? await prisma.user.findUnique({
        where:  { id: requesterId },
        select: { company: true, role: true },
      })
    : null;

  // Non-ADMIN users only see candidates whose linked job belongs to their company.
  // Candidates with no linked job are visible only within the same company scope.
  const companyFilter =
    requester && requester.role !== "ADMIN" && requester.company
      ? {
          OR: [
            { job: { owner: { company: requester.company } } },
            // Candidates not yet linked to any job — show only if they were
            // created via a screening by this company (via userId on Screening)
            {
              jobId: null,
              screenings: {
                some: {
                  user: { company: requester.company },
                },
              },
            },
          ],
        }
      : {};

  const where = {
    AND: [
      companyFilter,
      search
        ? {
            OR: [
              { name:       { contains: search, mode: "insensitive" } },
              { email:      { contains: search, mode: "insensitive" } },
              { appliedFor: { contains: search, mode: "insensitive" } },
            ],
          }
        : {},
      stage && stage !== "all"
        ? { stage: STAGE_MAP[stage.toLowerCase()] || stage.toUpperCase() }
        : {},
      minScore ? { score: { gte: +minScore } } : {},
      jobId    ? { jobId }                      : {},
    ],
  };

  const [candidates, total] = await Promise.all([
    prisma.candidate.findMany({
      where,
      orderBy: { score: "desc" },
      skip:  (page - 1) * limit,
      take:  limit,
    }),
    prisma.candidate.count({ where }),
  ]);

  return { candidates, total, page, pages: Math.ceil(total / limit) };
}

export async function getCandidate(id, requesterId) {
  const candidate = await prisma.candidate.findUnique({
    where: { id },
    include: {
      screenings: { orderBy: { createdAt: "desc" }, take: 1 },
      interviews: {
        orderBy: { date: "asc" },
        include: { recruiter: { select: { name: true, email: true } } },
      },
      job: {
        select: {
          id: true, title: true, department: true,
          owner: { select: { company: true } },
        },
      },
    },
  });
  if (!candidate) throw { status: 404, message: "Candidate not found" };

  // Isolation guard
  if (requesterId) {
    const requester = await prisma.user.findUnique({
      where:  { id: requesterId },
      select: { company: true, role: true },
    });

    if (
      requester.role !== "ADMIN" &&
      requester.company &&
      candidate.job?.owner?.company &&
      candidate.job.owner.company !== requester.company
    ) {
      throw { status: 403, message: "Access denied" };
    }
  }

  return candidate;
}

export async function createCandidate(data) {
  return prisma.candidate.create({ data });
}

// Bulk import from CSV — skips rows only if same email exists within same company
export async function bulkCreateCandidates(rows, userId) {
  const results = { created: 0, skipped: 0, errors: [] };

  // Get importer's company for scoped duplicate check
  const importer = userId
    ? await prisma.user.findUnique({ where: { id: userId }, select: { company: true } })
    : null;
  const importerCompany = importer?.company || null;

  for (const row of rows) {
    try {
      let existing = null;

      if (importerCompany) {
        // Check: same email + linked to a job owned by same company
        existing = await prisma.candidate.findFirst({
          where: {
            email: row.email,
            job: { owner: { company: importerCompany } },
          },
        });
        // Also check: same email + screened by someone in same company
        if (!existing) {
          existing = await prisma.candidate.findFirst({
            where: {
              email: row.email,
              screenings: { some: { user: { company: importerCompany } } },
            },
          });
        }
      } else {
        // No company context — global email check
        existing = await prisma.candidate.findFirst({ where: { email: row.email } });
      }

      if (existing) {
        results.skipped++;
        continue;
      }
      await prisma.candidate.create({ data: row });

      // Create a minimal screening record so this candidate appears in company-scoped list
      // (listCandidates filter requires either a job link OR a screening by company user)
      if (userId) {
        const created = await prisma.candidate.findFirst({ where: { email: row.email }, select: { id: true } });
        if (created) {
          await prisma.screening.create({
            data: {
              candidateId: created.id,
              userId,
              matchScore:  0, // No AI screening done yet
              insights:    [],
              parsedData:  { source: "csv_import", name: row.name },
              interviewQs: [],
            },
          });
        }
      }

      results.created++;
    } catch (err) {
      results.errors.push({ email: row.email || "unknown", reason: err.message });
    }
  }

  return results;
}

export async function updateCandidate(id, data) {
  const candidate = await prisma.candidate.findUnique({ where: { id } });
  if (!candidate) throw { status: 404, message: "Candidate not found" };

  if (data.stage) {
    data.stage = STAGE_MAP[data.stage.toLowerCase()] || data.stage.toUpperCase();
  }

  return prisma.candidate.update({ where: { id }, data });
}

export async function deleteCandidate(id) {
  const candidate = await prisma.candidate.findUnique({ where: { id } });
  if (!candidate) throw { status: 404, message: "Candidate not found" };
  await prisma.candidate.delete({ where: { id } });
  return { message: "Candidate deleted" };
}

export async function updateStage(id, stage) {
  const normStage = STAGE_MAP[stage.toLowerCase()] || stage.toUpperCase();
  return prisma.candidate.update({ where: { id }, data: { stage: normStage } });
}

export async function semanticSearch(embedding, limit = 10) {
  const results = await prisma.$queryRaw`
    SELECT id, name, "appliedFor", score, stage, skills, location,
           1 - (embedding <=> ${embedding}::vector) AS similarity
    FROM candidates
    WHERE embedding IS NOT NULL
    ORDER BY embedding <=> ${embedding}::vector
    LIMIT ${limit}
  `;
  return results;
}

// Candidate Recommendation Engine
// Finds similar candidates based on role + skill overlap, scored by match quality
export async function getRecommendations(candidateId, requesterId, limit = 5) {
  // Get the source candidate
  const source = await prisma.candidate.findUnique({
    where: { id: candidateId },
    select: { id: true, appliedFor: true, skills: true, stage: true },
  });
  if (!source) throw { status: 404, message: "Candidate not found" };

  // Get requester's company scope (same isolation as listCandidates)
  const requester = requesterId
    ? await prisma.user.findUnique({ where: { id: requesterId }, select: { company: true, role: true } })
    : null;

  const companyFilter =
    requester && requester.role !== "ADMIN" && requester.company
      ? {
          OR: [
            { job: { owner: { company: requester.company } } },
            { jobId: null, screenings: { some: { user: { company: requester.company } } } },
          ],
        }
      : {};

  // Fetch all other candidates in same company scope
  const pool = await prisma.candidate.findMany({
    where: { AND: [companyFilter, { id: { not: candidateId } }] },
    select: { id: true, name: true, appliedFor: true, skills: true, score: true, stage: true, location: true, avatarUrl: true },
  });

  if (pool.length === 0) return [];

  const sourceRole   = (source.appliedFor || "").toLowerCase();
  const sourceSkills = (source.skills || []).map((s) => s.toLowerCase());

  // Score each candidate by similarity
  const scored = pool.map((c) => {
    const cRole   = (c.appliedFor || "").toLowerCase();
    const cSkills = (c.skills || []).map((s) => s.toLowerCase());

    // Role match — exact = 50pts, partial word overlap = 25pts
    const roleExact   = cRole === sourceRole ? 50 : 0;
    const rolePartial = !roleExact && (cRole.includes(sourceRole) || sourceRole.includes(cRole)) ? 25 : 0;
    const roleScore   = roleExact || rolePartial;

    // Skill overlap — each common skill = 10pts, max 50pts
    const commonSkills = cSkills.filter((s) => sourceSkills.includes(s));
    const skillScore   = Math.min(commonSkills.length * 10, 50);

    const similarity = roleScore + skillScore;
    return { ...c, similarity, commonSkills };
  });

  // Return top N with similarity > 0, sorted by similarity desc then score desc
  return scored
    .filter((c) => c.similarity > 0)
    .sort((a, b) => b.similarity - a.similarity || b.score - a.score)
    .slice(0, limit);
}
