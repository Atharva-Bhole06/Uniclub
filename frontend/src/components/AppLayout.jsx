import React from 'react';
import Navbar from './Navbar';
import SmartSidebar from './SmartSidebar';
import GreetingSection from './GreetingSection';
import Footer from './Footer';
import styles from './AppLayout.module.css';

export default function AppLayout({ children }) {
  return (
    <div className={styles.root}>
      <Navbar />
      <div className={styles.mainContainer}>
        <SmartSidebar />
        <main className={styles.mainContent}>
          <div className={styles.pageContainer}>
            <GreetingSection />
            {children}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
