import React from 'react';
import { motion } from 'framer-motion';
import { Link as RouterLink } from 'react-router-dom';
import { ArrowRight, Link } from 'lucide-react';
import styles from './Footer.module.css';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <motion.div 
        className={styles.footerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeUp}
      >
        <div className={styles.footerHeader}>
          <h2 className={styles.footerTagline}>Connect. Collaborate. Create. Together.</h2>
          <a href="mailto:contact@uniclub.com" className={styles.footerEmail}>contact@uniclub.com</a>
        </div>

        <div className={styles.footerMain}>
          <div className={styles.footerLeft}>
            <p className={styles.footerDesc}>Explore clubs, join events, and grow your network.</p>
            <button className={styles.footerJoinBtn}>Join now</button>
          </div>
          
          <div className={styles.footerLinksGrid}>
            <div className={styles.footerColumn}>
              <span className={styles.linkTitle}>Clubs</span>
              <a href="#">Events</a>
              <a href="#">Teams</a>
              <a href="#">Support</a>
            </div>
            <div className={styles.footerColumn}>
              <span className={styles.linkTitle}>Explore</span>
              <a href="#">About</a>
              <a href="#">Careers</a>
              <a href="#">Blog</a>
            </div>
            <div className={styles.footerColumn}>
              <span className={styles.linkTitle}>Resources</span>
              <a href="#">Docs</a>
              <a href="#">API</a>
              <a href="#">Guides</a>
            </div>
            <div className={styles.footerColumn}>
              <span className={styles.linkTitle}>Legal</span>
              <a href="#">Terms</a>
              <a href="#">Privacy</a>
              <a href="#">Cookies</a>
            </div>
          </div>

          <button className={styles.backToTop} onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
            <ArrowRight className={styles.backToTopArrow} size={16} /> Back to top
          </button>
        </div>

        <div className={styles.footerBottom}>
          <div className={styles.footerBottomLogo}>
            <img src="/images/logo.png" alt="UniClub Logo" className={styles.footerBottomLogoImg} />
            <span className={`${styles.accentItalic} ${styles.footerBrandText}`}>Uniclub</span>
          </div>
          <div className={styles.socialIcons}>
            <a href="#" aria-label="Instagram">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
            </a>
            <a href="#" aria-label="LinkedIn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
            </a>
            <a href="#" aria-label="Website">
              <Link size={20} />
            </a>
          </div>
          <div className={styles.bottomLinks}>
            <a href="#">Help</a>
            <a href="#">Contact</a>
            <a href="#">Press</a>
          </div>
        </div>
      </motion.div>
    </footer>
  );
}
