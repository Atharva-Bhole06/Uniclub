import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useApi } from '../../hooks/useApi';
import { eventsAPI } from '../../services/api';
import AppLayout from '../../components/AppLayout';
import EventCard from '../../components/EventCard';
import { LoadingSpinner, EmptyState, PageHeader } from '../../components/UI';
import { Calendar, Search } from 'lucide-react';
import styles from './Student.module.css';

const SORT_OPTIONS = [
  { value: 'date_asc',  label: 'Date (Soonest)' },
  { value: 'date_desc', label: 'Date (Latest)' },
];

export default function ExploreEvents() {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('date_asc');

  const { data: events, loading, error } = useApi(() => eventsAPI.getAll());

  const filtered = (events || [])
    .filter(e =>
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.description?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sort === 'date_asc') return new Date(a.startTime) - new Date(b.startTime);
      return new Date(b.startTime) - new Date(a.startTime);
    });

  return (
    <AppLayout>
      <div className={styles.page}>
        <PageHeader title="Explore Events" subtitle="Discover upcoming campus events" />

        <div className={styles.filterRow}>
          <div className={styles.searchBox}>
            <Search size={16} className={styles.searchIcon} />
            <input className={styles.searchInput} placeholder="Search events..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className={styles.sortSelect} value={sort} onChange={e => setSort(e.target.value)}>
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        {loading ? <LoadingSpinner /> : error ? (
          <EmptyState icon={Calendar} title="Failed to load events" description={error} />
        ) : filtered.length === 0 ? (
          <EmptyState icon={Calendar} title="No events found" description="Check back soon for upcoming events" />
        ) : (
          <motion.div
            className={styles.eventsGrid}
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
          >
            {filtered.map(ev => (
              <motion.div
                key={ev.id}
                variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } } }}
              >
                <EventCard event={ev} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
}
