import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApi, useMutation } from '../../hooks/useApi';
import { clubsAPI } from '../../services/api';
import AppLayout from '../../components/AppLayout';
import EventCard from '../../components/EventCard';
import { LoadingSpinner, EmptyState, Button } from '../../components/UI';
import { Users, Calendar, ArrowLeft } from 'lucide-react';
import styles from './Student.module.css';

export default function ClubDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: club, loading, refetch } = useApi(() => clubsAPI.getById(id), [id]);
  const { data: members } = useApi(() => clubsAPI.getMembers(id), [id]);
  const { data: events } = useApi(() => clubsAPI.getEvents(id), [id]);

  const { mutate: joinClub, loading: joining } = useMutation(() => clubsAPI.join(id));
  const { mutate: leaveClub, loading: leaving } = useMutation(() => clubsAPI.leave(id));

  const handleJoin = async () => {
    const { success } = await joinClub();
    if (success) refetch();
  };
  const handleLeave = async () => {
    const { success } = await leaveClub();
    if (success) refetch();
  };

  if (loading) return <AppLayout><LoadingSpinner /></AppLayout>;

  return (
    <AppLayout>
      <div className={styles.page}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}><ArrowLeft size={16} /> Back</button>

        {/* Hero */}
        <div className={styles.clubHero}>
          <img src={club?.imageUrl || '/images/default-club.png'} alt={club?.name} className={styles.clubHeroImg} />
          <div className={styles.clubHeroOverlay} />
          <div className={styles.clubHeroContent}>
            <span className={styles.clubCategory}>{club?.category}</span>
            <h1 className={styles.clubName}>{club?.name}</h1>
            <div className={styles.clubMeta}>
              <span><Users size={14} /> {members?.length || 0} members</span>
            </div>
          </div>
        </div>

        <div className={styles.clubBody}>
          {/* About + CTA */}
          <div className={styles.clubAbout}>
            <h2 className={styles.sectionTitle}>About this club</h2>
            <p className={styles.clubDesc}>{club?.description || 'No description provided.'}</p>
            {club?.isMember
              ? <Button variant="secondary" loading={leaving} onClick={handleLeave}>Leave Club</Button>
              : <Button variant="primary" loading={joining} onClick={handleJoin}>Join Club</Button>
            }
          </div>

          {/* Events */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}><Calendar size={18} /> Club Events</h2>
            {events?.length ? (
              <div className={styles.eventsGrid}>
                {events.map(ev => <EventCard key={ev.id} event={ev} />)}
              </div>
            ) : <EmptyState icon={Calendar} title="No events yet" />}
          </div>

          {/* Members */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}><Users size={18} /> Members</h2>
            <div className={styles.membersList}>
              {members?.map(m => (
                <div key={m.id} className={styles.memberChip}>
                  <div className={styles.memberAvatar}>{m.name?.[0]?.toUpperCase()}</div>
                  <div>
                    <p className={styles.memberName}>{m.name}</p>
                    <p className={styles.memberRole}>{m.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
