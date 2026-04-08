import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FormInput, Button } from '../../components/UI';
import { authAPI } from '../../services/api';
import axios from 'axios';

export default function AttendanceForm() {
  const { sessionId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [sessionData, setSessionData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [responses, setResponses] = useState({});
  const [rollNo, setRollNo] = useState('');
  const [division, setDivision] = useState('');

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await axios.get(`http://localhost:8080/api/attendance/${sessionId}`);
        setSessionData(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Error loading attendance form or expired.');
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, [sessionId]);

  const handleChange = (e) => {
    setResponses(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rollNo.trim() || !division.trim()) {
      alert("Please provide both Roll Number and Division.");
      return;
    }
    setSubmitting(true);
    try {
      await axios.post(`http://localhost:8080/api/attendance/${sessionId}/submit`, {
        studentId: user?.id,
        responses,
        rollNo: rollNo.trim(),
        division: division.trim()
      });
      setSuccess(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit attendance');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading form...</div>;

  if (error) return (
     <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--danger-main)' }}>
        <h2>Invalid Session</h2>
        <p>{error}</p>
        <Button onClick={() => navigate('/student/dashboard')} style={{marginTop: '1rem'}}>Go Back</Button>
     </div>
  );

  if (success) return (
     <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--success-main)' }}>
        <h2>Success!</h2>
        <p>Your attendance for {sessionData?.event?.title} has been recorded.</p>
        <Button onClick={() => navigate('/student/dashboard')} style={{marginTop: '1rem'}}>Back to Dashboard</Button>
     </div>
  );

  return (
    <div style={{ maxWidth: '600px', margin: '3rem auto', background: 'var(--surface)', padding: '2.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}>
      <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem', color: '#fff' }}>Event Attendance</h2>
      <h3 style={{ color: 'var(--success-main)', fontSize: '1.2rem', marginBottom: '1.5rem' }}>{sessionData?.event?.title}</h3>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Please review your basic information and complete any additional fields requested by the event organizers.</p>

      <div style={{ marginBottom: '2rem', padding: '1.5rem', background: '#1a1a1a', borderRadius: '12px', borderLeft: '4px solid var(--success-main)' }}>
        <h4 style={{ color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
           <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--success-main)" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
           Student Profile Details
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', color: '#ccc', fontSize: '0.95rem' }}>
           <div><strong style={{ color: '#888', display: 'block', fontSize: '0.8rem', textTransform: 'uppercase' }}>Full Name</strong><span style={{ color: '#fff' }}>{user?.fullName}</span></div>
           <div><strong style={{ color: '#888', display: 'block', fontSize: '0.8rem', textTransform: 'uppercase' }}>Email Address</strong><span style={{ color: '#fff' }}>{user?.email}</span></div>
           <div><strong style={{ color: '#888', display: 'block', fontSize: '0.8rem', textTransform: 'uppercase' }}>Moodle ID</strong><span style={{ color: '#fff' }}>{user?.moodleId || 'N/A'}</span></div>
           <div><strong style={{ color: '#888', display: 'block', fontSize: '0.8rem', textTransform: 'uppercase' }}>Dept & Year</strong><span style={{ color: '#fff' }}>{user?.department} - {user?.year}</span></div>
        </div>
        <p style={{ fontSize: '0.75rem', color: '#666', marginTop: '1rem', fontStyle: 'italic' }}>* This mandatory information is automatically captured for verified attendance.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '2rem', padding: '1.5rem', background: '#1a1a1a', borderRadius: '12px', borderLeft: '4px solid var(--success-main)' }}>
          <h4 style={{ color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--success-main)" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
             Verification Context
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
             <FormInput 
               label="Division" 
               value={division} 
               onChange={e => setDivision(e.target.value)} 
               placeholder="e.g. A"
               required 
             />
             <FormInput 
               label="Roll Number" 
               value={rollNo} 
               onChange={e => setRollNo(e.target.value)} 
               placeholder="e.g. 45"
               required 
             />
          </div>
        </div>

        {sessionData?.customFields && sessionData.customFields.length > 0 && (
           <div style={{ marginBottom: '2rem' }}>
             <h4 style={{ color: '#fff', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>Additional Information Required</h4>
             {sessionData.customFields.map((fieldStr, idx) => {
                let field = { question: fieldStr, required: true };
                try { field = JSON.parse(fieldStr); } catch(e) {}
                return (
                  <div key={idx} style={{ marginBottom: '1.5rem' }}>
                    <FormInput 
                       label={field.question + (field.required ? ' *' : ' (Optional)')}
                       name={field.question}
                       value={responses[field.question] || ''}
                       onChange={handleChange}
                       required={field.required}
                    />
                  </div>
                );
             })}
           </div>
        )}

        <Button type="submit" variant="primary" loading={submitting} style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', marginTop: '1rem' }}>
          Verify & Log Attendance
        </Button>
      </form>
    </div>
  );
}
