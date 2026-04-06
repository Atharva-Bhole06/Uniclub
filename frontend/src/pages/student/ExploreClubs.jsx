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

const CATEGORY_OPTIONS = ['All', 'Technical', 'Cultural', 'Sports', 'Literary', 'Social'];

export default function ExploreClubs() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const { data: clubs, loading, error, refetch } = useApi(
    () => clubsAPI.getAll({ category: category === 'All' ? undefined : category }),
    [category]
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
          <div className={styles.chips}>
            {CATEGORY_OPTIONS.map(cat => (
              <button
                key={cat}
                className={`${styles.chip} ${category === cat ? styles.chipActive : ''}`}
                onClick={() => setCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? <LoadingSpinner /> : (error || filtered.length === 0) ? (
          <EmptyState icon={Compass} title="No clubs available right now" description="Check back later for new clubs!" />
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
