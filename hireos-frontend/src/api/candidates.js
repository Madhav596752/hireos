// src/api/candidates.js
import api from "./client.js";

export const candidatesApi = {
  list: (params) => api.get("/candidates", { params }),
  get: (id) => api.get(`/candidates/${id}`),
  create: (data) => api.post("/candidates", data),
  getRecommendations: (id) => api.get(`/candidates/${id}/recommendations`),
  bulkImport: (candidates) => api.post("/candidates/bulk-import", { candidates }),
  bulkImportAndScreen: (candidates, minScore, sendEmails) =>
    api.post("/candidates/bulk-import-and-screen", { candidates, minScore, sendEmails }),
  update: (id, data) => api.patch(`/candidates/${id}`, data),
  updateStage: (id, stage) => api.patch(`/candidates/${id}/stage`, { stage }),
  delete: (id) => api.delete(`/candidates/${id}`),
};
