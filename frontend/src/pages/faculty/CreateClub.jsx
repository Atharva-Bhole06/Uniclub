import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../../components/AppLayout';
import { PageHeader, FormInput, Button } from '../../components/UI';
import { facultyAPI } from '../../services/api';
import ClubCard from '../../components/ClubCard';

const cardStyle = {
  background: '#111',
  padding: '2rem',
  borderRadius: '20px',
  border: '1px solid rgba(255,255,255,0.06)',
  maxWidth: '600px',
  margin: '2rem auto'
};

export default function CreateClub() {
  const navigate = useNavigate();
  const [clubForm, setClubForm] = useState({ name: '', description: '', studentEmail: '' });
  const [clubMsg, setClubMsg] = useState('');
  const [myClubs, setMyClubs] = useState([]);

  React.useEffect(() => {
    fetchMyClubs();
  }, []);

  const fetchMyClubs = async () => {
    try {
      const clubsRes = await facultyAPI.getMyClubs();
      setMyClubs(Array.isArray(clubsRes.data) ? clubsRes.data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateClub = async (e) => {
    e.preventDefault();
    try {
      await facultyAPI.createClubWithHead(clubForm);
      setClubMsg({ type: 'success', text: 'Club created and head assigned successfully!' });
      setClubForm({ name: '', description: '', studentEmail: '' });
      fetchMyClubs();
    } catch (err) {
      setClubMsg({ type: 'error', text: err?.response?.data?.message || 'Failed to create club' });
    }
  };

  return (
    <AppLayout>
      <PageHeader title="Create Club" subtitle="Initialize a new club and assign a Head directly" />
      <div style={cardStyle}>
        <form onSubmit={handleCreateClub} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {clubMsg && <div style={{ color: clubMsg.type === 'error' ? '#ff4d4f' : '#c9f28f', fontSize: '0.9rem' }}>{clubMsg.text}</div>}
          <FormInput label="Club Name" required value={clubForm.name} onChange={e => setClubForm({...clubForm, name: e.target.value})} />
          <FormInput label="Description" required value={clubForm.description} onChange={e => setClubForm({...clubForm, description: e.target.value})} />
          <FormInput label="Student Email (Head)" type="email" required value={clubForm.studentEmail} onChange={e => setClubForm({...clubForm, studentEmail: e.target.value})} />
          <div style={{ marginTop: '0.5rem' }}>
            <Button type="submit">Create Club</Button>
          </div>
        </form>
      </div>

      <div style={{ marginTop: '4rem', maxWidth: '1000px', marginLeft: 'auto', marginRight: 'auto' }}>
        <h2 style={{ color: '#fff', fontSize: '1.5rem', marginBottom: '1.5rem', textAlign: 'center' }}>Manage Your Clubs</h2>
        
        {myClubs.length === 0 ? (
          <p style={{ color: '#888', textAlign: 'center' }}>You haven't created any clubs yet.</p>
        ) : (
          <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
            {myClubs.map(club => (
              <ClubCard key={club.id} club={club} showHeadInfo />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
