import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';
import styles from './EventCard.module.css';

export default function EventCard({ event, onClick, onSuccess }) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) onClick(event);
    else navigate(`/event/${event.id}`);
  };

  const [isRegistering, setIsRegistering] = useState(false);
  const [registered, setRegistered] = useState(false);

  const handleRegister = async (eventId) => {
    if (isRegistering || registered) return;
    setIsRegistering(true);
    const userId = localStorage.getItem("userId");

    try {
      const res = await fetch(`http://localhost:8080/api/student/register/${eventId}?userId=${userId}`, {
        method: "POST"
      });

      if (res.ok) {
        setRegistered(true);
        if (onSuccess) onSuccess();
      } else {
        throw new Error("Registration failed");
      }
    } catch (err) {
      console.error("Registration failed:", err);
    } finally {
      setIsRegistering(false);
    }
  };

  const statusColor = {
    PENDING: '#f59e0b',
    APPROVED: '#c9f28f',
    REJECTED: '#ef4444',
  }[event.status] || '#9ca3af';

  return (
    <article className={styles.card} onClick={handleClick} tabIndex={0} role="button">
      <div className={styles.imageWrap}>
        <img
          src={event.imageUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&auto=format&fit=crop&q=60'}
          alt={event.title}
          className={styles.image}
          loading="lazy"
        />
        <div className={styles.imageOverlay} />
        {event.status && (
          <span className={styles.statusBadge} style={{ color: statusColor, borderColor: statusColor }}>
            {event.status}
          </span>
        )}
      </div>
      <div className={styles.content}>
        <p className={styles.clubName}>{event.club?.name || event.clubName || 'UniClub'}</p>
        <h3 className={styles.title}>{event.title}</h3>
        <p className={styles.desc}>{event.description}</p>
        <div className={styles.meta}>
          <span className={styles.metaItem}><Calendar size={13} />{new Date(event.date || event.startTime).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</span>
          <span className={styles.metaItem}><Clock size={13} />{new Date(event.date || event.startTime).toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' })}</span>
          {event.venue && <span className={styles.metaItem}><MapPin size={13} />{event.venue}</span>}
          {event.maxParticipants && <span className={styles.metaItem}><Users size={13} />{event.registeredCount || 0}/{event.maxParticipants}</span>}
        </div>
        {event.status === 'UPCOMING' && (
          <button 
            className={styles.registerBtn} 
            disabled={registered || isRegistering}
            onClick={(e) => { e.stopPropagation(); handleRegister(event.id); }}
            style={{ 
              marginTop: '12px', padding: '8px 16px', border: 'none', borderRadius: '4px', zIndex: 10,
              cursor: (registered || isRegistering) ? 'default' : 'pointer', 
              background: registered ? '#10b981' : 'var(--primary-color)', color: 'white',
              opacity: isRegistering ? 0.7 : 1
            }}
          >
            {isRegistering ? 'Registering...' : registered ? 'Registered!' : 'Register'}
          </button>
        )}
      </div>
    </article>
  );
}
