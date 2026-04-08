import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, Clock, ArrowRight } from 'lucide-react';
import { getEventStatus } from '../utils/eventUtils';
import { useAuth } from '../context/AuthContext';
import styles from './EventCard.module.css';

const BACKEND = 'http://localhost:8080';

export default function EventCard({ event, onClick, onSuccess }) {
  const navigate = useNavigate();
  let authContext = null;
  try { authContext = useAuth(); } catch(e) {}
  const { role, registeredEventIds } = authContext || {};
  const isRegistered = registeredEventIds?.includes(String(event.id));

  const handleClick = (e) => {
    if (e) e.stopPropagation();
    if (onClick) onClick(event);
    else navigate(`/event/${event.id}`);
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
          src={
            event.posterUrl
              ? `${BACKEND}/${event.posterUrl}`
              : event.imageUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&auto=format&fit=crop&q=60'
          }
          alt={event.title}
          className={styles.image}
          loading="lazy"
        />
        <div className={styles.imageOverlay} />
        {event.status && event.status !== 'APPROVED' && (
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
          <span className={styles.metaItem}><Calendar size={13} />{new Date(event.startTime || event.date).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</span>
          <span className={styles.metaItem}><Clock size={13} />{new Date(event.startTime || event.date).toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' })}</span>
          {(event.venue || event.location) && <span className={styles.metaItem}><MapPin size={13} />{event.venue || event.location}</span>}
          {event.maxParticipants && <span className={styles.metaItem}><Users size={13} />{event.registeredCount || 0}/{event.maxParticipants}</span>}
        </div>
        {['UPCOMING', 'ONGOING'].includes(getEventStatus(event)) && event.status !== 'REJECTED' && (
          role === 'CLUB_HEAD' ? (
             <button 
               type="button"
               className={styles.registerActionBtn} 
               style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#fff', border: '1px solid rgba(255, 255, 255, 0.1)' }}
               onClick={handleClick}
             >
               Check Registrations <Users size={14} />
             </button>
          ) : isRegistered ? (
            <div style={{ marginTop: '12px', padding: '10px 16px', background: 'rgba(255, 255, 255, 0.05)', color: '#9ca3af', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              Registered
            </div>
          ) : (
            <button 
              type="button"
              className={styles.registerActionBtn} 
              onClick={handleClick}
            >
              Register Here <ArrowRight size={14} />
            </button>
          )
        )}
        {getEventStatus(event) === 'PAST' && event.status !== 'REJECTED' && (
           <div style={{ marginTop: '12px', padding: '8px 16px', background: '#374151', color: '#9ca3af', borderRadius: '4px', textAlign: 'center', fontSize: '0.9rem', fontWeight: 'bold' }}>
             Event Completed
           </div>
        )}
      </div>
    </article>
  );
}
