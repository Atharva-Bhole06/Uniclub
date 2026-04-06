import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppLayout from '../../components/AppLayout';
import { Calendar, MapPin, ArrowLeft, Share, Users } from 'lucide-react';
import { LoadingSpinner } from '../../components/UI';
import styles from './EventDetails.module.css';

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isRegistering, setIsRegistering] = useState(false);
  const [registered, setRegistered] = useState(false);

  const fetchEvent = async () => {
    try {
      const res = await fetch(`http://localhost:8080/api/student/event/${id}`);
      if (!res.ok) throw new Error("Failed to load event details");
      const data = await res.json();
      setEvent(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const handleRegister = async () => {
    if (isRegistering || registered || event?.status !== 'UPCOMING') return;
    setIsRegistering(true);
    const userId = localStorage.getItem("userId");

    try {
      const res = await fetch(`http://localhost:8080/api/student/register/${id}?userId=${userId}`, {
        method: "POST"
      });
      if (res.ok) {
        setRegistered(true);
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
            <img src={event.imageUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80'} alt={event.title} className={styles.heroImage} />
            <div className={styles.heroOverlay}></div>
          </div>
          <div className={styles.heroContent}>
            <div className={styles.clubPill}>{event.club?.name || 'UniClub'}</div>
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
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Attendees <span className={styles.countBadge}>1</span></h2>
              </div>
              <div className={styles.attendeesGrid}>
                <div className={styles.attendeeAvatar}><span>Me</span></div>
                <div className={styles.attendeeMore}><span>+0</span></div>
              </div>
            </section>
          </div>

          {/* Sidebar / Info Cards */}
          <div className={styles.sideCol}>
            <div className={styles.infoCard}>
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
              <button className={styles.shareBtn}><Share size={18} /></button>
              {event.status === 'UPCOMING' ? (
                <button 
                  className={`${styles.registerBtn} ${registered ? styles.registeredBtn : ''}`}
                  onClick={handleRegister}
                  disabled={registered || isRegistering}
                >
                  {isRegistering ? 'Processing...' : registered ? 'Registered!' : 'Register'}
                </button>
              ) : (
                <button className={`${styles.registerBtn} ${styles.registeredBtn}`} disabled>
                  Past Event
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
