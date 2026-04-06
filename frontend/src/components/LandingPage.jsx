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
import Footer from './Footer';

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

      <Footer />
    </div>
  );
}
