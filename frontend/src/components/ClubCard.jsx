import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Globe } from 'lucide-react';
import { API_BASE } from '../services/api';
import styles from './ClubCard.module.css';

export default function ClubCard({ club, onJoin, showHeadInfo }) {
  const navigate = useNavigate();

  return (
    <article className={styles.card} onClick={() => navigate(`/student/clubs/${club.id}`)}>
      <div className={styles.imageWrap}>
        <img
          src={
            club.posterUrl
              ? `${API_BASE}/${club.posterUrl}`
              : club.imageUrl || '/images/default-club.png'
          }
          alt={club.name}
          className={styles.image}
          loading="lazy"
        />
        <div className={styles.imageOverlay} />
        <span className={styles.category}>{club.category}</span>
      </div>
      <div className={styles.content}>
        <h3 className={styles.name}>{club.name}</h3>
        <p className={styles.desc}>{club.description}</p>
        <div className={styles.footer}>
          <span className={styles.members}><Users size={13} /> {club.memberCount || 0} members</span>
          
          {showHeadInfo && (
            <div style={{ marginLeft: 'auto', fontSize: '0.75rem', textAlign: 'right' }}>
              {club.head ? (
                <div>
                  <span style={{ color: '#c9f28f', fontWeight: 'bold' }}>Head: {club.head.fullName}</span><br/>
                  <span style={{ color: '#888' }}>{club.head.email}</span>
                </div>
              ) : (
                <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>No Head Assigned</span>
              )}
            </div>
          )}
          {onJoin && (
            <button
              className={styles.joinBtn}
              onClick={(e) => { e.stopPropagation(); onJoin(club); }}
            >
              {club.isMember ? 'Joined' : 'Join'}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
