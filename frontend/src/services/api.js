import axios from "axios";

const BASE_URL = "http://localhost:8000";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      error.message ||
      "An unexpected error occurred";
    return Promise.reject(new Error(message));
  }
);

export const ticketService = {
  getTickets: (params) => api.get("/tickets", { params }),
  getTicket: (id) => api.get(`/tickets/${id}`),
  createTicket: (data) => api.post("/tickets", data),
  updateTicket: (id, data) => api.put(`/tickets/${id}`, data),
  deleteTicket: (id) => api.delete(`/tickets/${id}`),
  searchTickets: (params) => api.get("/search", { params }),
  getStats: () => api.get("/tickets/stats"),
};

export default api;
