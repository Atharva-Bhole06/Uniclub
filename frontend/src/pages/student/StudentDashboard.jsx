import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';
import { eventsAPI, notificationsAPI } from '../../services/api';
import AppLayout from '../../components/AppLayout';
import EventCard from '../../components/EventCard';
import { LoadingSpinner, EmptyState, PageHeader, StatusBadge } from '../../components/UI';
import { Calendar, Bell, Compass, Star } from 'lucide-react';
import styles from './Student.module.css';

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } } };

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: myEvents, loading: evLoading } = useApi(() => eventsAPI.getRegistered());
  const { data: notifications, loading: notifLoading } = useApi(() => notificationsAPI.getAll());

  const upcoming = myEvents?.filter(e => new Date(e.startTime) > new Date()) || [];
  const unreadNotifs = notifications?.filter(n => !n.read) || [];

  return (
    <AppLayout>
      <div className={styles.page}>
        {/* Greeting */}
        <motion.div className={styles.greeting} initial="hidden" animate="visible" variants={fadeUp}>
          <h1 className={styles.greetTitle}>Good {getTimeOfDay()}, <span className={styles.accent}>{user?.name?.split(' ')[0]}</span> 👋</h1>
          <p className={styles.greetSub}>Here's what's happening on campus today</p>
        </motion.div>

        {/* Quick Stats */}
        <motion.div className={styles.statsRow} initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
          <motion.div className={styles.statPill} variants={fadeUp}>
            <Star size={18} className={styles.statIcon} />
            <div><span className={styles.statNum}>{upcoming.length}</span><span className={styles.statLab}>Upcoming</span></div>
          </motion.div>
          <motion.div className={styles.statPill} variants={fadeUp}>
            <Bell size={18} className={styles.statIcon} />
            <div><span className={styles.statNum}>{unreadNotifs.length}</span><span className={styles.statLab}>Unread</span></div>
          </motion.div>
          <motion.div className={styles.statPill} variants={fadeUp} onClick={() => navigate('/student/clubs')} style={{ cursor: 'pointer' }}>
            <Compass size={18} className={styles.statIcon} />
            <div><span className={styles.statLab}>Explore Clubs →</span></div>
          </motion.div>
        </motion.div>

        {/* Upcoming Events */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}><Calendar size={18} /> Upcoming Events</h2>
            <button className={styles.seeAll} onClick={() => navigate('/student/my-events')}>See all</button>
          </div>
          {evLoading ? <LoadingSpinner /> : upcoming.length === 0
            ? <EmptyState icon={Calendar} title="No upcoming events" description="Register for events to see them here" />
            : (
              <div className={styles.eventsGrid}>
                {upcoming.slice(0, 3).map(ev => (
                  <motion.div key={ev.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.4 }} transition={{ duration: 0.5 }}>
                    <EventCard event={ev} />
                  </motion.div>
                ))}
              </div>
            )}
        </section>

        {/* Notifications */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}><Bell size={18} /> Notifications</h2>
          </div>
          {notifLoading ? <LoadingSpinner text="Loading notifications..." /> : notifications?.length === 0
            ? <EmptyState icon={Bell} title="All caught up!" description="No new notifications" />
            : (
              <div className={styles.notifList}>
                {notifications?.slice(0, 5).map(n => (
                  <motion.div key={n.id} className={`${styles.notifItem} ${!n.read ? styles.unread : ''}`}
                    initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.4 }}>
                    <div className={styles.notifDot} />
                    <div>
                      <p className={styles.notifMsg}>{n.message}</p>
                      <span className={styles.notifTime}>{new Date(n.createdAt).toLocaleDateString()}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
        </section>
      </div>
    </AppLayout>
  );
}

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
