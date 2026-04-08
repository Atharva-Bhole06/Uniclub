import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../../components/AppLayout';
import { PageHeader, LoadingSpinner } from '../../components/UI';
import ClubCard from '../../components/ClubCard';
import EventCard from '../../components/EventCard';
import { clubsAPI, eventsAPI } from '../../services/api';
import styles from './ClubHead.module.css';

export default function ClubHeadDashboard() {
  const navigate = useNavigate();

  const [clubs, setClubs] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch clubs
      const clubsRes = await clubsAPI.getAll();
      setClubs(Array.isArray(clubsRes.data) ? clubsRes.data : []);

      // Fetch upcoming events from student API which filters startTime >= now
      const upRes = await fetch("http://localhost:8080/api/student/events/upcoming");
      if (upRes.ok) {
        setUpcomingEvents(await upRes.json());
      }

      // Fetch all approved events
      const eventsRes = await eventsAPI.getAll();
      const allEventsData = Array.isArray(eventsRes.data) ? eventsRes.data : [];
      setAllEvents(allEventsData.filter(e => e.status !== 'REJECTED'));
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
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
  const gridStyle = { display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(3, 1fr)' };

  if (loading) {
    return (
      <AppLayout>
        <div className={styles.page} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <LoadingSpinner />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className={styles.page}>
        <PageHeader title="Platform Dashboard" subtitle="Overview of campus clubs and events" />

        {/* 1. Clubs */}
        <div style={headerRowStyle}>
          <h2 style={titleStyle}>Clubs</h2>
          <button className="viewAllBtn" onClick={() => navigate('/clubhead/explore-clubs')}>
            View All
          </button>
        </div>
        <div style={gridStyle}>
          {clubs.slice(0, 3).map(club => (
            <ClubCard key={club.id} club={club} showHeadInfo={false} />
          ))}
        </div>

        {/* 2. Upcoming Events */}
        <div style={headerRowStyle}>
          <h2 style={titleStyle}>Upcoming Events</h2>
          <button className="viewAllBtn" onClick={() => navigate('/clubhead/explore-events')}>
            View All
          </button>
        </div>
        <div style={gridStyle}>
          {upcomingEvents.slice(0, 3).map(event => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>

        {/* 3. All Events */}
        <div style={headerRowStyle}>
          <h2 style={titleStyle}>All Events</h2>
          <button className="viewAllBtn" onClick={() => navigate('/clubhead/explore-events')}>
            View All
          </button>
        </div>
        <div style={gridStyle}>
          {allEvents.slice(0, 3).map(event => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
