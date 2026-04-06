import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Compass, Calendar, Star, MessageSquare,
  ClipboardList, Users, Megaphone, CheckSquare, BarChart2
} from 'lucide-react';
import styles from './SmartSidebar.module.css';

const STUDENT_LINKS = [
  { to: '/student/dashboard', icon: LayoutDashboard, label: 'Dashboard', desc: 'Your overview' },
  { to: '/student/clubs',     icon: Compass,         label: 'Clubs',     desc: 'Explore campus clubs' },
  { to: '/student/events',    icon: Calendar,        label: 'Events',    desc: 'Upcoming happenings' },
  { to: '/student/my-events', icon: Star,            label: 'My Events', desc: 'Your registrations' },
];

const HEAD_LINKS = [
  { to: '/clubhead/dashboard',     icon: LayoutDashboard, label: 'Dashboard',   desc: 'Club overview' },
  { to: '/clubhead/create-event',  icon: Calendar,        label: 'Create',      desc: 'New event' },
  { to: '/clubhead/events',        icon: ClipboardList,   label: 'Manage',      desc: 'Edit events' },
  { to: '/clubhead/volunteers',    icon: Users,           label: 'Volunteers',  desc: 'Manage team' },
  { to: '/clubhead/announcements', icon: Megaphone,       label: 'Broadcast',   desc: 'Send news' },
];

const FACULTY_LINKS = [
  { to: '/faculty/dashboard',   icon: LayoutDashboard, label: 'Dashboard', desc: 'Faculty overview' },
  { to: '/faculty/approvals',   icon: CheckSquare,     label: 'Approvals', desc: 'Pending events' },
  { to: '/faculty/attendance',  icon: BarChart2,       label: 'Attendance',desc: 'Monitor stats' },
];

export default function SmartSidebar() {
  const { role } = useAuth();
  
  // Use mock role "STUDENT" if context isn't fully loaded for visual development
  const currentRole = role || 'STUDENT';

  const links =
    currentRole === 'STUDENT'   ? STUDENT_LINKS :
    currentRole === 'CLUB_HEAD' ? HEAD_LINKS    :
    currentRole === 'FACULTY'   ? FACULTY_LINKS : STUDENT_LINKS;

  return (
    <div className={styles.sidebarWrapper}>
      <nav className={styles.navContainer}>
        {links.map(({ to, icon: Icon, label, desc }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `${styles.blockItem} ${isActive ? styles.activeBlock : ''}`
            }
          >
            <div className={styles.iconWrapper}>
              <Icon size={20} strokeWidth={2.5} />
            </div>
            
            <div className={styles.textWrapper}>
              <span className={styles.label}>{label}</span>
              <span className={styles.desc}>{desc}</span>
            </div>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
