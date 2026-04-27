import React, { useState, useEffect } from 'react';
import { headClubAPI } from '../../services/api';
import AppLayout from '../../components/AppLayout';
import { LoadingSpinner, EmptyState, PageHeader } from '../../components/UI';
import { Users, CheckCircle, XCircle, ArrowUpCircle } from 'lucide-react';
import styles from './ClubHead.module.css';

export default function Volunteers() {
  const [club, setClub] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('PENDING'); // PENDING or ACCEPTED
  
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewTime, setInterviewTime] = useState('');

  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const clubRes = await headClubAPI.getMyClub();
      setClub(clubRes.data);
      setInterviewDate(clubRes.data.interviewDate || '');
      setInterviewTime(clubRes.data.interviewTime || '');

      const appRes = await headClubAPI.getVolunteers();
      setApplications(appRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleHiring = async (hiringOpen) => {
    try {
      await headClubAPI.toggleHiring({ hiringOpen, interviewDate, interviewTime });
      showToast(hiringOpen ? "Hiring is now OPEN!" : "Hiring has been CLOSED", "success");
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to toggle hiring', "error");
    }
  };

  const handleSaveInterviewDetails = async () => {
    if (!club) return;
    try {
      await headClubAPI.toggleHiring({ hiringOpen: club.hiringOpen, interviewDate, interviewTime });
      showToast('Interview details saved!', "success");
    } catch (err) {
      showToast('Failed to save interview details', "error");
    }
  };

  const handleStatusUpdate = async (appId, status) => {
    try {
      await headClubAPI.updateApplicationStatus(appId, status);
      showToast(`Application ${status.toLowerCase()} successfully`, "success");
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update application', "error");
    }
  };

  const handlePromote = async (userId) => {
    if (!window.confirm("Are you sure you want to promote this volunteer to Co-Head?")) return;
    try {
      await headClubAPI.promoteToCoHead(userId);
      showToast('Volunteer promoted to Co-Head successfully!', "success");
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to promote', "error");
    }
  };

  const pendingApps = applications.filter(a => a.status === 'PENDING');
  const acceptedApps = [
    ...(club?.head ? [{ id: 'head-record', isHead: true, user: club.head, role: 'Head', status: 'ACCEPTED' }] : []),
    ...applications.filter(a => a.status === 'ACCEPTED')
  ];

  if (loading) return <AppLayout><div className={styles.page} style={{ display: 'flex', justifyContent: 'center', height: '60vh', alignItems: 'center' }}><LoadingSpinner /></div></AppLayout>;

  return (
    <AppLayout>
      <div className={styles.page}>
        <PageHeader title="Hiring & Volunteers" subtitle="Manage your club's volunteer applications and team" />

        {/* Hiring Controls */}
        <div className={styles.hiringControlsBox} style={{ background: '#18181b', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem', border: '1px solid #27272a' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ color: '#fff', margin: 0, fontSize: '1.2rem' }}>Hiring Status: <span style={{ color: club?.hiringOpen ? '#22c55e' : '#ef4444' }}>{club?.hiringOpen ? 'OPEN' : 'CLOSED'}</span></h3>
              <p style={{ color: '#a1a1aa', fontSize: '0.9rem', marginTop: '0.5rem', marginBottom: 0 }}>
                {club?.hiringOpen ? "Students can apply and will see interview details." : "Students cannot apply for volunteer positions."}
              </p>
            </div>
            <button 
              style={{
                padding: '0.6rem 1.2rem',
                borderRadius: '8px',
                border: 'none',
                background: club?.hiringOpen ? '#ef4444' : '#22c55e',
                color: '#fff',
                fontWeight: '600',
                cursor: 'pointer'
              }}
              onClick={() => handleToggleHiring(!club?.hiringOpen)}
            >
              {club?.hiringOpen ? 'Close Hiring' : 'Open Hiring'}
            </button>
          </div>

          {club?.hiringOpen && (
            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                <label style={{ color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '0.5rem', display: 'block' }}>Interview Date</label>
                <input type="date" className={styles.inputField} value={interviewDate} onChange={e => setInterviewDate(e.target.value)} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '0.5rem', display: 'block' }}>Interview Time</label>
                <input type="time" className={styles.inputField} value={interviewTime} onChange={e => setInterviewTime(e.target.value)} />
              </div>
              <button className={styles.primaryAction} style={{ height: '42px', padding: '0 1.5rem' }} onClick={handleSaveInterviewDetails}>
                Save Details
              </button>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid #27272a', paddingBottom: '0.5rem' }}>
          <button 
            style={{ background: 'transparent', border: 'none', color: activeTab === 'PENDING' ? '#00e5ff' : '#a1a1aa', fontWeight: '600', fontSize: '1rem', cursor: 'pointer', paddingBottom: '0.5rem', borderBottom: activeTab === 'PENDING' ? '2px solid #00e5ff' : 'none' }}
            onClick={() => setActiveTab('PENDING')}
          >
            Applications ({pendingApps.length})
          </button>
          <button 
            style={{ background: 'transparent', border: 'none', color: activeTab === 'ACCEPTED' ? '#22c55e' : '#a1a1aa', fontWeight: '600', fontSize: '1rem', cursor: 'pointer', paddingBottom: '0.5rem', borderBottom: activeTab === 'ACCEPTED' ? '2px solid #22c55e' : 'none' }}
            onClick={() => setActiveTab('ACCEPTED')}
          >
            Members ({acceptedApps.length})
          </button>
        </div>

        {/* Content */}
        {activeTab === 'PENDING' && (
          pendingApps.length === 0 ? <EmptyState icon={Users} title="No pending applications" description="When students apply, they will appear here." /> :
          <div className={styles.volunteerList}>
            {pendingApps.filter(app => app.user != null).map(app => (
              <div key={app.id} className={styles.volunteerRow} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#18181b', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                <div>
                  <h4 style={{ margin: 0, color: '#fff' }}>{app.user.fullName} <span style={{ fontSize: '0.8rem', background: '#3f3f46', padding: '0.2rem 0.5rem', borderRadius: '12px', marginLeft: '0.5rem' }}>{app.role}</span></h4>
                  <p style={{ margin: '0.3rem 0 0', color: '#a1a1aa', fontSize: '0.9rem' }}>{app.user.email} • ID: {app.user.moodleId}</p>
                </div>
                <div style={{ display: 'flex', gap: '0.8rem' }}>
                  <button onClick={() => handleStatusUpdate(app.id, 'ACCEPTED')} style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#22c55e', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '600' }}>
                    <CheckCircle size={16} /> Accept
                  </button>
                  <button onClick={() => handleStatusUpdate(app.id, 'REJECTED')} style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '600' }}>
                    <XCircle size={16} /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'ACCEPTED' && (
          acceptedApps.length === 0 ? <EmptyState icon={Users} title="No volunteers accepted yet" description="Accept applications to build your team." /> :
          <div className={styles.volunteerList}>
            {acceptedApps.filter(app => app.user != null).map(app => (
              <div key={app.id} className={styles.volunteerRow} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#18181b', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                <div>
                  <h4 style={{ margin: 0, color: '#fff' }}>{app.user.fullName} <span style={{ fontSize: '0.8rem', background: '#3f3f46', padding: '0.2rem 0.5rem', borderRadius: '12px', marginLeft: '0.5rem', color: '#00e5ff' }}>{app.role}</span></h4>
                  <p style={{ margin: '0.3rem 0 0', color: '#a1a1aa', fontSize: '0.9rem' }}>{app.user.email}</p>
                </div>
                <div>
                  {app.isHead ? (
                     <span style={{ color: '#c9f28f', fontSize: '0.85rem', fontWeight: '600', padding: '0.4rem 0.8rem', background: 'rgba(201,242,143,0.1)', borderRadius: '6px' }}>Primary Head</span>
                  ) : (app.user.role === 'CLUB_HEAD' || app.user.role === 'CO_HEAD') ? (
                     <span style={{ color: '#00e5ff', fontSize: '0.85rem', fontWeight: '600', padding: '0.4rem 0.8rem', background: 'rgba(0,229,255,0.1)', borderRadius: '6px' }}>Co-Head</span>
                  ) : (
                    <button onClick={() => handlePromote(app.user.id)} style={{ background: '#27272a', color: '#fff', border: '1px solid #3f3f46', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem' }}>
                      <ArrowUpCircle size={15} /> Promote to Co-Head
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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
