// src/api/messages.js
import api from "./client.js";

export const messagesApi = {
  getConversations: () => api.get("/messages/conversations"),
  getTeam: () => api.get("/messages/team"),
  getMessages: (withUserId) => api.get(`/messages/${withUserId}`),
  sendMessage: (receiverId, content) => api.post("/messages", { receiverId, content }),
};
