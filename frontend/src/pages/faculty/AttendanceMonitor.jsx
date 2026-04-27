import React, { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import api from '../../services/api';
import AppLayout from '../../components/AppLayout';
import { LoadingSpinner, EmptyState, PageHeader, StatusBadge } from '../../components/UI';
import { BarChart2, Search } from 'lucide-react';
import styles from './Faculty.module.css';

function AttendanceDetailsView({ attendance, selectedEvent }) {
  const [filterBranch, setFilterBranch] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterDiv, setFilterDiv] = useState('');
  const [searchRoll, setSearchRoll] = useState('');
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams();
      if (filterBranch) params.append('branch', filterBranch);
      if (filterYear) params.append('year', filterYear);
      if (filterDiv) params.append('division', filterDiv);
      if (searchRoll) params.append('searchRoll', searchRoll);

      const response = await api.get(`/faculty/attendance/export/${selectedEvent.id}?${params.toString()}`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const safeTitle = selectedEvent.title.replace(/[^a-zA-Z0-9]/g, '_');
      const dateStr = new Date(selectedEvent.startTime).toISOString().split('T')[0];
      link.setAttribute('download', `Attendance_${safeTitle}_${dateStr}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      console.error("Export failed:", err);
      alert("Failed to export attendance data.");
    } finally {
      setExporting(false);
    }
  };

  const filtered = attendance.filter(a => {
    const student = a.student || {};
    if (filterBranch && student.department?.toLowerCase() !== filterBranch.toLowerCase()) return false;
    if (filterYear && student.year?.toLowerCase() !== filterYear.toLowerCase()) return false;
    if (filterDiv && a.division !== filterDiv) return false;
    if (searchRoll && !a.rollNo?.toLowerCase().includes(searchRoll.toLowerCase())) return false;
    return true;
  });

  const totalFiltered = filtered.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className={styles.attendanceStats} style={{ marginBottom: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '2rem' }}>
          <div><span style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#c9f28f' }}>{selectedEvent?.registeredCount || 0}</span><div style={{ color: '#888', fontSize: '0.85rem', textTransform: 'uppercase' }}>Total Registered</div></div>
          <div><span style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{attendance.length}</span><div style={{ color: '#888', fontSize: '0.85rem', textTransform: 'uppercase' }}>Total Present</div></div>
        </div>
        <button 
          onClick={handleExport} 
          disabled={exporting}
          style={{ background: '#c9f28f', color: '#000', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: exporting ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap', transition: 'opacity 0.2s' }}
        >
          {exporting ? 'Generating...' : 'Download Excel'}
        </button>
      </div>

      <div style={{ display: 'flex', gap: '10px', background: '#1a1a1a', padding: '15px', borderRadius: '8px', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 200px', display: 'flex', alignItems: 'center', background: '#222', padding: '0 10px', borderRadius: '6px' }}>
          <Search size={16} color="#888" />
          <input placeholder="Search Roll No..." value={searchRoll} onChange={e => setSearchRoll(e.target.value)} style={{ background: 'transparent', border: 'none', color: '#fff', padding: '8px', width: '100%', outline: 'none' }} />
        </div>
        <select value={filterBranch} onChange={e => setFilterBranch(e.target.value)} style={{ background: '#222', border: 'none', color: '#fff', padding: '8px 12px', borderRadius: '6px' }}>
          <option value="">All Branches</option>
          <option value="CS">CS</option>
          <option value="IT">IT</option>
          <option value="AIML">AIML</option>
          <option value="EXTC">EXTC</option>
        </select>
        <select value={filterYear} onChange={e => setFilterYear(e.target.value)} style={{ background: '#222', border: 'none', color: '#fff', padding: '8px 12px', borderRadius: '6px' }}>
          <option value="">All Years</option>
          <option value="FE">FE</option>
          <option value="SE">SE</option>
          <option value="TE">TE</option>
          <option value="BE">BE</option>
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
  const [selectedClub, setSelectedClub] = useState('');

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

  const uniqueClubs = Array.from(new Set(events?.map(ev => ev.club?.name || ev.clubName).filter(Boolean)));
  const filteredEvents = events?.filter(ev => {
    const clubName = ev.club?.name || ev.clubName;
    if (selectedClub && clubName !== selectedClub) return false;
    return true;
  })?.sort((a, b) => new Date(b.startTime) - new Date(a.startTime)) || [];
  const displayEvents = filteredEvents.slice(0, 7);

  return (
    <AppLayout>
      <div className={styles.page}>
        <PageHeader title="Attendance Monitor" subtitle="Track student attendance per event" />

        <div className={styles.attendanceLayout}>
          {/* Event List */}
          <div className={styles.eventsList}>
            <div style={{ marginBottom: '1.2rem' }}>
              <select value={selectedClub} onChange={e => setSelectedClub(e.target.value)} style={{ width: '100%', padding: '10px 12px', background: '#222', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', outline: 'none' }}>
                <option value="">All Clubs</option>
                {uniqueClubs.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <h3 className={styles.panelTitle} style={{ marginBottom: '1rem', fontSize: '1rem' }}>Recent Events</h3>
            {evLoading ? <LoadingSpinner /> : !displayEvents.length
              ? <EmptyState icon={BarChart2} title="No events available" />
              : displayEvents.map(ev => (
                <div
                  key={ev.id}
                  className={`${styles.eventSelectRow} ${selectedEvent?.id === ev.id ? styles.selected : ''}`}
                  onClick={() => handleSelectEvent(ev)}
                >
                  <div>
                    <p className={styles.eventSelectTitle}>{ev.title}</p>
                    <p className={styles.eventSelectDate}>{new Date(ev.startTime).toLocaleDateString('en-IN', { day:'numeric', month:'short' })}</p>
                  </div>
                </div>
              ))
            }
          </div>

          {/* Attendance Panel */}
          <div className={styles.attendancePanel}>
            {!selectedEvent ? (
              <div className={styles.selectPrompt}>← Select an event to view attendance</div>
            ) : attLoading ? <LoadingSpinner /> : (
              <AttendanceDetailsView attendance={attendance?.data || attendance || []} selectedEvent={selectedEvent} />
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
