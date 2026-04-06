import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../../components/AppLayout';
import EventCard from '../../components/EventCard';
import { LoadingSpinner, EmptyState, PageHeader, StatusBadge } from '../../components/UI';
import { Star, Clock } from 'lucide-react';
import styles from './Student.module.css';

export default function MyEvents() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRegistered = async () => {
      try {
        const userId = localStorage.getItem("userId");
        const res = await fetch(`http://localhost:8080/api/student/my-events?userId=${userId}`);
        if (!res.ok) {
           setEvents([]);
           return;
        }
        const data = await res.json();
        setEvents(data || []);
      } catch (err) {
        setEvents([]); // Fallback to empty instead of crashing
      } finally {
        setLoading(false);
      }
    };
    fetchRegistered();
  }, []);

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
