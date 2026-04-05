import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Compass, Calendar, Star, MessageSquare,
  ClipboardList, Users, Megaphone, CheckSquare, BarChart2
} from 'lucide-react';
import styles from './Sidebar.module.css';

const STUDENT_LINKS = [
  { to: '/student/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/student/clubs',     icon: Compass,         label: 'Explore Clubs' },
  { to: '/student/events',    icon: Calendar,        label: 'Explore Events' },
  { to: '/student/my-events', icon: Star,            label: 'My Events' },
];

const HEAD_LINKS = [
  { to: '/clubhead/dashboard',     icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/clubhead/create-event',  icon: Calendar,        label: 'Create Event' },
  { to: '/clubhead/events',        icon: ClipboardList,   label: 'Manage Events' },
  { to: '/clubhead/volunteers',    icon: Users,           label: 'Volunteers' },
  { to: '/clubhead/announcements', icon: Megaphone,       label: 'Announcements' },
];

const FACULTY_LINKS = [
  { to: '/faculty/dashboard',   icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/faculty/approvals',   icon: CheckSquare,     label: 'Event Approvals' },
  { to: '/faculty/attendance',  icon: BarChart2,       label: 'Attendance' },
];

export default function Sidebar() {
  const { role } = useAuth();

  const links =
    role === 'STUDENT'   ? STUDENT_LINKS :
    role === 'CLUB_HEAD' ? HEAD_LINKS    :
    role === 'FACULTY'   ? FACULTY_LINKS : [];

  return (
    <aside className={styles.sidebar}>
      <nav className={styles.nav}>
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `${styles.link} ${isActive ? styles.active : ''}`
            }
          >
            <Icon size={18} className={styles.icon} />
            <span className={styles.label}>{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
