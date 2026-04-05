import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import { eventsAPI } from '../../services/api';
import AppLayout from '../../components/AppLayout';
import EventCard from '../../components/EventCard';
import { LoadingSpinner, EmptyState, PageHeader, StatusBadge } from '../../components/UI';
import { Star, Clock } from 'lucide-react';
import styles from './Student.module.css';

export default function MyEvents() {
  const navigate = useNavigate();
  const { data: events, loading, error } = useApi(() => eventsAPI.getRegistered());

  const now = new Date();
  const upcoming = events?.filter(e => new Date(e.startTime) > now) || [];
  const past = events?.filter(e => new Date(e.startTime) <= now) || [];

  if (loading) return <AppLayout><LoadingSpinner /></AppLayout>;

  return (
    <AppLayout>
      <div className={styles.page}>
        <PageHeader title="My Events" subtitle={`${events?.length || 0} registered events`} />

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}><Star size={16} /> Upcoming</h2>
          {upcoming.length === 0
            ? <EmptyState icon={Star} title="No upcoming events" description="Register for events to see them here" />
            : <div className={styles.eventsGrid}>
                {upcoming.map(ev => (
                  <div key={ev.id} className={styles.myEventCard}>
                    <EventCard event={ev} />
                    <div className={styles.myEventActions}>
                      <StatusBadge status={ev.attendanceStatus || 'REGISTERED'} />
                    </div>
                  </div>
                ))}
              </div>
          }
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}><Clock size={16} /> Past Events</h2>
          {past.length === 0
            ? <EmptyState icon={Clock} title="No past events" />
            : <div className={styles.eventsGrid}>
                {past.map(ev => (
                  <div key={ev.id} className={styles.myEventCard}>
                    <EventCard event={ev} />
                    <div className={styles.myEventActions}>
                      <StatusBadge status={ev.attendanceStatus || 'ABSENT'} />
                      {!ev.feedbackSubmitted && (
                        <button className={styles.feedbackBtn} onClick={() => navigate(`/student/feedback/${ev.id}`)}>
                          Submit Feedback
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
          }
        </section>
      </div>
    </AppLayout>
  );
}
