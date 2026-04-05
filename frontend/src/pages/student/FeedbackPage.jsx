import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApi, useMutation } from '../../hooks/useApi';
import { eventsAPI, feedbackAPI } from '../../services/api';
import AppLayout from '../../components/AppLayout';
import { LoadingSpinner, Button, FormTextarea } from '../../components/UI';
import { Star } from 'lucide-react';
import styles from './Student.module.css';

export default function FeedbackPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const { data: event } = useApi(() => eventsAPI.getById(eventId), [eventId]);
  const { mutate: submitFeedback, loading, error } = useMutation(() =>
    feedbackAPI.submit({ eventId: parseInt(eventId), rating, comment })
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) return;
    const { success } = await submitFeedback();
    if (success) setSubmitted(true);
  };

  if (submitted) {
    return (
      <AppLayout>
        <div className={styles.page}>
          <div className={styles.feedbackSuccess}>
            <div className={styles.checkCircle}>✓</div>
            <h2 className={styles.feedbackThank}>Thank you for your feedback!</h2>
            <p className={styles.feedbackSub}>Your response helps improve future events.</p>
            <Button variant="primary" onClick={() => navigate('/student/my-events')}>Back to My Events</Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className={styles.page}>
        <div className={styles.feedbackCard}>
          <h1 className={styles.feedbackTitle}>Event Feedback</h1>
          {event && <p className={styles.feedbackEventName}>{event.title}</p>}

          <form onSubmit={handleSubmit} className={styles.feedbackForm}>
            <div className={styles.ratingSection}>
              <label className={styles.ratingLabel}>How would you rate this event?</label>
              <div className={styles.stars}>
                {[1,2,3,4,5].map(n => (
                  <button key={n} type="button" onClick={() => setRating(n)} className={styles.starBtn}>
                    <Star size={32} fill={n <= rating ? '#c9f28f' : 'transparent'} color={n <= rating ? '#c9f28f' : '#374151'} />
                  </button>
                ))}
              </div>
            </div>

            <FormTextarea
              label="Share your experience (optional)"
              placeholder="What did you enjoy? What could be improved?"
              value={comment}
              onChange={e => setComment(e.target.value)}
              rows={5}
            />

            {error && <p style={{ color: '#ef4444', fontSize: '0.85rem' }}>{error}</p>}

            <Button type="submit" variant="primary" loading={loading} disabled={rating === 0}>
              Submit Feedback
            </Button>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
