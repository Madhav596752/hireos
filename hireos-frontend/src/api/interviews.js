// src/api/interviews.js  (NEW FILE)
import api from "./client.js";

export const interviewsApi = {
  /**
   * Schedule a new interview.
   * Backend automatically sends an email invite to the candidate.
   */
  schedule: (data) => api.post("/interviews", data),

  /** List interviews (company-scoped on the backend). */
  list: (params) => api.get("/interviews", { params }),

  /** Get a single interview. */
  get: (id) => api.get(`/interviews/${id}`),

  /**
   * Update an interview (reschedule, change status, add notes).
   * If the date changes, backend re-sends the invite email.
   */
  update: (id, data) => api.patch(`/interviews/${id}`, data),

  /** Delete / cancel an interview. */
  delete: (id) => api.delete(`/interviews/${id}`),
};
