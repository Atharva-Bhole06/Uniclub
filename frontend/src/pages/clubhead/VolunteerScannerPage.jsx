import React, { useEffect, useState, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import AppLayout from '../../components/AppLayout';
import { PageHeader, Button } from '../../components/UI';
import { attendanceAPI } from '../../services/api';

export default function VolunteerScannerPage() {
  const [status, setStatus] = useState('scanning'); // scanning, processing, success, error
  const [message, setMessage] = useState('');
  const scannerRef = useRef(null);

  useEffect(() => {
    if (status !== 'scanning') return;

    const scanner = new Html5QrcodeScanner("volunteer-reader", {
      qrbox: { width: 250, height: 250 },
      fps: 5,
    });
    scannerRef.current = scanner;

    scanner.render(
      async (result) => {
        try {
          scanner.pause(true);
        } catch(e) {}
        scanner.clear();
        setStatus('processing');
        setMessage('Verifying attendance...');

        try {
          const parsed = JSON.parse(result);
          if (parsed.type === 'attendance' && parsed.studentId && parsed.eventId && parsed.timestamp) {
            await attendanceAPI.markDirect(parsed);
            setStatus('success');
            setMessage('Attendance marked successfully!');
          } else {
             setStatus('error');
             setMessage('Invalid QR Code format.');
          }
        } catch(e) {
           setStatus('error');
           setMessage(e.response?.data?.message || 'Invalid QR Code. Please ensure the student is showing their attendance QR.');
        }
      },
      (err) => {}
    );

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(e => {});
      }
    };
  }, [status]);

  return (
    <AppLayout>
      <PageHeader title="Scan Attendee QR" subtitle="Scan students' personal QR codes to mark attendance" />
      <div style={{ maxWidth: '500px', margin: '2rem auto', textAlign: 'center', background: 'var(--surface)', padding: '2rem', borderRadius: '16px' }}>
        {status === 'scanning' && (
           <div id="volunteer-reader" style={{ background: '#fff', borderRadius: '8px', overflow: 'hidden' }}></div>
        )}
        
        {status === 'processing' && (
           <div style={{ padding: '3rem', color: '#60a5fa' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid rgba(96,165,250,0.2)', borderTop: '3px solid #60a5fa', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
              <h3>{message}</h3>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
           </div>
        )}

        {status === 'success' && (
           <div style={{ padding: '3rem' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(74,222,128,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                 <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <h3 style={{ color: '#4ade80', marginBottom: '1.5rem' }}>{message}</h3>
              <Button onClick={() => setStatus('scanning')}>Scan Next</Button>
           </div>
        )}

        {status === 'error' && (
           <div style={{ padding: '3rem' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(248,113,113,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                 <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </div>
              <h3 style={{ color: '#f87171', marginBottom: '1.5rem', fontSize: '1.1rem' }}>{message}</h3>
              <Button onClick={() => setStatus('scanning')} variant="outline">Try Again</Button>
           </div>
        )}
      </div>
    </AppLayout>
  );
}
