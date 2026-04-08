import React, { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { headClubAPI } from '../../services/api';
import AppLayout from '../../components/AppLayout';
import { LoadingSpinner, EmptyState, PageHeader, StatusBadge } from '../../components/UI';
import Modal from '../../components/Modal';
import EventCard from '../../components/EventCard';
import CreateEventForm from './CreateEvent';
import { Calendar } from 'lucide-react';
import styles from './ClubHead.module.css';

export default function ManageEvents() {
  const { data: events, loading, refetch } = useApi(() => headClubAPI.getMyEvents());
  const [showAll, setShowAll] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [expandedRow, setExpandedRow] = useState(null);
  const [registrantsModal, setRegistrantsModal] = useState(null);
  const [registrants, setRegistrants] = useState([]);
  const [loadingRegistrants, setLoadingRegistrants] = useState(false);

  const openRegistrants = async (ev) => {
    if (ev.status !== 'APPROVED') return;
    setRegistrantsModal(ev);
    setLoadingRegistrants(true);
    setRegistrants([]);
    try {
      const res = await headClubAPI.getEventRegistrations(ev.id);
      setRegistrants(res.data || []);
    } catch(err) {
      console.error("Failed to load registrants", err);
    } finally {
      setLoadingRegistrants(false);
    }
  };

  const validEvents = events?.filter(e => e.status !== 'REJECTED') || [];
  const displayedEvents = showAll ? validEvents : validEvents.slice(0, 3);
  const filteredEvents = events?.filter(e => statusFilter === 'ALL' || e.status === statusFilter) || [];

  return (
    <AppLayout>
      <div className={styles.page}>
        <PageHeader title="Manage Your Events" subtitle="Track events, monitor statuses, and create new ones" />

        {loading ? <LoadingSpinner /> : !events?.length ? (
          <EmptyState icon={Calendar} title="No events yet" description="Start by creating your first event below" />
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ color: '#fff', fontSize: '1.4rem' }}>Your Events</h2>
              {events.length > 3 && (
                <button 
                  className={styles.outlinedBtn} 
                  onClick={() => setShowAll(!showAll)}
                >
                  {showAll ? 'Show Less' : 'View All'}
                </button>
              )}
            </div>
            
            <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: '3rem' }}>
              {displayedEvents.map(ev => (
                <EventCard key={ev.id} event={ev} />
              ))}
            </div>
          </>
        )}

        {/* Create Event Section */}
        <CreateEventForm onSuccess={refetch} />

        {/* Status Tracker */}
        {events?.length > 0 && (
          <section className={styles.section} style={{ marginTop: '3rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 className={styles.sectionTitle} style={{ margin: 0 }}>Event Status Tracker</h2>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map(f => (
                  <button 
                    key={f}
                    onClick={() => setStatusFilter(f)}
                    style={{
                      background: statusFilter === f ? '#c9f28f' : 'transparent',
                      color: statusFilter === f ? '#000' : '#888',
                      border: statusFilter === f ? '1px solid #c9f28f' : '1px solid #333',
                      padding: '4px 12px', borderRadius: '20px', cursor: 'pointer',
                      fontSize: '0.8rem', fontWeight: statusFilter === f ? 600 : 400,
                      transition: 'all 0.2s'
                    }}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
            
            <div className={styles.eventTable}>
              <div className={styles.tableHeader}>
                <span>Event</span>
                <span>Date</span>
                <span>Registrations</span>
                <span>Status</span>
              </div>
              {filteredEvents.length === 0 && <div style={{ padding: '2rem', textAlign: 'center', color: '#555' }}>No events match this status.</div>}
              {filteredEvents.map(ev => (
                <React.Fragment key={`status-${ev.id}`}>
                  <div 
                    className={styles.tableRow} 
                    onClick={() => {
                       if (ev.status === 'REJECTED') {
                         setExpandedRow(expandedRow === ev.id ? null : ev.id);
                       } else if (ev.status === 'APPROVED') {
                         openRegistrants(ev);
                       }
                    }}
                    style={{ cursor: (ev.status === 'REJECTED' || ev.status === 'APPROVED') ? 'pointer' : 'default', borderBottom: expandedRow === ev.id ? 'none' : undefined }}
                  >
                    <span className={styles.eventName}>{ev.title}</span>
                    <span className={styles.eventDate}>
                      {ev.startTime ? new Date(ev.startTime).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}
                    </span>
                    <span className={styles.eventRegs}>{ev.registeredCount || 0} / {ev.maxParticipants || '∞'}</span>
                    <StatusBadge status={ev.status} />
                  </div>
                  {expandedRow === ev.id && (
                    <div style={{ background: 'rgba(255, 77, 79, 0.05)', padding: '1rem 1.5rem', borderLeft: '3px solid #ff4d4f', marginBottom: '8px', fontSize: '0.9rem', color: '#ffccc7', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <strong>Rejection Reason:</strong> {ev.rejectionReason || "No specific reason provided by faculty."}
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </section>
        )}
      </div>

      <Modal isOpen={!!registrantsModal} onClose={() => setRegistrantsModal(null)} title="Event Registrations" size="md">
        <div style={{ padding: '0.5rem 0 1rem', color: '#e5e7eb', fontSize: '0.95rem' }}>
          <p style={{ marginBottom: '1.5rem', color: '#9ca3af' }}>Viewing registered students for: <strong>{registrantsModal?.title}</strong></p>
          
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
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem', gap: '1rem' }}>
            <button 
               onClick={() => {
                 setRegistrantsModal(null);
                 window.location.href = `/clubhead/events/${registrantsModal?.id}/qr`;
               }} 
               className={styles.secondaryAction}
               style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}
            >
               Generate QR
            </button>
            <button onClick={() => setRegistrantsModal(null)} className={styles.primaryAction}>Close</button>
          </div>
        </div>
      </Modal>

    </AppLayout>
  );
}
