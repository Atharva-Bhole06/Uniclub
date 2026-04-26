import { useState, useEffect, useCallback } from 'react';
import { isWithinCampus } from '../utils/locationUtils';

/**
 * Location states:
 *  - 'idle'     : not yet requested
 *  - 'loading'  : waiting for GPS response
 *  - 'allowed'  : within campus radius
 *  - 'blocked'  : outside campus radius
 *  - 'denied'   : permission denied by user
 *  - 'error'    : other geolocation error
 */
export default function useGeolocation() {
  const [status, setStatus] = useState('idle');
  const [coords, setCoords] = useState(null);   // { latitude, longitude, accuracy }
  const [distance, setDistance] = useState(null); // meters from college
  const [errorMsg, setErrorMsg] = useState(null);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus('error');
      setErrorMsg('Geolocation is not supported by your browser.');
      return;
    }

    setStatus('loading');
    setErrorMsg(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setCoords({ latitude, longitude, accuracy });

        const { allowed, distance: dist } = isWithinCampus(latitude, longitude);
        setDistance(dist);
        setStatus(allowed ? 'allowed' : 'blocked');
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setStatus('denied');
          setErrorMsg('Location permission denied. Please allow location access to mark attendance.');
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setStatus('error');
          setErrorMsg('Location information is unavailable. Please try again.');
        } else if (err.code === err.TIMEOUT) {
          setStatus('error');
          setErrorMsg('Location request timed out. Please check your GPS and try again.');
        } else {
          setStatus('error');
          setErrorMsg('An unknown error occurred while fetching location.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0, // always fresh reading
      }
    );
  }, []);

  // Auto-request on mount
  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  return { status, coords, distance, errorMsg, retry: requestLocation };
}
