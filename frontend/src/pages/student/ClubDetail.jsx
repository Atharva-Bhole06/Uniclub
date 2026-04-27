import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApi, useMutation } from '../../hooks/useApi';
import { clubsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import AppLayout from '../../components/AppLayout';
import EventCard from '../../components/EventCard';
import { LoadingSpinner, EmptyState, Button } from '../../components/UI';
import { Users, Calendar, ArrowLeft, Globe } from 'lucide-react';
import styles from './Student.module.css';

const BACKEND = 'http://localhost:8080';

export default function ClubDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState('Tech');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const { data: club, loading, refetch } = useApi(() => clubsAPI.getById(id), [id]);
  const { data: members } = useApi(() => clubsAPI.getMembers(id), [id]);
  const { data: events } = useApi(() => clubsAPI.getEvents(id), [id]);

  const { mutate: joinClub, loading: joining } = useMutation(() => clubsAPI.join(id));
  const { mutate: leaveClub, loading: leaving } = useMutation(() => clubsAPI.leave(id));

  const handleApply = async () => {
    if (!club.hiringOpen) {
      showToast("Hiring is currently closed for this club", "error");
      return;
    }
    
    try {
      await clubsAPI.join(id, { userId: user.id, role: selectedRole });
      showToast("Application submitted successfully!", "success");
      setShowApplyModal(false);
      refetch();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to apply", "error");
    }
  };

  const handleJoinClick = () => {
    if (!club?.hiringOpen) {
      showToast("Hiring is currently closed for this club", "error");
    } else {
      setShowApplyModal(true);
    }
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
          <img
            src={
              club?.posterUrl
                ? `${BACKEND}/${club.posterUrl}`
                : club?.imageUrl || '/images/default-club.png'
            }
            alt={club?.name}
            className={styles.clubHeroImg}
          />
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

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap', marginTop: '1rem' }}>
              {club?.isMember
                ? <Button variant="secondary" loading={leaving} onClick={handleLeave}>Leave Club</Button>
                : <button 
                    style={{
                      padding: '0.6rem 1.2rem',
                      borderRadius: '10px',
                      border: 'none',
                      background: club?.hiringOpen ? '#c9f28f' : '#3f3f46',
                      color: club?.hiringOpen ? '#111' : '#a1a1aa',
                      fontWeight: '600',
                      cursor: club?.hiringOpen ? 'pointer' : 'not-allowed',
                      fontSize: '0.88rem'
                    }}
                    onClick={handleJoinClick}
                  >
                    Apply as Volunteer
                  </button>
              }
              {club?.websiteLink && (
                <a
                  href={club.websiteLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.6rem 1.2rem',
                    background: 'rgba(201,242,143,0.1)',
                    border: '1px solid rgba(201,242,143,0.3)',
                    color: '#c9f28f',
                    borderRadius: '10px',
                    fontSize: '0.88rem',
                    fontWeight: '600',
                    textDecoration: 'none',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,242,143,0.18)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(201,242,143,0.1)'}
                >
                  <Globe size={14} /> Visit Website
                </a>
              )}
            </div>
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

      {/* Apply Modal */}
      {showApplyModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
          <div style={{ background: '#18181b', padding: '2rem', borderRadius: '16px', width: '90%', maxWidth: '400px', border: '1px solid #27272a' }}>
            <h2 style={{ color: '#fff', marginTop: 0, marginBottom: '1.5rem', fontSize: '1.4rem' }}>Volunteer Application</h2>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '0.3rem' }}>Name</label>
              <input type="text" value={user?.name || ''} readOnly style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: '#27272a', border: '1px solid #3f3f46', color: '#fff' }} />
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '0.3rem' }}>Email</label>
              <input type="email" value={user?.email || ''} readOnly style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: '#27272a', border: '1px solid #3f3f46', color: '#a1a1aa' }} />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '0.3rem' }}>Moodle ID</label>
              <input type="text" value={user?.moodleId || ''} readOnly style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: '#27272a', border: '1px solid #3f3f46', color: '#a1a1aa' }} />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '0.3rem' }}>Select Role / Profession</label>
              <select value={selectedRole} onChange={e => setSelectedRole(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: '#18181b', border: '1px solid #3f3f46', color: '#fff' }}>
                <option value="Tech">Tech</option>
                <option value="Design">Design</option>
                <option value="Management">Management</option>
                <option value="Marketing">Marketing</option>
                <option value="Content Writing">Content Writing</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => setShowApplyModal(false)} style={{ flex: 1, padding: '0.8rem', background: '#27272a', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Cancel</button>
              <button onClick={handleApply} style={{ flex: 1, padding: '0.8rem', background: '#c9f28f', color: '#111', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Submit</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <div style={{
          position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)',
          background: toast.type === 'error' ? '#ef4444' : '#22c55e',
          color: '#fff', padding: '12px 24px', borderRadius: '8px',
          fontWeight: '600', boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 10000, animation: 'fadeInUp 0.3s ease'
        }}>
          {toast.message}
        </div>
      )}
    </AppLayout>
  );
}
