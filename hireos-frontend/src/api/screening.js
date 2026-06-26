// src/api/screening.js
import api from "./client.js";

export const screeningApi = {
  /**
   * Screen a resume.
   * @param {File|null} resumeFile — PDF file object (optional if resumeText provided)
   * @param {string} resumeText — raw text fallback
   * @param {string} candidateId
   * @param {string} [jobId]
   * @param {string} [jobDescription]
   */
  screenResume: ({ resumeFile, resumeText, candidateId, jobId, jobDescription }) => {
    if (resumeFile) {
      const form = new FormData();
      form.append("resume", resumeFile);
      form.append("candidateId", candidateId);
      if (jobId) form.append("jobId", jobId);
      if (jobDescription) form.append("jobDescription", jobDescription);
      return api.postForm("/screening/screen", form);
    }
    return api.post("/screening/screen", { resumeText, candidateId, jobId, jobDescription });
  },

  generateQuestions: (data) => api.post("/screening/questions", data),

  getScreeningsForCandidate: (candidateId) =>
    api.get(`/screening/candidate/${candidateId}`),

  getScreening: (id) => api.get(`/screening/${id}`),
};
