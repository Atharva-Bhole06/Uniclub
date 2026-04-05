import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import styles from './AppLayout.module.css';

export default function AppLayout({ children }) {
  return (
    <div className={styles.root}>
      <Navbar />
      <Sidebar />
      <main className={styles.main}>
        {children}
      </main>
    </div>
  );
}
