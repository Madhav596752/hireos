// src/api/auth.js
import api from "./client.js";

export const authApi = {
  login: (email, password) => api.post("/auth/login", { email, password }),
  register: (data) => api.post("/auth/register", data),
  getMe: () => api.get("/auth/me"),
  updateProfile: (data) => api.patch("/auth/me", data),
  changePassword: (data) => api.post("/auth/change-password", data),
};
