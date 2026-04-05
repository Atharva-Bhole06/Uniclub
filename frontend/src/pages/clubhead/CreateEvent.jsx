import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventsAPI } from '../../services/api';
import { useMutation } from '../../hooks/useApi';
import AppLayout from '../../components/AppLayout';
import { PageHeader, FormInput, FormTextarea, FormSelect, Button } from '../../components/UI';
import styles from './ClubHead.module.css';

const CATEGORY_OPTIONS = [
  { value: 'TECHNICAL',  label: 'Technical' },
  { value: 'CULTURAL',   label: 'Cultural' },
  { value: 'SPORTS',     label: 'Sports' },
  { value: 'LITERARY',   label: 'Literary' },
  { value: 'SOCIAL',     label: 'Social' },
];

export default function CreateEvent() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', description: '', category: '',
    startTime: '', endTime: '', venue: '',
    maxParticipants: '', imageUrl: '',
  });
  const [errors, setErrors] = useState({});

  const { mutate: createEvent, loading, error: apiError } = useMutation((data) => eventsAPI.create(data));

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    if (!form.description.trim()) errs.description = 'Description is required';
    if (!form.startTime) errs.startTime = 'Start time is required';
    if (!form.endTime) errs.endTime = 'End time is required';
    if (form.startTime && form.endTime && form.endTime <= form.startTime)
      errs.endTime = 'End time must be after start time';
    if (!form.venue.trim()) errs.venue = 'Venue is required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    const payload = {
      ...form,
      maxParticipants: form.maxParticipants ? parseInt(form.maxParticipants) : null,
    };
    const { success } = await createEvent(payload);
    if (success) navigate('/clubhead/events');
  };

  return (
    <AppLayout>
      <div className={styles.page}>
        <PageHeader title="Create Event" subtitle="Event will be submitted for faculty approval" />

        <div className={styles.formCard}>
          {apiError && <div className={styles.apiError}>{apiError}</div>}
          <form onSubmit={handleSubmit} className={styles.form}>
            <FormInput label="Event Title *" name="title" placeholder="e.g. Annual Hackathon 2026" value={form.title} onChange={handleChange} error={errors.title} />
            <FormTextarea label="Description *" name="description" placeholder="Describe the event in detail..." value={form.description} onChange={handleChange} error={errors.description} rows={4} />
            <div className={styles.row2}>
              <FormInput label="Start Date & Time *" name="startTime" type="datetime-local" value={form.startTime} onChange={handleChange} error={errors.startTime} />
              <FormInput label="End Date & Time *" name="endTime" type="datetime-local" value={form.endTime} onChange={handleChange} error={errors.endTime} />
            </div>
            <div className={styles.row2}>
              <FormInput label="Venue *" name="venue" placeholder="e.g. Main Auditorium" value={form.venue} onChange={handleChange} error={errors.venue} />
              <FormInput label="Max Participants" name="maxParticipants" type="number" placeholder="Leave blank for unlimited" value={form.maxParticipants} onChange={handleChange} min={1} />
            </div>
            <FormSelect label="Category" name="category" options={CATEGORY_OPTIONS} value={form.category} onChange={handleChange} />
            <FormInput label="Cover Image URL" name="imageUrl" placeholder="https://..." value={form.imageUrl} onChange={handleChange} />

            <div className={styles.formNote}>
              ⚠️ This event will be submitted with status <strong>PENDING</strong> and will only be visible after faculty approval.
            </div>

            <div className={styles.formActions}>
              <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
              <Button type="submit" variant="primary" loading={loading}>Submit for Approval</Button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
