import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bell, LogOut, Menu, X } from 'lucide-react';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const dashboardPath =
    role === 'STUDENT'   ? '/student/dashboard'  :
    role === 'CLUB_HEAD' ? '/clubhead/dashboard' :
    role === 'FACULTY'   ? '/faculty/dashboard'  : '/';

  return (
    <nav className={styles.navbar}>
      <div className={styles.logo} onClick={() => navigate(dashboardPath)}>
        <img src="/images/logo.png" alt="UniClub" className={styles.logoImg} />
        <span className={styles.logoText}>UniClub</span>
      </div>

      <div className={styles.actions}>
        <button className={styles.iconBtn} onClick={() => navigate(`${dashboardPath}?tab=notifications`)} aria-label="Notifications">
          <Bell size={20} />
        </button>
        <div className={styles.userPill}>
          <span className={styles.userName}>{user?.name || 'User'}</span>
          <span className={styles.roleBadge}>{role?.replace('_', ' ')}</span>
        </div>
        <button className={styles.iconBtn} onClick={logout} aria-label="Logout">
          <LogOut size={20} />
        </button>
        <button className={styles.mobileMenu} onClick={() => setMenuOpen(o => !o)}>
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
    </nav>
  );
}
