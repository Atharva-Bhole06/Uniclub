import React, { useState, useEffect } from 'react';
import { headClubAPI } from '../../services/api';
import { FormInput, FormTextarea, Button } from '../../components/UI';
import { Compass, CalendarDays, Upload } from 'lucide-react';
import styles from './ClubHead.module.css';

export default function CreateEventForm({ onSuccess }) {
  const [clubId, setClubId] = useState(null);
  const [clubLoading, setClubLoading] = useState(true);
  const [form, setForm] = useState({
    title: '', description: '', startTime: '', endTime: '', venue: '', maxParticipants: '', registrationLink: '',
  });
  const [posterFile, setPosterFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    headClubAPI.getMyClub().then(res => setClubId(res.data.id)).finally(() => setClubLoading(false));
  }, []);

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title required';
    if (!form.startTime) errs.startTime = 'Start time required';
    if (!form.endTime) errs.endTime = 'End time required';
    if (form.startTime && form.endTime && new Date(form.endTime) <= new Date(form.startTime)) {
      errs.endTime = 'End must be after Start';
    }
    if (!form.venue.trim()) errs.venue = 'Venue required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    if (!clubId) return;

    setSubmitting(true);
    setApiError('');
    try {
      const res = await headClubAPI.createEvent({ ...form, clubId });
      if (posterFile && res.data.event?.id) {
        await headClubAPI.uploadEventPoster(res.data.event.id, posterFile);
      }
      setForm({ title: '', description: '', startTime: '', endTime: '', venue: '', maxParticipants: '', registrationLink: '' });
      setPosterFile(null);
      if (onSuccess) onSuccess();
    } catch (err) {
      setApiError(err?.response?.data?.message || 'Failed to create event.');
    } finally {
      setSubmitting(false);
    }
  };

  if (clubLoading) return null;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2.5rem', marginTop: '2rem', alignItems: 'stretch' }}>
      
      {/* Form Column */}
      <div style={{ background: '#111', padding: '2rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ marginBottom: '1.5rem', color: '#fff', fontSize: '1.3rem' }}>Create New Event</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', textAlign: 'left', flex: 1 }}>
          {apiError && <div style={{ color: '#ff4d4f', padding: '1rem', background: 'rgba(255,77,79,0.1)', borderRadius: '10px' }}>{apiError}</div>}
          
          <FormInput label="Event Title *" name="title" placeholder="Annual Hackathon" value={form.title} onChange={handleChange} error={errors.title} />
          <FormTextarea label="Description *" name="description" placeholder="Details..." value={form.description} onChange={handleChange} rows={3} />
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <FormInput label="Start Date/Time *" name="startTime" type="datetime-local" value={form.startTime} onChange={handleChange} error={errors.startTime} />
            <FormInput label="End Date/Time *" name="endTime" type="datetime-local" value={form.endTime} onChange={handleChange} error={errors.endTime} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <FormInput label="Venue *" name="venue" placeholder="Auditorium" value={form.venue} onChange={handleChange} error={errors.venue} />
            <FormInput label="Max Capacity" name="maxParticipants" type="number" min="1" placeholder="Blank = unlimited" value={form.maxParticipants} onChange={handleChange} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', alignItems: 'end' }}>
            <FormInput label="Reg Link (Optional)" name="registrationLink" type="url" placeholder="Google Form..." value={form.registrationLink} onChange={handleChange} />
            
            {/* Custom file upload button */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', color: '#a1a1aa' }}>Poster Image</label>
              <label style={{ 
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', 
                background: 'rgba(255,255,255,0.05)', border: '1px dashed rgba(255,255,255,0.2)', 
                padding: '0.75rem', borderRadius: '8px', cursor: 'pointer', color: '#fff', fontSize: '0.9rem',
                transition: 'all 0.2s ease'
              }}>
                <Upload size={16} />
                {posterFile ? posterFile.name : 'Select File...'}
                <input type="file" accept="image/*" hidden onChange={(e) => setPosterFile(e.target.files[0])} />
              </label>
            </div>
          </div>

          <div style={{ marginTop: 'auto', paddingTop: '1.5rem' }}>
            <Button type="submit" loading={submitting}>Submit for Approval</Button>
          </div>
        </form>
      </div>

      {/* Guide Column */}
      <div style={{ background: 'linear-gradient(145deg, #18181b, #0f0f12)', padding: '2rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.03)', display: 'flex', flexDirection: 'column' }}>
         <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
           <Compass size={18} color="#c9f28f" />
           Approval Process
         </h3>
         <p style={{ color: '#9ca3af', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
           Events submitted here are not immediately visible to students. They undergo a rapid review process.
         </p>
         
         <h4 style={{ color: '#ddd', fontSize: '0.95rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CalendarDays size={15} color="#3b82f6" /> Registration Limits
         </h4>
         <p style={{ color: '#71717a', fontSize: '0.85rem', lineHeight: '1.5', marginBottom: '1.5rem' }}>
           If your venue has strict capacity limits, use the Max Capacity field to cap the number of registrations.
         </p>

         <div style={{ marginTop: 'auto', padding: '1rem', background: 'rgba(234, 179, 8, 0.1)', borderLeft: '3px solid #eab308', borderRadius: '4px' }}>
           <p style={{ color: '#eab308', fontSize: '0.8rem', margin: 0 }}>
             Event status will be set to <strong>PENDING</strong> on creation. Monitor its status in the tracker below.
           </p>
         </div>
      </div>

    </div>
  );
}


