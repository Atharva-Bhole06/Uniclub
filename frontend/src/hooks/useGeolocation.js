import { useState, useEffect, useCallback, useRef } from 'react';
import { isWithinCampus } from '../utils/locationUtils';

/**
 * Location states:
 *  - 'loading'  : waiting for GPS response
 *  - 'allowed'  : within campus radius
 *  - 'blocked'  : outside campus radius
 *  - 'denied'   : permission denied by user
 *  - 'error'    : other geolocation error (timeout, unavailable)
 *
 * Strategy:
 *  1. First call uses maximumAge:30000 + timeout:8000 — fast, may use cached fix.
 *  2. If the cached fix has poor accuracy (>100m), a background refresh is kicked
 *     off with fresh GPS (maximumAge:0) to silently improve the reading.
 *  3. If the first call itself times out, we fall through to the error state and
 *     the user can retry.
 */
export default function useGeolocation({ testMode = false, enabled = true } = {}) {
  const [status, setStatus] = useState('loading');
  const [coords, setCoords] = useState(null);   // { latitude, longitude, accuracy }
  const [distance, setDistance] = useState(null);
  const [isTestMode, setIsTestMode] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const retryCount = useRef(0);

  const applyPosition = useCallback((position) => {
    const { latitude, longitude, accuracy } = position.coords;
    setCoords({ latitude, longitude, accuracy });
    const { allowed, distance: dist, isTestMode: returnedTestMode } = isWithinCampus(latitude, longitude, testMode);
    setDistance(dist);
    setIsTestMode(returnedTestMode || false);
    
    // GPS accuracy awareness
    if (!returnedTestMode && accuracy > 150) {
      setStatus('error');
      setErrorMsg(`Low GPS accuracy (${Math.round(accuracy)}m). Please move to an open area, check your connection, and try again.`);
      return { allowed: false, accuracy };
    }

    setStatus(allowed ? 'allowed' : 'blocked');
    return { allowed, accuracy };
  }, [testMode]);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus('error');
      setErrorMsg('Geolocation is not supported by your browser. Please use a modern mobile browser.');
      return;
    }

    setStatus('loading');
    setErrorMsg(null);

    // ── Phase 1: Fast request — allow a 30-second cached position ────────────
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { allowed, accuracy } = applyPosition(position);

        // ── Phase 2: Silent background refresh if accuracy is poor (>80m) ──
        // Only do this once — don't loop forever
        if (accuracy > 80 && retryCount.current === 0) {
          retryCount.current += 1;
          navigator.geolocation.getCurrentPosition(
            (freshPosition) => {
              // Only override if the fresh reading is actually more accurate
              if (freshPosition.coords.accuracy < position.coords.accuracy) {
                applyPosition(freshPosition);
              }
            },
            () => {
              // Silent failure on background refresh — keep Phase 1 result
            },
            {
              enableHighAccuracy: true,
              timeout: 15000,
              maximumAge: 0,
            }
          );
        }
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setStatus('denied');
          setErrorMsg(
            'You denied location access. UniClub needs your location to confirm you are on campus. ' +
            'Please enable it in your browser settings and try again.'
          );
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setStatus('error');
          setErrorMsg(
            'GPS signal is unavailable right now. Try moving near a window or outdoors and retry.'
          );
        } else if (err.code === err.TIMEOUT) {
          // On timeout, try once more with a slightly relaxed accuracy setting
          if (retryCount.current === 0) {
            retryCount.current += 1;
            navigator.geolocation.getCurrentPosition(
              applyPosition,
              (err2) => {
                setStatus('error');
                setErrorMsg(
                  'Location request timed out. Please ensure GPS is enabled on your device and try again.'
                );
              },
              {
                enableHighAccuracy: false, // relaxed — network/WiFi location
                timeout: 12000,
                maximumAge: 60000,         // accept up to 1-minute old reading
              }
            );
          } else {
            setStatus('error');
            setErrorMsg(
              'Location request timed out. Please ensure GPS is enabled on your device and try again.'
            );
          }
        } else {
          setStatus('error');
          setErrorMsg('An unexpected error occurred while fetching your location. Please retry.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,       // 10s for first attempt (fast)
        maximumAge: 30000,    // Accept a cached reading up to 30s old for speed
      }
    );
  }, [applyPosition]);

  // Reset retry counter and fire on each explicit retry call
  const retry = useCallback(() => {
    retryCount.current = 0;
    requestLocation();
  }, [requestLocation]);

  // Auto-request on mount or when enabled
  useEffect(() => {
    if (enabled) {
      requestLocation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  return { status, coords, distance, errorMsg, retry, isTestMode };
}
