import React, { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import api from '../../services/api';
import AppLayout from '../../components/AppLayout';
import { LoadingSpinner, EmptyState, PageHeader, StatusBadge } from '../../components/UI';
import { BarChart2, Search } from 'lucide-react';
import styles from './Faculty.module.css';

function AttendanceDetailsView({ attendance }) {
  const [filterBranch, setFilterBranch] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterDiv, setFilterDiv] = useState('');
  const [searchRoll, setSearchRoll] = useState('');

  const filtered = attendance.filter(a => {
    const student = a.student || {};
    if (filterBranch && student.department !== filterBranch) return false;
    if (filterYear && student.year?.toString() !== filterYear) return false;
    if (filterDiv && a.division !== filterDiv) return false;
    if (searchRoll && !a.rollNo?.toLowerCase().includes(searchRoll.toLowerCase())) return false;
    return true;
  });

  const totalFiltered = filtered.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className={styles.attendanceStats} style={{ marginBottom: 0 }}>
        <div style={{ display: 'flex', gap: '2rem', width: '100%' }}>
          <div><span style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#c9f28f' }}>{attendance.length}</span><div style={{ color: '#888', fontSize: '0.85rem', textTransform: 'uppercase' }}>Total Present</div></div>
          <div><span style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{totalFiltered}</span><div style={{ color: '#888', fontSize: '0.85rem', textTransform: 'uppercase' }}>Matching Filters</div></div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', background: '#1a1a1a', padding: '15px', borderRadius: '8px', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 200px', display: 'flex', alignItems: 'center', background: '#222', padding: '0 10px', borderRadius: '6px' }}>
          <Search size={16} color="#888" />
          <input placeholder="Search Roll No..." value={searchRoll} onChange={e => setSearchRoll(e.target.value)} style={{ background: 'transparent', border: 'none', color: '#fff', padding: '8px', width: '100%', outline: 'none' }} />
        </div>
        <select value={filterBranch} onChange={e => setFilterBranch(e.target.value)} style={{ background: '#222', border: 'none', color: '#fff', padding: '8px 12px', borderRadius: '6px' }}>
          <option value="">All Branches</option>
          <option value="Computer Science">Computer Science</option>
          <option value="IT">IT</option>
          <option value="EXTC">EXTC</option>
        </select>
        <select value={filterYear} onChange={e => setFilterYear(e.target.value)} style={{ background: '#222', border: 'none', color: '#fff', padding: '8px 12px', borderRadius: '6px' }}>
          <option value="">All Years</option>
          <option value="1">1st Year</option>
          <option value="2">2nd Year</option>
          <option value="3">3rd Year</option>
          <option value="4">4th Year</option>
        </select>
        <input placeholder="Division (e.g. A)" value={filterDiv} onChange={e => setFilterDiv(e.target.value)} style={{ background: '#222', border: 'none', color: '#fff', padding: '8px 12px', borderRadius: '6px', width: '120px' }} />
      </div>

      <div style={{ background: '#1a1a1a', borderRadius: '8px', overflow: 'hidden' }}>
        {filtered.length === 0 ? <div style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>No records found matching filters.</div> : (
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead style={{ background: '#222', color: '#888' }}>
              <tr>
                <th style={{ padding: '12px' }}>Name / Email</th>
                <th style={{ padding: '12px' }}>Moodle ID</th>
                <th style={{ padding: '12px' }}>Branch & Year</th>
                <th style={{ padding: '12px' }}>Div/Roll</th>
                <th style={{ padding: '12px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(a => (
                <tr key={a.id} style={{ borderBottom: '1px solid #333' }}>
                  <td style={{ padding: '12px' }}>
                    <div style={{ fontWeight: '500', color: '#fff' }}>{a.student?.fullName}</div>
                    <div style={{ fontSize: '0.8rem', color: '#888' }}>{a.student?.email}</div>
                  </td>
                  <td style={{ padding: '12px', color: '#ccc' }}>{a.student?.moodleId || '-'}</td>
                  <td style={{ padding: '12px', color: '#ccc' }}>{a.student?.department} (Yr {a.student?.year})</td>
                  <td style={{ padding: '12px', fontWeight: 'bold', color: '#fff' }}>{a.division} - {a.rollNo}</td>
                  <td style={{ padding: '12px' }}><StatusBadge status="ATTENDED" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default function AttendanceMonitor() {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [attLoading, setAttLoading] = useState(false);

  const { data: events, loading: evLoading } = useApi(
    () => api.get('/faculty/events/approved')
  );

  const handleSelectEvent = async (ev) => {
    setSelectedEvent(ev);
    setAttLoading(true);
    setAttendance([]);
    try {
      const res = await api.get(`/attendance/event/${ev.id}`);
      setAttendance(res.data.data || []);
    } catch(err) {
      console.error("Failed to load attendance:", err);
      setAttendance([]);
    } finally {
      setAttLoading(false);
    }
  };

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
                  onClick={() => handleSelectEvent(ev)}
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
              <AttendanceDetailsView attendance={attendance?.data || attendance || []} />
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
