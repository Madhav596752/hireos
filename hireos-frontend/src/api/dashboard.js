// src/api/dashboard.js
import api from "./client.js";

export const dashboardApi = {
  getStats: () => api.get("/dashboard/stats"),
  getSchedule: () => api.get("/dashboard/schedule"),
  createInterview: (data) => api.post("/dashboard/interviews", data),
  updateInterview: (id, data) => api.patch(`/dashboard/interviews/${id}`, data),
};
