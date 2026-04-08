import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppLayout from '../../components/AppLayout';
import { Calendar, MapPin, ArrowLeft, Share, Users } from 'lucide-react';
import { LoadingSpinner } from '../../components/UI';
import Modal from '../../components/Modal';
import { useAuth } from '../../context/AuthContext';
import { getEventStatus } from '../../utils/eventUtils';
import api, { API_BASE } from '../../services/api';
import styles from './EventDetails.module.css';

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { user, registeredEventIds, addRegisteredEventId, role } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const registered = registeredEventIds?.includes(String(id));

  const [showRegistrantsModal, setShowRegistrantsModal] = useState(false);
  const [registrants, setRegistrants] = useState([]);
  const [loadingRegistrants, setLoadingRegistrants] = useState(false);

  const fetchEvent = async () => {
    try {
      const res = await api.get(`/student/event/${id}`);
      setEvent(res.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to load event details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const handleShare = async () => {
    try {
      const shareData = {
        title: event.title,
        text: `Check out ${event.title}!`,
        url: window.location.href,
      };
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } catch (err) {
      console.error('Share failed', err);
    }
  };

  const openRegistrants = async () => {
    if (event.status !== 'APPROVED') return;
    setShowRegistrantsModal(true);
    setLoadingRegistrants(true);
    setRegistrants([]);
    try {
      const { headClubAPI } = await import('../../services/api');
      const res = await headClubAPI.getEventRegistrations(id);
      setRegistrants(res.data || []);
    } catch(err) {
      console.error("Failed to load registrants", err);
    } finally {
      setLoadingRegistrants(false);
    }
  };

  const handleRegister = async () => {
    const status = getEventStatus(event);
    if (isRegistering || registered || !['UPCOMING', 'ONGOING'].includes(status) || event?.status === 'REJECTED') return;
    setIsRegistering(true);
    const userId = localStorage.getItem("userId");

    try {
      const { studentAPI } = await import('../../services/api');
      const res = await studentAPI.registerForEvent(id, userId);
      if (res.status === 200 || res.status === 201) {
        if (addRegisteredEventId) addRegisteredEventId(String(id));
        setShowModal(false);
        setEvent(prev => ({ ...prev, registeredCount: (prev.registeredCount || 0) + 1 }));
      } else {
        throw new Error("Registration failed");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsRegistering(false);
    }
  };

  if (loading) return <AppLayout><div className={styles.center}><LoadingSpinner /></div></AppLayout>;
  if (error || !event) return <AppLayout><div className={styles.center}><h3 className={styles.errorText}>{error || "Event not found"}</h3><button className={styles.backBtn} onClick={() => navigate(-1)}>Go Back</button></div></AppLayout>;

  const dateStr = new Date(event.date || event.startTime).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' });
  const timeStr = new Date(event.date || event.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <AppLayout>
      <div className={styles.page}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          <ArrowLeft size={18} /> Back
        </button>

        {/* HERO SECTION */}
        <section className={styles.heroSection}>
          <div className={styles.heroImageWrap}>
            <img 
              src={event.posterUrl ? `${API_BASE}/${event.posterUrl}` : event.imageUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80'} 
              alt={event.title} 
              className={styles.heroImage} 
            />
            <div className={styles.heroOverlay}></div>
          </div>
          <div className={styles.heroContent}>
            <h1 className={styles.title}>{event.title}</h1>
            <p className={styles.hostedBy}>Hosted by <strong>{event.club?.name || 'UniClub'}</strong></p>
          </div>
        </section>

        {/* INFO GRID */}
        <div className={styles.contentGrid}>
          {/* Main Info */}
          <div className={styles.mainCol}>
            <section className={styles.detailsSection}>
              <h2 className={styles.sectionTitle}>Details</h2>
              <div className={styles.description}>
                <p>{event.description}</p>
              </div>
            </section>

            <section className={styles.attendeesSection}>
              <div className={styles.sectionHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 className={styles.sectionTitle}>Attendees <span className={styles.countBadge}>{event.registeredCount || 0}</span></h2>
              </div>
              <div className={styles.attendeesGrid}>
                <div className={styles.attendeeAvatar} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Users size={16} />
                </div>
                <div className={styles.attendeeMore}>
                  <span>+{event.registeredCount || 0}</span>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar / Info Cards */}
          <div className={styles.sideCol}>
            <div className={styles.infoCard} style={{ marginBottom: '1.5rem' }}>
              <div className={styles.infoRow}>
                 <div className={styles.infoIcon}><Calendar size={20} /></div>
                 <div>
                   <p className={styles.infoLabel}>{dateStr}</p>
                   <p className={styles.infoVal}>{timeStr}</p>
                 </div>
              </div>
              <div className={styles.divider}></div>
              <div className={styles.infoRow}>
                 <div className={styles.infoIcon}><MapPin size={20} /></div>
                 <div>
                   <p className={styles.infoLabel}>{event.venue || 'TBA Location'}</p>
                   <p className={styles.infoVal}>Campus Details</p>
                 </div>
              </div>
            </div>

            {role === 'CLUB_HEAD' && event.status === 'APPROVED' && (
               <button 
                 onClick={() => navigate(`/clubhead/events/${id}/qr`)}
                 style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    color: 'white', 
                    border: '1px solid rgba(59, 130, 246, 0.4)', 
                    padding: '12px 20px', 
                    borderRadius: '50px', 
                    cursor: 'pointer', 
                    fontSize: '1.05rem', 
                    fontWeight: 600,
                    boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '10px',
                    transition: 'all 0.3s ease'
                 }}
                 onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.5)'; }}
                 onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(59, 130, 246, 0.3)'; }}
               >
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3h6v6H3zM15 3h6v6h-6zM3 15h6v6H3zM15 15h6v6h-6z"/></svg>
                 Generate Attendance QR
               </button>
            )}
          </div>
        </div>

        {/* BOTTOM CTA BAR */}
        <div className={styles.bottomBar}>
          <div className={styles.barInner}>
            <div className={styles.barInfo}>
              <p className={styles.barDate}>{dateStr} • {timeStr}</p>
              <h3 className={styles.barTitle}>{event.title}</h3>
            </div>
            <div className={styles.barActions}>
              <button className={styles.shareBtn} onClick={handleShare}><Share size={18} /></button>
              {role === 'CLUB_HEAD' ? (
                <button 
                  className={styles.registerBtn} 
                  style={{ background: 'var(--surface-light)', color: 'white', border: '1px solid #444' }}
                  onClick={openRegistrants}
                >
                  Check Registrations
                </button>
              ) : ['UPCOMING', 'ONGOING'].includes(getEventStatus(event)) && event.status !== 'REJECTED' ? (
                <button 
                  className={`${styles.registerBtn} ${registered ? styles.registeredBtn : ''}`}
                  onClick={() => setShowModal(true)}
                  disabled={registered || isRegistering}
                >
                  {isRegistering ? 'Processing...' : registered ? 'Registered' : 'Register'}
                </button>
              ) : (
                <button className={`${styles.registerBtn} ${styles.registeredBtn}`} disabled>
                  {getEventStatus(event) === 'PAST' ? 'Event Completed' : 'Registration Closed'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Confirm Registration" size="sm">
        <div style={{ padding: '0.5rem 0 1.5rem', color: '#e5e7eb', fontSize: '0.95rem' }} onClick={e => e.stopPropagation()}>
           <p style={{ marginBottom: '1rem', color: '#9ca3af' }}>You are registering for <strong>{event?.title}</strong>. Please confirm your details below:</p>
           <div style={{ background: '#1a1a1a', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#6b7280' }}>Name</span><span style={{ fontWeight: '500' }}>{user?.name || 'Loading...'}</span></div>
             <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#6b7280' }}>Email</span><span style={{ fontWeight: '500' }}>{user?.email || 'Loading...'}</span></div>
             {user?.moodleId && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#6b7280' }}>Moodle ID</span><span style={{ fontWeight: '500' }}>{user.moodleId}</span></div>}
           </div>
           <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowModal(false)} style={{ padding: '0.6rem 1.2rem', background: 'transparent', border: '1px solid #4b5563', color: '#fff', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleRegister} disabled={isRegistering} style={{ padding: '0.6rem 1.2rem', background: '#c9f28f', border: 'none', color: '#000', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                {isRegistering ? 'Processing...' : 'Confirm Registration'}
              </button>
           </div>
        </div>
      </Modal>

      <Modal isOpen={showRegistrantsModal} onClose={() => setShowRegistrantsModal(false)} title="Event Registrations" size="md">
        <div style={{ padding: '0.5rem 0 1rem', color: '#e5e7eb', fontSize: '0.95rem' }}>
          <p style={{ marginBottom: '1.5rem', color: '#9ca3af' }}>Viewing registered students for: <strong>{event?.title}</strong></p>
          
          {loadingRegistrants ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}><LoadingSpinner /></div>
          ) : registrants.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', background: '#1a1a1a', borderRadius: '8px', color: '#888' }}>
              No students have registered for this event yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '400px', overflowY: 'auto' }}>
              {registrants.map((student, i) => (
                <div key={student.id || i} style={{ background: '#1a1a1a', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <div>
                     <div style={{ fontWeight: '600', color: '#fff', fontSize: '1rem' }}>{student.name}</div>
                     <div style={{ color: '#888', fontSize: '0.85rem' }}>{student.email}</div>
                   </div>
                   {student.moodleId && (
                     <div style={{ background: 'rgba(201, 242, 143, 0.1)', color: '#c9f28f', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                       ID: {student.moodleId}
                     </div>
                   )}
                </div>
              ))}
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
            <button onClick={() => setShowRegistrantsModal(false)} style={{ padding: '8px 16px', background: '#c9f28f', color: '#000', borderRadius: '8px', fontWeight: '600', border: 'none', cursor: 'pointer' }}>Close</button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}
