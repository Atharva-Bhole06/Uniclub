import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import styles from './GreetingSection.module.css';

export default function GreetingSection() {
  const { user } = useAuth();
  const firstName = user?.name?.split(' ')[0] || 'User';

  return (
    <motion.div 
      className={styles.greetingContainer}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <h1 className={styles.greetingText}>
        <span className={styles.welcomeText}>Welcome, </span>
        <span className={styles.accentName}>{firstName}.</span>
      </h1>
      <p className={styles.subtitle}>Here is your campus dashboard.</p>
    </motion.div>
  );
}
