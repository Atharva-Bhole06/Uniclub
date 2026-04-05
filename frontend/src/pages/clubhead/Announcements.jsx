import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApi, useMutation } from '../../hooks/useApi';
import { announcementsAPI } from '../../services/api';
import AppLayout from '../../components/AppLayout';
import { LoadingSpinner, EmptyState, PageHeader, FormInput, FormTextarea, Button } from '../../components/UI';
import { Megaphone, Plus, Send } from 'lucide-react';
import styles from './ClubHead.module.css';

export default function Announcements() {
  const { user } = useAuth();
  const clubId = user?.clubId;
  const [form, setForm] = useState({ subject: '', message: '' });

  const { data: announcements, loading, refetch } = useApi(() => announcementsAPI.getByClub(clubId), [clubId]);
  const { mutate: sendAnnouncement, loading: sending } = useMutation(() =>
    announcementsAPI.send({ ...form, clubId })
  );

  const handleSend = async (e) => {
    e.preventDefault();
    const { success } = await sendAnnouncement();
    if (success) { setForm({ subject: '', message: '' }); refetch(); }
  };

  return (
    <AppLayout>
      <div className={styles.page}>
        <PageHeader title="Announcements" subtitle="Send updates to all club members via email" />

        <div className={styles.announcementLayout}>
          {/* Compose Form */}
          <div className={styles.composeCard}>
            <h3 className={styles.composeTitle}><Send size={16} /> New Announcement</h3>
            <form onSubmit={handleSend} className={styles.form}>
              <FormInput label="Subject" name="subject" placeholder="e.g. Event reminder" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} required />
              <FormTextarea label="Message" name="message" placeholder="Write your announcement..." value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} rows={6} required />
              <p className={styles.emailNote}>📧 This will be emailed to all club members</p>
              <Button type="submit" variant="primary" loading={sending}><Megaphone size={15} /> Send Announcement</Button>
            </form>
          </div>

          {/* History */}
          <div className={styles.announcementHistory}>
            <h3 className={styles.composeTitle}>Sent Announcements</h3>
            {loading ? <LoadingSpinner /> : !announcements?.length
              ? <EmptyState icon={Megaphone} title="No announcements yet" />
              : (
                <div className={styles.announcementList}>
                  {announcements.map(a => (
                    <div key={a.id} className={styles.announcementItem}>
                      <p className={styles.announcementSubject}>{a.subject}</p>
                      <p className={styles.announcementMsg}>{a.message}</p>
                      <span className={styles.announcementTime}>{new Date(a.sentAt).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              )
            }
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
