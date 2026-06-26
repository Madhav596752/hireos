// src/modules/interviews/interviews.service.js
import prisma from "../../config/db.js";

// ── Mailer ─────────────────────────────────────────────────────────────────
async function sendInterviewInvite({ candidateEmail, candidateName, interview, recruiterName }) {
  if (!process.env.BREVO_API_KEY) {
    console.warn("[Mailer] BREVO_API_KEY not set — skipping email.");
    return;
  }

  const dateStr = new Date(interview.date).toLocaleString("en-IN", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  });

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden">
      <div style="background:#6366f1;padding:24px 32px">
        <h1 style="color:#fff;margin:0;font-size:22px">Interview Invitation</h1>
      </div>
      <div style="padding:32px">
        <p style="font-size:16px;color:#374151">Hi <strong>${candidateName}</strong>,</p>
        <p style="color:#6b7280">You have been invited for an interview. Here are the details:</p>

        <table style="width:100%;border-collapse:collapse;margin:20px 0">
          <tr>
            <td style="padding:10px;font-weight:bold;color:#374151;width:40%;border-bottom:1px solid #f3f4f6">Role</td>
            <td style="padding:10px;color:#6b7280;border-bottom:1px solid #f3f4f6">${interview.title}</td>
          </tr>
          <tr>
            <td style="padding:10px;font-weight:bold;color:#374151;border-bottom:1px solid #f3f4f6">Date & Time</td>
            <td style="padding:10px;color:#6b7280;border-bottom:1px solid #f3f4f6">${dateStr}</td>
          </tr>
          <tr>
            <td style="padding:10px;font-weight:bold;color:#374151;border-bottom:1px solid #f3f4f6">Duration</td>
            <td style="padding:10px;color:#6b7280;border-bottom:1px solid #f3f4f6">${interview.duration} minutes</td>
          </tr>
          <tr>
            <td style="padding:10px;font-weight:bold;color:#374151;border-bottom:1px solid #f3f4f6">Type</td>
            <td style="padding:10px;color:#6b7280;border-bottom:1px solid #f3f4f6">${interview.type}</td>
          </tr>
          ${interview.meetingUrl ? `
          <tr>
            <td style="padding:10px;font-weight:bold;color:#374151">Meeting Link</td>
            <td style="padding:10px"><a href="${interview.meetingUrl}" style="color:#6366f1">${interview.meetingUrl}</a></td>
          </tr>` : ""}
        </table>

        ${interview.notes ? `<p style="color:#6b7280;font-style:italic">Notes: ${interview.notes}</p>` : ""}

        <p style="color:#6b7280;margin-top:24px">Best regards,<br/><strong>${recruiterName}</strong></p>
      </div>
      <div style="background:#f9fafb;padding:16px 32px;text-align:center">
        <p style="color:#9ca3af;font-size:12px;margin:0">This is an automated message from HireOS. Please do not reply.</p>
      </div>
    </div>
  `;

  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: { name: "HireOS Recruitment", email: process.env.BREVO_SENDER_EMAIL },
        to: [{ email: candidateEmail, name: candidateName }],
        subject: `Interview Invitation: ${interview.title}`,
        htmlContent: html,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(JSON.stringify(err));
    }
    console.log(`[Mailer] Interview invite sent to ${candidateEmail}`);
  } catch (err) {
    console.error("[Mailer] Failed to send interview invite:", err.message);
  }
}

// ── CRUD ───────────────────────────────────────────────────────────────────

export async function scheduleInterview(data, recruiterId) {
  const { candidateId, title, date, duration, type, notes, meetingUrl } = data;

  const candidate = await prisma.candidate.findUnique({
    where: { id: candidateId },
    include: {
      job: {
        include: { owner: { select: { company: true } } },
      },
    },
  });
  if (!candidate) throw { status: 404, message: "Candidate not found" };

  const recruiter = await prisma.user.findUnique({
    where: { id: recruiterId },
    select: { name: true, email: true, company: true },
  });

  const jobOwnerCompany = candidate.job?.owner?.company;
  if (
    recruiter.company &&
    jobOwnerCompany &&
    recruiter.company !== jobOwnerCompany
  ) {
    throw { status: 403, message: "You can only schedule interviews for candidates in your company." };
  }

  const interview = await prisma.interview.create({
    data: {
      candidateId,
      recruiterId,
      title,
      date:       new Date(date),
      duration:   duration || 60,
      type:       type     || "Video Call",
      notes:      notes    || null,
      meetingUrl: meetingUrl || null,
      status:     "scheduled",
    },
    include: {
      candidate: { select: { name: true, email: true } },
      recruiter: { select: { name: true, email: true } },
    },
  });

  await prisma.candidate.update({
    where: { id: candidateId },
    data:  { stage: "INTERVIEW" },
  });

  sendInterviewInvite({
    candidateEmail: interview.candidate.email,
    candidateName:  interview.candidate.name,
    interview,
    recruiterName:  interview.recruiter.name,
  });

  return interview;
}

export async function listInterviews({ recruiterId, candidateId, status } = {}) {
  const recruiter = await prisma.user.findUnique({
    where:  { id: recruiterId },
    select: { company: true, role: true },
  });

  const companyFilter =
    recruiter.role !== "ADMIN" && recruiter.company
      ? { recruiter: { company: recruiter.company } }
      : {};

  return prisma.interview.findMany({
    where: {
      ...companyFilter,
      ...(candidateId ? { candidateId } : {}),
      ...(status      ? { status }      : {}),
    },
    include: {
      candidate: { select: { id: true, name: true, email: true, appliedFor: true } },
      recruiter: { select: { id: true, name: true, avatarUrl: true } },
    },
    orderBy: { date: "asc" },
  });
}

export async function getInterview(id, recruiterId) {
  const interview = await prisma.interview.findUnique({
    where: { id },
    include: {
      candidate: { select: { id: true, name: true, email: true, appliedFor: true } },
      recruiter: { select: { id: true, name: true, email: true, company: true } },
    },
  });
  if (!interview) throw { status: 404, message: "Interview not found" };

  const requester = await prisma.user.findUnique({
    where:  { id: recruiterId },
    select: { company: true, role: true },
  });

  if (
    requester.role !== "ADMIN" &&
    requester.company &&
    interview.recruiter.company !== requester.company
  ) {
    throw { status: 403, message: "Access denied" };
  }

  return interview;
}

export async function updateInterview(id, data, recruiterId) {
  const existing = await prisma.interview.findUnique({
    where: { id },
    include: { recruiter: { select: { company: true, role: true } } },
  });
  if (!existing) throw { status: 404, message: "Interview not found" };

  const requester = await prisma.user.findUnique({
    where:  { id: recruiterId },
    select: { company: true, role: true, name: true },
  });

  if (
    requester.role !== "ADMIN" &&
    requester.company &&
    existing.recruiter.company !== requester.company
  ) {
    throw { status: 403, message: "Not authorised to update this interview" };
  }

  const dateChanged = data.date && data.date !== existing.date.toISOString();

  const updated = await prisma.interview.update({
    where: { id },
    data: {
      ...(data.title      ? { title:      data.title }           : {}),
      ...(data.date       ? { date:       new Date(data.date) }  : {}),
      ...(data.duration   ? { duration:   data.duration }        : {}),
      ...(data.type       ? { type:       data.type }            : {}),
      ...(data.notes      !== undefined ? { notes: data.notes }  : {}),
      ...(data.meetingUrl !== undefined ? { meetingUrl: data.meetingUrl } : {}),
      ...(data.status     ? { status:     data.status }          : {}),
    },
    include: {
      candidate: { select: { name: true, email: true } },
      recruiter: { select: { name: true, email: true } },
    },
  });

  if (dateChanged) {
    sendInterviewInvite({
      candidateEmail: updated.candidate.email,
      candidateName:  updated.candidate.name,
      interview:      updated,
      recruiterName:  updated.recruiter.name,
    });
  }

  return updated;
}

export async function deleteInterview(id, recruiterId) {
  const existing = await prisma.interview.findUnique({
    where: { id },
    include: { recruiter: { select: { company: true, role: true } } },
  });
  if (!existing) throw { status: 404, message: "Interview not found" };

  const requester = await prisma.user.findUnique({
    where:  { id: recruiterId },
    select: { company: true, role: true },
  });

  if (
    requester.role !== "ADMIN" &&
    requester.company &&
    existing.recruiter.company !== requester.company
  ) {
    throw { status: 403, message: "Not authorised" };
  }

  await prisma.interview.delete({ where: { id } });
  return { message: "Interview deleted" };
}
