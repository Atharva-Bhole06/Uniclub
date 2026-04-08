import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
import styles from './Student.module.css';

export default function ScannerPage() {
  const [scanResult, setScanResult] = useState(null);
  const navigate = useNavigate();

  const scanHandled = useRef(false);

  useEffect(() => {
    const existing = document.getElementById("reader");
    if (!existing || scanHandled.current) return;

    const scanner = new Html5QrcodeScanner("reader", {
      qrbox: { width: 250, height: 250 },
      fps: 5,
    });

    scanner.render(
      (result) => {
        if (scanHandled.current) return;
        scanHandled.current = true;
        
        try {
          scanner.pause(true);
        } catch(e) {}
        
        scanner.clear();
        setScanResult(result);
        
        try {
          const url = new URL(result);
          if (url.pathname.startsWith('/attendance/')) {
            navigate(url.pathname);
          } else {
             alert('Invalid QR Code URL: ' + result);
          }
        } catch(e) {
          if (result && !result.includes('/')) {
             navigate(`/attendance/${result}`);
          } else {
             alert('Unknown QR Code Format: ' + result);
          }
        }
      },
      (err) => {
        // Ignored. Errors are generated continuously while scanning
      }
    );

    return () => {
      scanner.clear().catch(error => {
        console.error("Failed to clear html5QrcodeScanner. ", error);
      });
    };
  }, [navigate]);

  return (
    <div className={styles.container}>
      <main className={styles.mainContent}>
        <h2>QR Attendance Scanner</h2>
        <p>Align the QR code within the frame to record your attendance.</p>
        
        <div style={{ maxWidth: '400px', margin: '2rem auto' }}>
          {scanResult ? (
             <div style={{ padding: '2rem', background: '#e8f5e9', color: '#2e7d32', borderRadius: '12px' }}>
                Redirecting you to attendance form...
             </div>
          ) : (
             <div id="reader"></div>
          )}
        </div>
      </main>
    </div>
  );
}
