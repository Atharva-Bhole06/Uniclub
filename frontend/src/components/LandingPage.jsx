/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Compass, 
  Calendar, 
  ArrowRight, 
  ArrowLeft, 
  MessageCircle, 
  Camera, 
  Link
} from 'lucide-react';
import styles from './LandingPage.module.css';

const CAROUSEL_CLUBS = [
  { id: 1, title: 'Tech Innovators', img: '/images/tech.png' },
  { id: 2, title: 'Athletics Club', img: '/images/sports.png' },
  { id: 3, title: 'Live Music Society', img: '/images/music.png' },
  { id: 4, title: 'Modern Arts Guild', img: '/images/art.png' },
  { id: 5, title: 'Literature & Debate', img: '/images/literature.png' },
];

const EVENTS_DATA = [
  { id: 1, title: 'Annual Hackathon 2026', desc: 'Join the biggest coding event of the year. Build, innovate, and disrupt.', img: '/images/tech.png' },
  { id: 2, title: 'Inter-College Athletics', desc: 'Experience the thrill of ultimate competition and outstanding athletic performances.', img: '/images/sports.png' },
  { id: 3, title: 'Spring Indie Concert', desc: 'An unforgettable night of live music featuring the best campus bands and artists.', img: '/images/music.png' },
  { id: 4, title: 'Digital Art Exhibition', desc: 'Explore breathtaking modern art and digital masterpieces crafted by students.', img: '/images/art.png' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const nextEvent = () => {
    setCurrentEventIndex((prev) => (prev + 1) % EVENTS_DATA.length);
  };

  const prevEvent = () => {
    setCurrentEventIndex((prev) => (prev - 1 + EVENTS_DATA.length) % EVENTS_DATA.length);
  };

  return (
    <div className={styles.container}>
      {/* Navbar */}
      <nav className={`${styles.navbar} ${isScrolled ? styles.navbarScrolled : ''}`}>
        <div className={styles.logo}>
          <img src="/images/logo.png" alt="UniClub Logo" className={styles.logoImg} />
          UniClub
        </div>
        <div>
          <button className="btn-primary" onClick={() => navigate('/login')}>Get Started</button>
        </div>
      </nav>

      {/* Unified Hero and Wheel Wrapper for continuous background surface */}
      <div className={styles.heroAndWheelWrapper}>
        <div className={styles.heroAndWheelOverlay}></div>

        <section className={styles.hero}>
          <motion.div 
            className={styles.heroContent}
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0, scale: 0.98 },
              visible: { opacity: 1, scale: 1, transition: { duration: 0.8, ease: "easeOut" } }
            }}
          >
          <motion.h1 className={styles.title} variants={fadeUp}>
            Discover <span className={styles.accentItalic}>Clubs</span>.<br /><span className={styles.accentItalic}>Connect</span>. Grow.
          </motion.h1>
          <motion.p className={styles.subtitle} variants={fadeUp}>
            All college clubs and events in one premium platform. Join communities, build your network, and shape your campus experience.
          </motion.p>
        </motion.div>
        </section>

        {/* Centerpiece Wheel Section */}
        <section className={styles.wheelSection}>
          <motion.div 
            className={styles.wheelContainer}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* TRUE Seamless Loop: Two identical flex containers scrolling 100% */}
            <div className={styles.scrollMarqueeContent}>
              {CAROUSEL_CLUBS.map((club) => (
                <div key={`set1-${club.id}`} className={styles.cardItem}>
                  <img src={club.img} alt={club.title} className={styles.cardImage} />
                  <div className={styles.cardOverlay}>
                    <h3 className={styles.cardTitle}>{club.title}</h3>
                  </div>
                </div>
              ))}
            </div>
            
            <div className={styles.scrollMarqueeContent}>
              {CAROUSEL_CLUBS.map((club) => (
                <div key={`set2-${club.id}`} className={styles.cardItem}>
                  <img src={club.img} alt={club.title} className={styles.cardImage} />
                  <div className={styles.cardOverlay}>
                    <h3 className={styles.cardTitle}>{club.title}</h3>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </section>
      </div>

      {/* Density Update: Stats Section immediately follows wheel */}
      <section className={styles.statsSection}>
        <motion.div 
          className={styles.statsGrid}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.15 } }
          }}
        >
          <motion.div className={styles.statCard} variants={fadeUp}>
            <div className={styles.statIcon}><Users size={28} /></div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>12k+</span>
              <span className={styles.statLabel}>Total Members</span>
            </div>
          </motion.div>
          <motion.div className={styles.statCard} variants={fadeUp}>
            <div className={styles.statIcon}><Compass size={28} /></div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>150+</span>
              <span className={styles.statLabel}>Active Clubs</span>
            </div>
          </motion.div>
          <motion.div className={styles.statCard} variants={fadeUp}>
            <div className={styles.statIcon}><Calendar size={28} /></div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>450+</span>
              <span className={styles.statLabel}>Yearly Events</span>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Events Section - Immersive Bending Spoons Style */}
      <section className={styles.eventsSection}>
        <motion.div 
          className={styles.eventsHeader}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          variants={fadeUp}
        >
          <h2 className={styles.sectionTitle}>Explore Events</h2>
          <div className={styles.navButtons}>
            <button className={styles.navBtn} onClick={prevEvent}>
              <ArrowLeft size={24} />
            </button>
            <button className={styles.navBtn} onClick={nextEvent}>
              <ArrowRight size={24} />
            </button>
          </div>
        </motion.div>

        <motion.div 
          className={styles.immersiveEventContainer}
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <AnimatePresence mode='wait'>
            <motion.div 
              key={currentEventIndex}
              className={styles.immersiveEventCard}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              <img src={EVENTS_DATA[currentEventIndex].img} alt="Event" className={styles.immersiveImage} />
              <div className={styles.immersiveOverlay}>
                <h3 className={styles.immersiveTitle}>{EVENTS_DATA[currentEventIndex].title}</h3>
                <p className={styles.immersiveDesc}>{EVENTS_DATA[currentEventIndex].desc}</p>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </section>

      {/* Footer - White Background Contrast Section */}
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
    </div>
  );
}
