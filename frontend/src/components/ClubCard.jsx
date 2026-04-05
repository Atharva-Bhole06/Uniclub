import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users } from 'lucide-react';
import styles from './ClubCard.module.css';

export default function ClubCard({ club, onJoin }) {
  const navigate = useNavigate();

  return (
    <article className={styles.card} onClick={() => navigate(`/student/clubs/${club.id}`)}>
      <div className={styles.imageWrap}>
        <img
          src={club.imageUrl || '/images/default-club.png'}
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
