// src/api/jobs.js
import api from "./client.js";

export const jobsApi = {
  list: (params) => api.get("/jobs", { params }),
  get: (id) => api.get(`/jobs/${id}`),
  create: (data) => api.post("/jobs", data),
  update: (id, data) => api.patch(`/jobs/${id}`, data),
  delete: (id) => api.delete(`/jobs/${id}`),
};
