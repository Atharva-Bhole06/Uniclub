import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApi, useMutation } from '../../hooks/useApi';
import { eventsAPI } from '../../services/api';
import AppLayout from '../../components/AppLayout';
import { LoadingSpinner, Button, StatusBadge } from '../../components/UI';
import { Calendar, Clock, MapPin, Users, AlertTriangle, ArrowLeft, CheckCircle } from 'lucide-react';
import { getEventStatus } from '../../utils/eventUtils';
import styles from './Student.module.css';

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [regState, setRegState] = useState(null); // null | 'clash' | 'registered' | 'error'
  const [clashInfo, setClashInfo] = useState(null);

  const { data: event, loading, refetch } = useApi(() => eventsAPI.getById(id), [id]);
  const { mutate: register, loading: registering } = useMutation(() => eventsAPI.register(id));
  const { mutate: checkClash } = useMutation(() => eventsAPI.checkClash(id));

  const handleRegister = async () => {
    // Step 1: Clash check
    const { success, data } = await checkClash();
    if (success && data?.hasClash) {
      setClashInfo(data.conflictingEvent);
      setRegState('clash');
      return;
    }
    // Step 2: Register
    const result = await register();
    if (result.success) {
      setRegState('registered');
      refetch();
    } else {
      setRegState('error');
    }
  };

  if (loading) return <AppLayout><LoadingSpinner /></AppLayout>;
  if (!event) return null;

  const isRegistered = event.isRegistered;
  const isFull = event.registeredCount >= event.maxParticipants;
  const isPast = getEventStatus(event) === 'PAST';

  return (
    <AppLayout>
      <div className={styles.page}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}><ArrowLeft size={16} /> Back to Events</button>

        {/* Hero */}
        <div className={styles.eventDetailHero}>
          <img src={event.imageUrl || '/images/default-event.png'} alt={event.title} className={styles.eventDetailImg} />
          <div className={styles.eventDetailOverlay} />
          <div className={styles.eventDetailHeroContent}>
            <StatusBadge status={event.status} />
            <h1 className={styles.eventDetailTitle}>{event.title}</h1>
            <p className={styles.eventDetailClub}>{event.clubName}</p>
          </div>
        </div>

        <div className={styles.eventDetailBody}>
          {/* Meta grid */}
          <div className={styles.eventMeta}>
            <div className={styles.metaBlock}><Calendar size={18} /><div><small>Date</small><strong>{new Date(event.startTime).toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long' })}</strong></div></div>
            <div className={styles.metaBlock}><Clock size={18} /><div><small>Time</small><strong>{new Date(event.startTime).toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' })} – {new Date(event.endTime).toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' })}</strong></div></div>
            <div className={styles.metaBlock}><MapPin size={18} /><div><small>Venue</small><strong>{event.venue || 'TBA'}</strong></div></div>
            <div className={styles.metaBlock}><Users size={18} /><div><small>Seats</small><strong>{event.registeredCount || 0} / {event.maxParticipants || '∞'}</strong></div></div>
          </div>

          {/* Description */}
          <div className={styles.eventDescBlock}>
            <h2 className={styles.sectionTitle}>About this event</h2>
            <p className={styles.eventDesc}>{event.description}</p>
          </div>

          {/* Registration CTA */}
          <AnimatePresence mode="wait">
            {regState === 'registered' && (
              <motion.div className={styles.successBanner} initial={{ opacity: 0, y: 10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>
                <CheckCircle size={20} /> Successfully registered! Check My Events for details.
              </motion.div>
            )}
            {regState === 'clash' && clashInfo && (
              <motion.div className={styles.clashBanner} initial={{ opacity: 0, y: 10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>
                <AlertTriangle size={20} />
                <div>
                  <strong>Time Clash Detected!</strong>
                  <p>This event overlaps with <em>{clashInfo.title}</em> ({new Date(clashInfo.startTime).toLocaleTimeString()}). Please unregister from it first.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!isPast && !isRegistered && regState !== 'registered' && (
            <Button
              variant="primary"
              loading={registering}
              onClick={handleRegister}
              disabled={isFull}
              style={{ marginTop: '1rem' }}
            >
              {isFull ? 'Event Full' : 'Register for Event'}
            </Button>
          )}
          {(isRegistered || regState === 'registered') && (
            <Button variant="accent" disabled style={{ marginTop: '1rem' }}>✓ You're Registered</Button>
          )}
          {isPast && <Button variant="secondary" onClick={() => navigate(`/student/feedback/${id}`)} style={{ marginTop: '1rem' }}>Submit Feedback</Button>}
        </div>
      </div>
    </AppLayout>
  );
}
