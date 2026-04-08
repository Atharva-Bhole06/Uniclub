import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../../components/AppLayout';
import { PageHeader, FormInput, Button } from '../../components/UI';
import { facultyAPI } from '../../services/api';
import ClubCard from '../../components/ClubCard';
import { PlusCircle, Compass, Users } from 'lucide-react';

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
      setClubMsg({ type: 'success', text: 'Club created! An email was sent to the head.' });
      setClubForm({ name: '', description: '', studentEmail: '' });
      fetchMyClubs();
    } catch (err) {
      setClubMsg({ type: 'error', text: err?.response?.data?.message || 'Failed to create club' });
    }
  };

  return (
    <AppLayout>
      <PageHeader title="Create Club" subtitle="Initialize a new club and assign a Head directly" />
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2.5rem', marginTop: '2rem', alignItems: 'stretch' }}>
        
        {/* Form Column (Left Aligned) */}
        <div style={{ background: '#111', padding: '2rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column' }}>
          <form onSubmit={handleCreateClub} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', textAlign: 'left', flex: 1 }}>
            {clubMsg && (
              <div style={{ 
                padding: '1rem', borderRadius: '10px', 
                background: clubMsg.type === 'error' ? 'rgba(255, 77, 79, 0.1)' : 'rgba(201, 242, 143, 0.1)',
                color: clubMsg.type === 'error' ? '#ff4d4f' : '#c9f28f', 
                border: `1px solid ${clubMsg.type === 'error' ? '#ff4d4f' : '#c9f28f'}`
              }}>
                {clubMsg.text}
              </div>
            )}
            <FormInput label="Club Name *" required value={clubForm.name} onChange={e => setClubForm({...clubForm, name: e.target.value})} placeholder="e.g. Coding Club" />
            <FormInput label="Description *" required value={clubForm.description} onChange={e => setClubForm({...clubForm, description: e.target.value})} placeholder="What's this club about?" />
            <FormInput label="Student Email (Head) *" type="email" required value={clubForm.studentEmail} onChange={e => setClubForm({...clubForm, studentEmail: e.target.value})} placeholder="student@university.edu" />
            
            <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
              <Button type="submit"><PlusCircle size={16} /> Create Club & Assign Head</Button>
            </div>
          </form>
        </div>

        {/* Helpful Info Column (Fills empty space beautifully) */}
        <div style={{ background: 'linear-gradient(145deg, #18181b, #0f0f12)', padding: '2rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.03)', display: 'flex', flexDirection: 'column' }}>
           <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
             <Compass size={18} color="#c9f28f" />
             Quick Guide
           </h3>
           <p style={{ color: '#9ca3af', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
             Creating a club immediately registers it on the student platform.
           </p>
           
           <h4 style={{ color: '#ddd', fontSize: '0.95rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Users size={15} color="#3b82f6" /> About Club Heads
           </h4>
           <p style={{ color: '#71717a', fontSize: '0.85rem', lineHeight: '1.5' }}>
             The student you specify will automatically be promoted to the 'Club Head' role. They will receive an email notifying them. Once they log in, they can customize the club poster, description, and start proposing events to you.
           </p>
        </div>

      </div>

      <div style={{ marginTop: '4rem' }}>
        <h2 style={{ color: '#fff', fontSize: '1.3rem', marginBottom: '1.5rem', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '4px', height: '20px', background: '#c9f28f', borderRadius: '4px' }}></div>
          Manage Your Clubs
        </h2>
        
        {myClubs.length === 0 ? (
          <p style={{ color: '#555', textAlign: 'left' }}>You haven't created any clubs yet.</p>
        ) : (
          <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
            {myClubs.map(club => (
              <ClubCard key={club.id} club={club} showHeadInfo />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
