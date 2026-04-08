import axios from 'axios';

export const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";
const BASE_URL = `${API_BASE}/api`;

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: { 
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "69420"
  },
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
  sendOtp: (data) => api.post("/auth/send-otp", data),
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
  getAll:          (params) => api.get('/events', { params }),
  getById:         (id)    => api.get(`/events/${id}`),
  getPending:      ()      => api.get('/faculty/events/pending'),    // faculty
  approve:         (id)    => api.put(`/faculty/events/${id}/approve`),
  reject:          (id)    => api.put(`/faculty/events/${id}/reject`),
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

// ─── HEAD CLUB MANAGEMENT ─────────────────────────────────────────────────────
export const headClubAPI = {
  getMyClub: ()       => api.get('/head/my-club'),
  updateClub: (data)  => api.put('/head/club/update', data),
  getMyEvents: ()     => api.get('/head/events'),
  createEvent: (data) => api.post('/head/events', data),
  getEventRegistrations: (eventId) => api.get(`/head/events/${eventId}/registrations`),
  uploadPoster: (clubId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('clubId', clubId);
    return api.post('/head/club/upload-poster', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  uploadEventPoster: (eventId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('eventId', eventId);
    return api.post('/head/events/upload-poster', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// ─── STUDENT  ─────────────────────────────────────────────────────────────────
export const studentAPI = {
  registerForEvent: (eventId, userId) => api.post(`/student/register/${eventId}?userId=${userId}`),
  getMyEvents: (userId) => api.get(`/student/my-events?userId=${userId}`),
};

export default api;
