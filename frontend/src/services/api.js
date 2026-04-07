import axios from 'axios';

const BASE_URL = "http://localhost:8080/api";

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// Attach JWT on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const originalRequest = err.config;
    if (err.response?.status === 401 && originalRequest.url !== '/auth/login') {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ─── AUTH ────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  verifyOtp: (data) => api.post("/auth/verify-otp", data),
  login: (data) => api.post("/auth/login", data),
  getProfile: () => api.get("/auth/me"),
};

// ─── CLUBS ───────────────────────────────────────────────────────────────────
export const clubsAPI = {
  getAll: (params) => api.get('/clubs', { params }),           // ?department=&category=
  getById: (id) => api.get(`/clubs/${id}`),
  join: (id) => api.post(`/clubs/${id}/join`),
  leave: (id) => api.post(`/clubs/${id}/leave`),
  getMembers: (id) => api.get(`/clubs/${id}/members`),
  getEvents: (id) => api.get(`/clubs/${id}/events`),
  update: (id, data) => api.put(`/clubs/${id}`, data),
};

// ─── EVENTS ──────────────────────────────────────────────────────────────────
export const eventsAPI = {
  getAll: (params) => api.get('/events', { params }),          // student: approved only
  getById: (id) => api.get(`/events/${id}`),
  create: (data) => api.post('/events', data),                 // club head
  update: (id, data) => api.put(`/events/${id}`, data),
  delete: (id) => api.delete(`/events/${id}`),
  approve: (id) => api.put(`/events/${id}/approve`),           // faculty
  reject: (id, reason) => api.put(`/events/${id}/reject`, { reason }),
  getPending: () => api.get('/events/pending'),               // faculty view
  register: (id) => api.post(`/events/${id}/register`),       // student
  unregister: (id) => api.delete(`/events/${id}/register`),
  checkClash: (id) => api.get(`/events/${id}/clash-check`),
  getRegistered: () => api.get('/events/my-registrations'),   // student
  getParticipants: (id) => api.get(`/events/${id}/participants`),
};

// ─── ATTENDANCE ──────────────────────────────────────────────────────────────
export const attendanceAPI = {
  mark: (data) => api.post('/attendance/mark', data),          // { eventId, token/qr }
  getByEvent: (eventId) => api.get(`/attendance/event/${eventId}`),
  getMyAttendance: () => api.get('/attendance/me'),
};

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────
export const notificationsAPI = {
  getAll: () => api.get('/notifications/me'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/mark-all-read'),
};

// ─── FEEDBACK ────────────────────────────────────────────────────────────────
export const feedbackAPI = {
  submit: (data) => api.post('/feedback', data),               // { eventId, rating, comment }
  getByEvent: (eventId) => api.get(`/feedback/event/${eventId}`),
};

// ─── ANNOUNCEMENTS ───────────────────────────────────────────────────────────
export const announcementsAPI = {
  send: (data) => api.post('/announcements', data),            // club head
  getByClub: (clubId) => api.get(`/announcements/club/${clubId}`),
};

// ─── VOLUNTEERS ──────────────────────────────────────────────────────────────
export const volunteersAPI = {
  add: (clubId, userId) => api.post(`/clubs/${clubId}/volunteers`, { userId }),
  remove: (clubId, userId) => api.delete(`/clubs/${clubId}/volunteers/${userId}`),
  getAll: (clubId) => api.get(`/clubs/${clubId}/volunteers`),
};

// ─── FACULTY ──────────────────────────────────────────────────────────────────
export const facultyAPI = {
  createClubWithHead: (data) => api.post('/faculty/create-club-with-head', data),
  getMyClubs: () => api.get('/faculty/my-clubs'),
};

// ─── USERS ────────────────────────────────────────────────────────────────────
export const usersAPI = {
  getStudents: () => api.get('/users/students'),
};

export default api;
