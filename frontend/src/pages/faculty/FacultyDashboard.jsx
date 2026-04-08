import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../../components/AppLayout';
import { PageHeader } from '../../components/UI';
import ClubCard from '../../components/ClubCard';
import EventCard from '../../components/EventCard';
import { clubsAPI, eventsAPI } from '../../services/api';

import styles from '../clubhead/ClubHead.module.css';

export default function FacultyDashboard() {
  const navigate = useNavigate();
  const [clubs, setClubs] = useState([]);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const clubsRes = await clubsAPI.getAll();
      setClubs(Array.isArray(clubsRes.data) ? clubsRes.data : []);

      const eventsRes = await eventsAPI.getAll();
      const allEventsData = Array.isArray(eventsRes.data) ? eventsRes.data : [];
      setEvents(allEventsData.filter(e => e.status !== 'REJECTED'));
    } catch (err) {
      console.error(err);
    }
  };

  const headerRowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
    marginTop: '3rem'
  };

  const titleStyle = { color: '#fff', fontSize: '1.4rem', margin: 0, fontWeight: 600 };

  return (
    <AppLayout>
      <PageHeader title="Platform Overview" subtitle="Monitor all university clubs and recent events" />

      {/* Clubs Section */}
      <div style={headerRowStyle}>
        <h2 style={titleStyle}>Clubs</h2>
        <button className="viewAllBtn" onClick={() => navigate('/student/clubs')}>View All</button>
      </div>
      <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(3, 1fr)' }}>
        {clubs.slice(0, 3).map(club => (
          <ClubCard key={club.id} club={club} showHeadInfo />
        ))}
      </div>

      {/* Events Section */}
      <div style={headerRowStyle}>
        <h2 style={titleStyle}>Events</h2>
        <button className="viewAllBtn" onClick={() => navigate('/student/events')}>View All</button>
      </div>
      <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(3, 1fr)' }}>
        {events.slice(0, 3).map(event => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </AppLayout>
  );
}
