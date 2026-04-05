import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import { eventsAPI } from '../../services/api';
import AppLayout from '../../components/AppLayout';
import { LoadingSpinner, EmptyState, PageHeader, StatusBadge, Button } from '../../components/UI';
import { Calendar, Plus, Edit } from 'lucide-react';
import styles from './ClubHead.module.css';

export default function ManageEvents() {
  const navigate = useNavigate();
  const { data: events, loading } = useApi(() => eventsAPI.getAll({ myClub: true }));

  return (
    <AppLayout>
      <div className={styles.page}>
        <PageHeader
          title="Manage Events"
          subtitle="Track all your club's events"
          action={<Button variant="primary" onClick={() => navigate('/clubhead/create-event')}><Plus size={15} /> Create Event</Button>}
        />

        {loading ? <LoadingSpinner /> : !events?.length
          ? <EmptyState icon={Calendar} title="No events yet" description="Start by creating your first event" action={<Button variant="primary" onClick={() => navigate('/clubhead/create-event')}><Plus size={14} /> Create Event</Button>} />
          : (
            <div className={styles.manageList}>
              {events.map(ev => (
                <div key={ev.id} className={styles.manageRow}>
                  <div className={styles.manageImg}>
                    <img src={ev.imageUrl || '/images/default-event.png'} alt={ev.title} />
                  </div>
                  <div className={styles.manageInfo}>
                    <h3 className={styles.manageTitle}>{ev.title}</h3>
                    <p className={styles.manageMeta}>
                      {new Date(ev.startTime).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })} · {ev.venue}
                    </p>
                    <p className={styles.manageMeta}>{ev.registeredCount || 0} registered</p>
                  </div>
                  <div className={styles.manageActions}>
                    <StatusBadge status={ev.status} />
                    {ev.status === 'REJECTED' && (
                      <span className={styles.rejectReason}>Reason: {ev.rejectionReason || 'Not specified'}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        }
      </div>
    </AppLayout>
  );
}
