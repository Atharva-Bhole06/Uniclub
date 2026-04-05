import React, { useState } from 'react';
import { useApi, useMutation } from '../../hooks/useApi';
import { volunteersAPI, clubsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import AppLayout from '../../components/AppLayout';
import { LoadingSpinner, EmptyState, PageHeader, FormInput, Button } from '../../components/UI';
import { Users, Plus, Trash2 } from 'lucide-react';
import styles from './ClubHead.module.css';

export default function Volunteers() {
  const { user } = useAuth();
  const clubId = user?.clubId;
  const [email, setEmail] = useState('');

  const { data: volunteers, loading, refetch } = useApi(() => volunteersAPI.getAll(clubId), [clubId]);
  const { mutate: addVolunteer, loading: adding } = useMutation((u) => volunteersAPI.add(clubId, u));
  const { mutate: removeVolunteer } = useMutation((uid) => volunteersAPI.remove(clubId, uid));

  const handleAdd = async (e) => {
    e.preventDefault();
    const { success } = await addVolunteer({ email });
    if (success) { setEmail(''); refetch(); }
  };

  const handleRemove = async (uid) => {
    const { success } = await removeVolunteer(uid);
    if (success) refetch();
  };

  return (
    <AppLayout>
      <div className={styles.page}>
        <PageHeader title="Volunteers" subtitle="Manage club volunteers and helpers" />

        <div className={styles.addVolunteerForm}>
          <form className={styles.inlineForm} onSubmit={handleAdd}>
            <FormInput
              name="email"
              placeholder="Enter volunteer's email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              type="email"
              required
            />
            <Button type="submit" variant="accent" loading={adding}><Plus size={15} /> Add</Button>
          </form>
        </div>

        {loading ? <LoadingSpinner /> : !volunteers?.length
          ? <EmptyState icon={Users} title="No volunteers yet" description="Add members as volunteers to help manage events" />
          : (
            <div className={styles.volunteerList}>
              {volunteers.map(v => (
                <div key={v.id} className={styles.volunteerRow}>
                  <div className={styles.memberAvatar}>{v.name?.[0]?.toUpperCase()}</div>
                  <div className={styles.volunteerInfo}>
                    <p className={styles.volunteerName}>{v.name}</p>
                    <p className={styles.volunteerEmail}>{v.email}</p>
                  </div>
                  <button className={styles.removeBtn} onClick={() => handleRemove(v.id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )
        }
      </div>
    </AppLayout>
  );
}
