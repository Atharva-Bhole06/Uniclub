import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import LandingPage from './components/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

import StudentDashboard from './pages/student/StudentDashboard';
import ExploreClubs from './pages/student/ExploreClubs';
import ClubDetail from './pages/student/ClubDetail';
import ExploreEvents from './pages/student/ExploreEvents';
import EventDetails from './pages/student/EventDetails';
import MyEvents from './pages/student/MyEvents';
import FeedbackPage from './pages/student/FeedbackPage';

import ClubHeadDashboard from './pages/clubhead/ClubHeadDashboard';
import CreateEvent from './pages/clubhead/CreateEvent';
import ManageEvents from './pages/clubhead/ManageEvents';
import Volunteers from './pages/clubhead/Volunteers';
import Announcements from './pages/clubhead/Announcements';

import EventApproval from './pages/faculty/EventApproval';
import AttendanceMonitor from './pages/faculty/AttendanceMonitor';

import './index.css';

// ─── Route Guards ─────────────────────────────────────────────────────────────

function RequireAuth({ role, children }) {
  const { isAuthenticated, role: userRole, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role && userRole !== role) return <Navigate to="/" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { isAuthenticated, role, loading } = useAuth();
  if (loading) return null;
  if (isAuthenticated) {
    const path = role === 'STUDENT' ? '/student/dashboard'
      : role === 'CLUB_HEAD' ? '/clubhead/dashboard'
      : '/faculty/dashboard';
    return <Navigate to={path} replace />;
  }
  return children;
}

// ─── App ──────────────────────────────────────────────────────────────────────

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

      {/* Student */}
      <Route path="/student/dashboard" element={<RequireAuth role="STUDENT"><StudentDashboard /></RequireAuth>} />
      <Route path="/student/clubs" element={<RequireAuth role="STUDENT"><ExploreClubs /></RequireAuth>} />
      <Route path="/student/clubs/:id" element={<RequireAuth role="STUDENT"><ClubDetail /></RequireAuth>} />
      <Route path="/student/events" element={<RequireAuth role="STUDENT"><ExploreEvents /></RequireAuth>} />
      <Route path="/event/:id" element={<RequireAuth role="STUDENT"><EventDetails /></RequireAuth>} />
      <Route path="/student/my-events" element={<RequireAuth role="STUDENT"><MyEvents /></RequireAuth>} />
      <Route path="/student/feedback/:eventId" element={<RequireAuth role="STUDENT"><FeedbackPage /></RequireAuth>} />

      {/* Club Head */}
      <Route path="/clubhead/dashboard" element={<RequireAuth role="CLUB_HEAD"><ClubHeadDashboard /></RequireAuth>} />
      <Route path="/clubhead/create-event" element={<RequireAuth role="CLUB_HEAD"><CreateEvent /></RequireAuth>} />
      <Route path="/clubhead/events" element={<RequireAuth role="CLUB_HEAD"><ManageEvents /></RequireAuth>} />
      <Route path="/clubhead/volunteers" element={<RequireAuth role="CLUB_HEAD"><Volunteers /></RequireAuth>} />
      <Route path="/clubhead/announcements" element={<RequireAuth role="CLUB_HEAD"><Announcements /></RequireAuth>} />

      {/* Faculty */}
      <Route path="/faculty/dashboard" element={<RequireAuth role="FACULTY"><EventApproval /></RequireAuth>} />
      <Route path="/faculty/approvals" element={<RequireAuth role="FACULTY"><EventApproval /></RequireAuth>} />
      <Route path="/faculty/attendance" element={<RequireAuth role="FACULTY"><AttendanceMonitor /></RequireAuth>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
