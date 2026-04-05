import React, { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { eventsAPI, attendanceAPI } from '../../services/api';
import AppLayout from '../../components/AppLayout';
import { LoadingSpinner, EmptyState, PageHeader, StatusBadge } from '../../components/UI';
import { BarChart2, Users, CheckCircle, XCircle } from 'lucide-react';
import styles from './Faculty.module.css';

export default function AttendanceMonitor() {
  const [selectedEvent, setSelectedEvent] = useState(null);

  const { data: events, loading: evLoading } = useApi(() => eventsAPI.getAll({ approved: true }));
  const { data: attendance, loading: attLoading } = useApi(
    () => selectedEvent ? attendanceAPI.getByEvent(selectedEvent.id) : Promise.resolve({ data: [] }),
    [selectedEvent?.id]
  );

  const attendedCount = attendance?.filter(a => a.attended).length || 0;
  const totalCount = attendance?.length || 0;
  const rate = totalCount > 0 ? Math.round((attendedCount / totalCount) * 100) : 0;

  return (
    <AppLayout>
      <div className={styles.page}>
        <PageHeader title="Attendance Monitor" subtitle="Track student attendance per event" />

        <div className={styles.attendanceLayout}>
          {/* Event List */}
          <div className={styles.eventsList}>
            <h3 className={styles.panelTitle}>Select Event</h3>
            {evLoading ? <LoadingSpinner /> : !events?.length
              ? <EmptyState icon={BarChart2} title="No events available" />
              : events.map(ev => (
                <div
                  key={ev.id}
                  className={`${styles.eventSelectRow} ${selectedEvent?.id === ev.id ? styles.selected : ''}`}
                  onClick={() => setSelectedEvent(ev)}
                >
                  <div>
                    <p className={styles.eventSelectTitle}>{ev.title}</p>
                    <p className={styles.eventSelectDate}>{new Date(ev.startTime).toLocaleDateString('en-IN', { day:'numeric', month:'short' })}</p>
                  </div>
                  <span style={{ color: '#6b7280', fontSize: '0.8rem' }}>{ev.registeredCount || 0} registered</span>
                </div>
              ))
            }
          </div>

          {/* Attendance Panel */}
          <div className={styles.attendancePanel}>
            {!selectedEvent ? (
              <div className={styles.selectPrompt}>← Select an event to view attendance</div>
            ) : attLoading ? <LoadingSpinner /> : (
              <>
                <div className={styles.attendanceStats}>
                  <div className={styles.rateCircle}>
                    <span className={styles.rateNum}>{rate}%</span>
                    <span className={styles.rateLabel}>Attendance Rate</span>
                  </div>
                  <div className={styles.attendanceCounts}>
                    <div><span className={styles.countNum} style={{ color: '#c9f28f' }}>{attendedCount}</span><span className={styles.countLabel}>Attended</span></div>
                    <div><span className={styles.countNum} style={{ color: '#ef4444' }}>{totalCount - attendedCount}</span><span className={styles.countLabel}>Absent</span></div>
                    <div><span className={styles.countNum}>{totalCount}</span><span className={styles.countLabel}>Total</span></div>
                  </div>
                </div>

                <div className={styles.studentList}>
                  {!attendance?.length
                    ? <EmptyState icon={Users} title="No registrations" />
                    : attendance.map(a => (
                      <div key={a.userId} className={styles.studentRow}>
                        <div className={styles.studentAvatar}>{a.userName?.[0]?.toUpperCase()}</div>
                        <div className={styles.studentInfo}>
                          <p className={styles.studentName}>{a.userName}</p>
                          <p className={styles.studentEmail}>{a.userEmail}</p>
                        </div>
                        <div className={styles.attendanceMark}>
                          {a.attended
                            ? <CheckCircle size={20} color="#c9f28f" />
                            : <XCircle size={20} color="#ef4444" />
                          }
                          <StatusBadge status={a.attended ? 'ATTENDED' : 'ABSENT'} />
                        </div>
                      </div>
                    ))
                  }
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
