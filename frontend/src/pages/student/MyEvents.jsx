import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../../components/AppLayout';
import EventCard from '../../components/EventCard';
import { LoadingSpinner, EmptyState, PageHeader, StatusBadge } from '../../components/UI';
import { Star, Clock, QrCode } from 'lucide-react';
import { isEventPast } from '../../utils/eventUtils';
import styles from './Student.module.css';

export default function MyEvents() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRegistered = async () => {
      try {
        const userId = localStorage.getItem("userId");
        const { studentAPI } = await import('../../services/api');
        const res = await studentAPI.getMyEvents(userId);
        if (res.status === 200 || res.status === 201) {
           setEvents(res.data || []);
        } else {
           setEvents([]);
        }
      } catch (err) {
        setEvents([]); // Fallback to empty instead of crashing
      } finally {
        setLoading(false);
      }
    };
    fetchRegistered();
  }, []);

  const upcoming = events?.filter(e => !isEventPast(e)) || [];
  const past = events?.filter(e => isEventPast(e)) || [];

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
                      <button
                        className={styles.scannerBtn}
                        onClick={() => navigate(`/student/my-qr/${ev.id}`)}
                        title="Show my attendance QR"
                        style={{ background: '#3b82f6', borderColor: '#3b82f6', marginRight: '0.5rem' }}
                      >
                        <QrCode size={15} />
                        My QR
                      </button>
                      <button
                        className={styles.scannerBtn}
                        onClick={() => navigate('/student/scan')}
                        title="Scan QR for feedback"
                      >
                        <QrCode size={15} />
                        Scan Feedback
                      </button>
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
