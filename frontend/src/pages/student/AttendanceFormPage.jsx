import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FormInput, Button } from '../../components/UI';
import useGeolocation from '../../hooks/useGeolocation';
import { ALLOWED_RADIUS_METERS, GPS_ACCURACY_BUFFER } from '../../utils/locationUtils';
import axios from 'axios';

// ─── Inline styles ─────────────────────────────────────────────────────────────
const card = {
  maxWidth: '620px',
  margin: '3rem auto',
  background: 'var(--surface)',
  padding: '2.5rem',
  borderRadius: '20px',
  border: '1px solid rgba(255,255,255,0.07)',
  boxShadow: '0 20px 60px rgba(0,0,0,0.55)',
};

const centered = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '1.2rem',
  minHeight: '60vh',
  textAlign: 'center',
  padding: '2rem',
};

// ─── Location Status Banners ────────────────────────────────────────────────────

function LocationBanner({ status, distance, errorMsg, onRetry, isTestMode }) {
  const configs = {
    loading: {
      color: '#60a5fa',
      bg: 'rgba(59,130,246,0.12)',
      border: 'rgba(59,130,246,0.35)',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" strokeDasharray="31.4" strokeDashoffset="10">
            <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
          </circle>
        </svg>
      ),
      title: 'Verifying your location…',
      sub: 'Hold tight — we are checking that you are within college premises. This usually takes 5–10 seconds.',
    },
    allowed: {
      color: '#4ade80',
      bg: 'rgba(74,222,128,0.10)',
      border: 'rgba(74,222,128,0.35)',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
      ),
      title: isTestMode ? `✓ Test Mode Active` : `✓ On Campus  ·  ${distance}m from college`,
      sub: isTestMode 
        ? 'Location checks are temporarily bypassed for testing.'
        : 'You are within the college premises. You may proceed to submit attendance.',
    },
    blocked: {
      color: '#f87171',
      bg: 'rgba(248,113,113,0.10)',
      border: 'rgba(248,113,113,0.35)',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="12" cy="12" r="10"/>
          <line x1="15" y1="9" x2="9" y2="15"/>
          <line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
      ),
      title: `Outside Campus  ·  ${distance}m away`,
      sub: `You are ${distance}m from the college. Attendance can only be marked within ${ALLOWED_RADIUS_METERS + GPS_ACCURACY_BUFFER}m of the campus. If you are on campus, try moving closer to the building and retry.`,
    },
    denied: {
      color: '#fb923c',
      bg: 'rgba(251,146,60,0.10)',
      border: 'rgba(251,146,60,0.35)',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      ),
      title: 'Location Permission Required',
      sub: errorMsg || 'UniClub needs your location to confirm you are on campus. Tap the lock icon in your browser address bar and allow Location, then tap Try Again.',
    },
    error: {
      color: '#fb923c',
      bg: 'rgba(251,146,60,0.10)',
      border: 'rgba(251,146,60,0.35)',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      ),
      title: 'Location Error',
      sub: errorMsg || 'Unable to fetch your location. Please ensure GPS is enabled.',
    },
  };

  const cfg = configs[status] || configs.loading;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: '0.9rem',
      padding: '1rem 1.25rem',
      background: cfg.bg,
      border: `1px solid ${cfg.border}`,
      borderRadius: '12px',
      marginBottom: '1.5rem',
      color: cfg.color,
    }}>
      <span style={{ marginTop: '2px', flexShrink: 0 }}>{cfg.icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontWeight: '600', margin: 0, fontSize: '0.95rem' }}>{cfg.title}</p>
        <p style={{ margin: '0.3rem 0 0', fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>{cfg.sub}</p>
        {(status === 'error' || status === 'denied') && (
          <button
            onClick={onRetry}
            style={{
              marginTop: '0.7rem',
              padding: '0.35rem 0.85rem',
              background: cfg.color,
              color: '#000',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: '700',
              cursor: 'pointer',
            }}
          >
            Try Again
          </button>
        )}
        {isTestMode && status === 'allowed' && (
          <div style={{ marginTop: '0.7rem', display: 'inline-block', padding: '0.2rem 0.5rem', background: '#fbbf24', color: '#000', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>
            TEST MODE ENABLED
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Full-Screen Gate Screens ───────────────────────────────────────────────────

function LocationGateScreen({ status, distance, errorMsg, onRetry, isTestMode }) {
  if (status === 'loading') {
    return (
      <div style={centered}>
        <div style={{
          width: '80px', height: '80px', borderRadius: '50%',
          border: '4px solid rgba(96,165,250,0.25)',
          borderTop: '4px solid #60a5fa',
          animation: 'spin 1s linear infinite',
        }} />
        <h2 style={{ color: '#fff', fontSize: '1.5rem', margin: 0 }}>Verifying your location…</h2>
        <p style={{ color: 'rgba(255,255,255,0.5)', maxWidth: '340px', lineHeight: 1.6 }}>
          If your browser prompts for location, please tap <strong style={{ color: '#93c5fd' }}>Allow</strong>.
          We are checking that you are within college premises.
        </p>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem', maxWidth: '300px' }}>
          This may take up to 15 seconds on slow GPS.
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (status === 'blocked') {
    return (
      <div style={{ ...centered, padding: '2rem 1.5rem' }}>
        <div style={{
          width: '80px', height: '80px', borderRadius: '50%',
          background: 'rgba(248,113,113,0.12)', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
        </div>
        <h2 style={{ color: '#f87171', fontSize: '1.5rem', margin: 0 }}>Outside Campus</h2>
        <p style={{ color: 'rgba(255,255,255,0.6)', maxWidth: '360px', lineHeight: 1.65 }}>
          You are <strong style={{ color: '#fca5a5' }}>{distance}m away</strong> from the college.
          Attendance can only be marked within <strong style={{ color: '#fca5a5' }}>{ALLOWED_RADIUS_METERS + GPS_ACCURACY_BUFFER}m</strong> of the campus.
        </p>
        <div style={{
          background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)',
          borderRadius: '12px', padding: '1rem 1.5rem', maxWidth: '360px',
        }}>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.6 }}>
            📍 Please physically be on campus to mark your attendance. GPS spoofing or VPN usage is not permitted.
          </p>
        </div>
        <button
          onClick={onRetry}
          style={{
            padding: '0.7rem 1.5rem', background: 'rgba(248,113,113,0.15)',
            border: '1px solid rgba(248,113,113,0.5)', color: '#f87171',
            borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem',
          }}
        >
          Re-check Location
        </button>
      </div>
    );
  }

  if (status === 'denied') {
    return (
      <div style={{ ...centered, padding: '2rem 1.5rem' }}>
        <div style={{
          width: '80px', height: '80px', borderRadius: '50%',
          background: 'rgba(251,146,60,0.12)', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fb923c" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <h2 style={{ color: '#fb923c', fontSize: '1.5rem', margin: 0 }}>Location Access Required</h2>
        <p style={{ color: 'rgba(255,255,255,0.6)', maxWidth: '380px', lineHeight: 1.65 }}>
          Location permission was denied. UniClub needs your location to confirm you are physically on campus before marking attendance.
        </p>
        <div style={{
          background: 'rgba(251,146,60,0.08)', border: '1px solid rgba(251,146,60,0.25)',
          borderRadius: '12px', padding: '1rem 1.5rem', maxWidth: '400px', textAlign: 'left',
        }}>
          <p style={{ margin: '0 0 0.5rem', fontWeight: '600', color: '#fb923c', fontSize: '0.88rem' }}>How to enable location:</p>
          <ol style={{ margin: 0, paddingLeft: '1.2rem', color: 'rgba(255,255,255,0.55)', fontSize: '0.83rem', lineHeight: 1.8 }}>
            <li><strong style={{ color: '#fdba74' }}>Chrome / Edge (Mobile):</strong> Tap the 🔒 lock or ⓘ icon → Permissions → Location → Allow</li>
            <li><strong style={{ color: '#fdba74' }}>Safari (iPhone):</strong> Settings → Safari → Location → Allow</li>
            <li><strong style={{ color: '#fdba74' }}>Chrome (Desktop):</strong> Click the 🔒 lock in address bar → Site settings → Location → Allow</li>
            <li>After enabling, tap <em>Try Again</em> below — no need to refresh.</li>
          </ol>
        </div>
        <button
          onClick={onRetry}
          style={{
            padding: '0.7rem 1.5rem', background: 'rgba(251,146,60,0.15)',
            border: '1px solid rgba(251,146,60,0.5)', color: '#fb923c',
            borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem',
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div style={{ ...centered, padding: '2rem 1.5rem' }}>
        <div style={{
          width: '80px', height: '80px', borderRadius: '50%',
          background: 'rgba(251,146,60,0.12)', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fb923c" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <h2 style={{ color: '#fb923c', fontSize: '1.5rem', margin: 0 }}>Location Unavailable</h2>
        <p style={{ color: 'rgba(255,255,255,0.6)', maxWidth: '360px', lineHeight: 1.65 }}>
          {errorMsg || 'Could not fetch your location. Please ensure GPS is enabled on your device.'}
        </p>
        <button
          onClick={onRetry}
          style={{
            padding: '0.7rem 1.5rem', background: 'rgba(251,146,60,0.15)',
            border: '1px solid rgba(251,146,60,0.5)', color: '#fb923c',
            borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem',
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return null;
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function AttendanceForm() {
  const { sessionId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Session data
  const [sessionData, setSessionData] = useState(null);
  const [sessionError, setSessionError] = useState(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [testMode, setTestMode] = useState(false);

  // Form state
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [responses, setResponses] = useState({});
  const [rollNo, setRollNo] = useState('');
  const [division, setDivision] = useState('');

  // Location gate
  const { status: locStatus, coords, distance, errorMsg, retry, isTestMode } = useGeolocation({
    testMode: testMode,
    enabled: !sessionLoading
  });

  // Fetch session & config on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sessionRes, configRes] = await Promise.all([
          axios.get(`http://localhost:8080/api/attendance/${sessionId}`),
          axios.get(`http://localhost:8080/api/attendance/config`)
        ]);
        setSessionData(sessionRes.data.data);
        if (configRes.data?.data?.testMode) {
          setTestMode(true);
        }
      } catch (err) {
        setSessionError(err.response?.data?.message || 'Error loading attendance form or session expired.');
      } finally {
        setSessionLoading(false);
      }
    };
    fetchData();
  }, [sessionId]);

  const handleChange = (e) => {
    setResponses((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Guard: block if not within campus (double-check on submit)
    if (locStatus !== 'allowed') {
      alert('Attendance submission blocked: you must be within college premises.');
      return;
    }

    if (!rollNo.trim() || !division.trim()) {
      alert('Please provide both Roll Number and Division.');
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(`http://localhost:8080/api/attendance/${sessionId}/submit`, {
        studentId: user?.id,
        responses,
        rollNo: rollNo.trim(),
        division: division.trim(),
        // Send coords to backend for secondary server-side validation
        latitude: coords?.latitude,
        longitude: coords?.longitude,
      });
      setSuccess(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit attendance. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render: Session loading ──
  if (sessionLoading) {
    return (
      <div style={centered}>
        <div style={{
          width: '60px', height: '60px', borderRadius: '50%',
          border: '3px solid rgba(255,255,255,0.1)',
          borderTop: '3px solid var(--success-main)',
          animation: 'spin 1s linear infinite',
        }} />
        <p style={{ color: 'rgba(255,255,255,0.5)' }}>Loading attendance form…</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ── Render: Session error ──
  if (sessionError) {
    return (
      <div style={{ ...centered, gap: '1rem' }}>
        <div style={{
          width: '72px', height: '72px', borderRadius: '50%',
          background: 'rgba(248,113,113,0.12)', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <h2 style={{ color: '#f87171', margin: 0 }}>Invalid Session</h2>
        <p style={{ color: 'rgba(255,255,255,0.55)', maxWidth: '340px', lineHeight: 1.6 }}>{sessionError}</p>
        <Button onClick={() => navigate('/student/dashboard')} style={{ marginTop: '0.5rem' }}>
          Go Back
        </Button>
      </div>
    );
  }

  // ── Render: Location gate (loading / blocked / denied / error) ──
  const gateStatuses = ['loading', 'blocked', 'denied', 'error'];
  if (gateStatuses.includes(locStatus)) {
    return (
      <div style={{ maxWidth: '560px', margin: '4rem auto', padding: '0 1rem' }}>
        {/* Slim session header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ color: '#fff', fontSize: '1.6rem', margin: 0 }}>Event Attendance</h2>
          {sessionData?.event?.title && (
            <p style={{ color: 'var(--success-main)', fontSize: '1.05rem', marginTop: '0.4rem' }}>
              {sessionData.event.title}
            </p>
          )}
        </div>
        <div style={{ ...card, padding: '2rem' }}>
          <LocationGateScreen
            status={locStatus}
            distance={distance}
            errorMsg={errorMsg}
            onRetry={retry}
            isTestMode={isTestMode}
          />
        </div>
      </div>
    );
  }

  // ── Render: Success ──
  if (success) {
    return (
      <div style={{ ...centered, gap: '1.2rem' }}>
        <div style={{
          width: '80px', height: '80px', borderRadius: '50%',
          background: 'rgba(74,222,128,0.12)', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <h2 style={{ color: '#4ade80', fontSize: '1.8rem', margin: 0 }}>Attendance Recorded!</h2>
        <p style={{ color: 'rgba(255,255,255,0.6)', maxWidth: '340px', lineHeight: 1.6 }}>
          Your attendance for <strong style={{ color: '#fff' }}>{sessionData?.event?.title}</strong> has been successfully marked.
        </p>
        <Button onClick={() => navigate('/student/dashboard')} style={{ marginTop: '0.5rem' }}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  // ── Render: Attendance form (locStatus === 'allowed') ──
  return (
    <div style={card}>
      <h2 style={{ fontSize: '1.8rem', marginBottom: '0.3rem', color: '#fff' }}>Event Attendance</h2>
      <h3 style={{ color: 'var(--success-main)', fontSize: '1.15rem', marginBottom: '1.5rem', fontWeight: 500 }}>
        {sessionData?.event?.title}
      </h3>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
        Please review your details and complete any additional fields requested by the organizers.
      </p>

      {/* Location banner (inline, since we're allowed) */}
      <LocationBanner
        status={locStatus}
        distance={distance}
        errorMsg={errorMsg}
        onRetry={retry}
        isTestMode={isTestMode}
      />

      {/* Student profile card */}
      <div style={{ marginBottom: '1.8rem', padding: '1.4rem', background: '#1a1a1a', borderRadius: '12px', borderLeft: '4px solid var(--success-main)' }}>
        <h4 style={{ color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--success-main)" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          Student Profile Details
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', color: '#ccc', fontSize: '0.92rem' }}>
          <div><strong style={{ color: '#888', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase' }}>Full Name</strong><span style={{ color: '#fff' }}>{user?.fullName}</span></div>
          <div><strong style={{ color: '#888', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase' }}>Email Address</strong><span style={{ color: '#fff' }}>{user?.email}</span></div>
          <div><strong style={{ color: '#888', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase' }}>Moodle ID</strong><span style={{ color: '#fff' }}>{user?.moodleId || 'N/A'}</span></div>
          <div><strong style={{ color: '#888', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase' }}>Dept & Year</strong><span style={{ color: '#fff' }}>{user?.department} - {user?.year}</span></div>
        </div>
        <p style={{ fontSize: '0.72rem', color: '#666', marginTop: '0.9rem', fontStyle: 'italic' }}>
          * This information is automatically captured for verified attendance.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Verification context */}
        <div style={{ marginBottom: '1.8rem', padding: '1.4rem', background: '#1a1a1a', borderRadius: '12px', borderLeft: '4px solid var(--success-main)' }}>
          <h4 style={{ color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--success-main)" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            Verification Context
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <FormInput
              label="Division"
              value={division}
              onChange={(e) => setDivision(e.target.value)}
              placeholder="e.g. A"
              required
            />
            <FormInput
              label="Roll Number"
              value={rollNo}
              onChange={(e) => setRollNo(e.target.value)}
              placeholder="e.g. 45"
              required
            />
          </div>
        </div>

        {/* Custom fields */}
        {sessionData?.customFields && sessionData.customFields.length > 0 && (
          <div style={{ marginBottom: '1.8rem' }}>
            <h4 style={{ color: '#fff', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
              Additional Information Required
            </h4>
            {sessionData.customFields.map((fieldStr, idx) => {
              let field = { question: fieldStr, required: true };
              try { field = JSON.parse(fieldStr); } catch (e) {}
              return (
                <div key={idx} style={{ marginBottom: '1.2rem' }}>
                  <FormInput
                    label={field.question + (field.required ? ' *' : ' (Optional)')}
                    name={field.question}
                    value={responses[field.question] || ''}
                    onChange={handleChange}
                    required={field.required}
                  />
                </div>
              );
            })}
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          loading={submitting}
          disabled={locStatus !== 'allowed' || submitting}
          style={{ width: '100%', padding: '1rem', fontSize: '1.05rem', marginTop: '0.5rem' }}
        >
          Verify &amp; Log Attendance
        </Button>

        {locStatus !== 'allowed' && (
          <p style={{ textAlign: 'center', marginTop: '0.7rem', fontSize: '0.8rem', color: '#f87171' }}>
            Submission blocked — campus location check failed.
          </p>
        )}
      </form>
    </div>
  );
}
