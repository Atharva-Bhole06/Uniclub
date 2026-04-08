import React, { useState } from 'react';
import { useApi, useMutation } from '../../hooks/useApi';
import { eventsAPI } from '../../services/api';
import AppLayout from '../../components/AppLayout';
import Modal from '../../components/Modal';
import { LoadingSpinner, EmptyState, PageHeader, FormTextarea, Button } from '../../components/UI';
import { CheckSquare, Calendar, MapPin, Users, Clock, CheckCircle, XCircle } from 'lucide-react';
import styles from './Faculty.module.css';

const BACKEND = 'http://localhost:8080';

export default function EventApproval() {
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const { data: events, loading, refetch } = useApi(() => eventsAPI.getPending());
  const { mutate: approveEvent, loading: approving } = useMutation((id) => eventsAPI.approve(id));
  const { mutate: rejectEvent, loading: rejecting } = useMutation(({ id, reason }) => eventsAPI.reject(id, reason));

  const handleApprove = async (id) => {
    const { success } = await approveEvent(id);
    if (success) refetch();
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) return;
    const { success } = await rejectEvent({ id: rejectModal.id, reason: rejectReason });
    if (success) { setRejectModal(null); setRejectReason(''); refetch(); }
  };

  return (
    <AppLayout>
      <div className={styles.page}>
        <PageHeader
          title="Event Approvals"
          subtitle={`${events?.length || 0} events pending review`}
        />

        {loading ? <LoadingSpinner /> : !events?.length
          ? <EmptyState icon={CheckSquare} title="All caught up!" description="No events pending approval" />
          : (
            <div className={styles.approvalList}>
              {events.map(ev => (
                <div key={ev.id} className={styles.approvalCard}>
                  <div className={styles.approvalImg}>
                    <img 
                      src={ev.posterUrl ? `${BACKEND}/${ev.posterUrl}` : ev.imageUrl || '/images/default-event.png'} 
                      alt={ev.title} 
                    />
                  </div>
                  <div className={styles.approvalInfo}>
                    <span className={styles.clubBadge}>{ev.club?.name || ev.clubName || 'Unknown Club'}</span>
                    <h3 className={styles.approvalTitle}>{ev.title}</h3>
                    <p className={styles.approvalDesc}>{ev.description}</p>
                    <div className={styles.approvalMeta}>
                      <span><Calendar size={13} /> {ev.startTime ? new Date(ev.startTime).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</span>
                      <span><Clock size={13} /> {ev.startTime && ev.endTime ? `${new Date(ev.startTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} – ${new Date(ev.endTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}` : ev.startTime ? new Date(ev.startTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'}</span>
                      <span><MapPin size={13} /> {ev.venue || ev.location || 'TBA'}</span>
                    </div>
                  </div>
                  <div className={styles.approvalActions}>
                    <Button variant="accent" onClick={() => handleApprove(ev.id)} loading={approving}>
                      <CheckCircle size={16} /> Approve
                    </Button>
                    <Button variant="danger" onClick={() => setRejectModal(ev)}>
                      <XCircle size={16} /> Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )
        }
      </div>

      {/* Reject Modal */}
      <Modal isOpen={!!rejectModal} onClose={() => setRejectModal(null)} title={`Reject: ${rejectModal?.title}`} size="sm">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <p style={{ color: '#9ca3af', fontSize: '0.9rem', margin: 0 }}>Provide a reason for rejection. This will be visible to the club head.</p>
          <FormTextarea
            label="Rejection Reason *"
            placeholder="e.g. Venue not available, please resubmit with a different date."
            value={rejectReason}
            onChange={e => setRejectReason(e.target.value)}
            rows={4}
          />
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <Button variant="secondary" onClick={() => setRejectModal(null)}>Cancel</Button>
            <Button variant="danger" loading={rejecting} onClick={handleReject} disabled={!rejectReason.trim()}>
              Confirm Rejection
            </Button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}
