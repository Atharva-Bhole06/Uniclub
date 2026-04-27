import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApi, useMutation } from '../../hooks/useApi';
import { clubsAPI } from '../../services/api';
import AppLayout from '../../components/AppLayout';
import ClubCard from '../../components/ClubCard';
import { LoadingSpinner, EmptyState, PageHeader, FormInput } from '../../components/UI';
import { Compass, Search } from 'lucide-react';
import styles from './Student.module.css';

const STREAMS = ['All', 'General', 'CS', 'IT', 'AIML', 'AIDS', 'EXTC', 'Mechanical', 'Civil'];
const CLUB_TYPES = ['All', 'Other', 'Technical', 'Sports', 'Cultural', 'Management', 'Social'];

export default function ExploreClubs() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [stream, setStream] = useState('All');
  const [type, setType] = useState('All');

  const { data: clubs, loading, error, refetch } = useApi(
    () => clubsAPI.getAll({
      stream: stream === 'All' ? undefined : stream,
      type: type === 'All' ? undefined : type
    }),
    [stream, type]
  );

  const { mutate: joinClub } = useMutation((id) => clubsAPI.join(id));

  const handleJoin = async (club) => {
    const { success } = await joinClub(club.id);
    if (success) refetch();
  };

  const filtered = clubs?.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.description?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <AppLayout>
      <div className={styles.page}>
        <PageHeader title="Explore Clubs" subtitle={`${clubs?.length || 0} clubs on campus`} />

        {/* Filters */}
        <div className={styles.filterRow}>
          <div className={styles.searchBox}>
            <Search size={16} className={styles.searchIcon} />
            <input
              className={styles.searchInput}
              placeholder="Search clubs..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className={styles.chips} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.9rem', color: '#a1a1aa' }}>Stream:</label>
              <select
                className={styles.searchInput}
                style={{ padding: '0.4rem 1rem', width: 'auto' }}
                value={stream}
                onChange={e => setStream(e.target.value)}
              >
                {STREAMS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.9rem', color: '#a1a1aa' }}>Type:</label>
              <select
                className={styles.searchInput}
                style={{ padding: '0.4rem 1rem', width: 'auto' }}
                value={type}
                onChange={e => setType(e.target.value)}
              >
                {CLUB_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
        </div>

        {loading ? <LoadingSpinner /> : (error || filtered.length === 0) ? (
          <EmptyState icon={Compass} title="No clubs found" description="Try adjusting your filters or search." />
        ) : (
          <motion.div
            className={styles.clubsGrid}
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
          >
            {filtered.map(club => (
              <motion.div
                key={club.id}
                variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } } }}
              >
                <ClubCard club={club} onJoin={handleJoin} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
}
