import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';
import styles from './EventCard.module.css';

export default function EventCard({ event, onClick }) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) onClick(event);
    else navigate(`/student/events/${event.id}`);
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
          src={event.imageUrl || '/images/default-event.png'}
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
        <p className={styles.clubName}>{event.clubName || 'UniClub'}</p>
        <h3 className={styles.title}>{event.title}</h3>
        <p className={styles.desc}>{event.description}</p>
        <div className={styles.meta}>
          <span className={styles.metaItem}><Calendar size={13} />{new Date(event.startTime).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</span>
          <span className={styles.metaItem}><Clock size={13} />{new Date(event.startTime).toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' })}</span>
          {event.venue && <span className={styles.metaItem}><MapPin size={13} />{event.venue}</span>}
          {event.maxParticipants && <span className={styles.metaItem}><Users size={13} />{event.registeredCount || 0}/{event.maxParticipants}</span>}
        </div>
      </div>
    </article>
  );
}
