import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import AppLayout from '../../components/AppLayout';
import { PageHeader, Button } from '../../components/UI';
import { useAuth } from '../../context/AuthContext';

export default function MyQRPage() {
  const { eventId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [qrValue, setQrValue] = useState('');

  useEffect(() => {
    if (user && eventId) {
      const data = {
        studentId: user.id,
        eventId: parseInt(eventId),
        timestamp: Date.now(),
        type: 'attendance'
      };
      setQrValue(JSON.stringify(data));
    }
  }, [user, eventId]);

  return (
    <AppLayout>
      <PageHeader title="My Attendance QR" subtitle="Show this to a volunteer to mark your attendance" />
      <div style={{ maxWidth: '500px', margin: '2rem auto', textAlign: 'center', background: 'var(--surface)', padding: '3rem', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
        <h3 style={{ color: '#fff', marginBottom: '1.5rem', fontSize: '1.4rem' }}>Scan at Entry</h3>
        <div style={{ background: '#fff', padding: '2rem', borderRadius: '12px', display: 'inline-block', marginBottom: '2rem' }}>
          {qrValue ? (
            <QRCodeSVG value={qrValue} size={250} />
          ) : (
            <div style={{ width: 250, height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>Loading...</div>
          )}
        </div>
        <p style={{ color: '#888', marginBottom: '2rem', fontSize: '0.9rem' }}>
          This QR code is valid for 1 minute. If it expires, simply refresh this page.
        </p>
        <Button variant="outline" onClick={() => navigate('/student/my-events')}>
          Back to My Events
        </Button>
      </div>
    </AppLayout>
  );
}
