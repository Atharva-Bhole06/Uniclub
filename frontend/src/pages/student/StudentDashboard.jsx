import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AppLayout from '../../components/AppLayout';
import EventCard from '../../components/EventCard';
import api from '../../services/api';
import styles from './Student.module.css';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
};

const staggerChildren = {
  visible: { transition: { staggerChildren: 0.1 } }
};

export default function StudentDashboard() {
  const navigate = useNavigate();

  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setError(null);
      const upcomingRes = await api.get("/student/events/upcoming");
      const pastRes = await api.get("/student/events/past");

      setUpcomingEvents(upcomingRes.data);
      setPastEvents(pastRes.data);
    } catch (err) {
      console.error("Error fetching events:", err);
      setError(err.response?.data?.message || err.message || "Failed to fetch events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <AppLayout>
        <div className={styles.dashboardPage} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <h3>Loading dashboard...</h3>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className={styles.dashboardPage} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ color: '#ef4444' }}>{error}</h3>
          <button className={styles.outlinedBtn} onClick={fetchData}>Retry</button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className={styles.dashboardPage}>
        {/* Upcoming Events Horizontal Scroll */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Upcoming Events ({upcomingEvents.length})</h2>
            <button className="viewAllBtn" onClick={() => navigate('/student/events')}>
              View all
            </button>
          </div>
          
          <div className={styles.horizontalScroll} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', paddingBottom: '10px' }}>
            {upcomingEvents.slice(0, 3).map((ev, i) => (
              <motion.div 
                key={ev.id} 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: i * 0.1, ease: 'easeOut' }}
              >
                <EventCard event={ev} onSuccess={fetchData} />
              </motion.div>
            ))}
          </div>
        </section>

        {/* Past Events Grid */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Past Events ({pastEvents.length})</h2>
          </div>
          
          <div className={styles.eventsGrid} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
            {pastEvents.map((ev, i) => (
              <motion.div 
                key={ev.id} 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <EventCard event={ev} onSuccess={fetchData} />
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
