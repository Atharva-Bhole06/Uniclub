import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApi } from '../../hooks/useApi';
import { eventsAPI, clubsAPI } from '../../services/api';
import AppLayout from '../../components/AppLayout';
import { LoadingSpinner, EmptyState, PageHeader, StatusBadge } from '../../components/UI';
import { Calendar, Users, Plus, TrendingUp } from 'lucide-react';
import styles from './ClubHead.module.css';

const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } } };

export default function ClubHeadDashboard() {
  const navigate = useNavigate();
  const { data: events, loading: evLoading } = useApi(() => eventsAPI.getAll({ myClub: true }));
  const pending = events?.filter(e => e.status === 'PENDING') || [];
  const approved = events?.filter(e => e.status === 'APPROVED') || [];

  return (
    <AppLayout>
      <div className={styles.page}>
        <motion.div initial="hidden" animate="visible" variants={fadeUp}>
          <PageHeader
            title="Club Dashboard"
            subtitle="Manage your club and events"
            action={
              <button className={styles.primaryAction} onClick={() => navigate('/clubhead/create-event')}>
                <Plus size={16} /> Create Event
              </button>
            }
          />
        </motion.div>

        {/* Summary Cards */}
        <motion.div className={styles.summaryRow} initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
          <motion.div className={styles.summaryCard} variants={fadeUp}>
            <Calendar size={22} className={styles.summaryIcon} />
            <span className={styles.summaryNum}>{pending.length}</span>
            <span className={styles.summaryLabel}>Pending Approval</span>
          </motion.div>
          <motion.div className={styles.summaryCard} variants={fadeUp}>
            <TrendingUp size={22} className={styles.summaryIcon} />
            <span className={styles.summaryNum}>{approved.length}</span>
            <span className={styles.summaryLabel}>Approved Events</span>
          </motion.div>
        </motion.div>

        {/* Recent Events */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Recent Events</h2>
          {evLoading ? <LoadingSpinner /> : events?.length === 0
            ? <EmptyState icon={Calendar} title="No events yet" description="Create your first event to get started" action={<button className={styles.primaryAction} onClick={() => navigate('/clubhead/create-event')}><Plus size={14} /> Create Event</button>} />
            : (
              <div className={styles.eventTable}>
                <div className={styles.tableHeader}>
                  <span>Event</span><span>Date</span><span>Registrations</span><span>Status</span>
                </div>
                {events?.slice(0, 8).map(ev => (
                  <div key={ev.id} className={styles.tableRow} onClick={() => navigate(`/clubhead/events`)}>
                    <span className={styles.eventName}>{ev.title}</span>
                    <span className={styles.eventDate}>{new Date(ev.startTime).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                    <span className={styles.eventRegs}>{ev.registeredCount || 0} / {ev.maxParticipants || '∞'}</span>
                    <StatusBadge status={ev.status} />
                  </div>
                ))}
              </div>
            )}
        </section>
      </div>
    </AppLayout>
  );
}
