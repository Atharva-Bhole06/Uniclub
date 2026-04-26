// ─── TEST MODE CONFIGURATION (Development/Demo Only) ────────────────────────────
// Note: testMode is now retrieved dynamically from the backend configuration.
// If you want to simulate being inside the campus from another location,
// provide coordinates here. E.g., { latitude: 19.2680325, longitude: 72.9672445 }
// When null, it uses the actual device GPS.
export const OVERRIDE_COORDINATES = null;

// ─── College Reference Location ────────────────────────────────────────────────
export const COLLEGE_LOCATION = {
  latitude: 19.2680325,
  longitude: 72.9672445,
  name: "College Campus",
};

/**
 * Primary allowed radius shown to the user (meters).
 * The UI gates access at this distance.
 */
export const ALLOWED_RADIUS_METERS = 300;

/**
 * Extra tolerance buffer for GPS inaccuracies (meters).
 * Indoor GPS and WiFi-based positioning can drift by 30–80m,
 * so we add this buffer on top of ALLOWED_RADIUS_METERS to avoid
 * false rejections near the campus boundary.
 *
 * Frontend uses:  ALLOWED_RADIUS_METERS + GPS_ACCURACY_BUFFER  = 350m
 * Backend uses a separate, slightly larger tolerance (400m) to
 * catch edge cases the frontend might pass through.
 */
export const GPS_ACCURACY_BUFFER = 50;

/**
 * Haversine formula: calculates the great-circle distance between two
 * lat/lng points on a sphere (Earth radius ≈ 6371 km).
 * Returns distance in meters.
 */
export function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth radius in meters
  const toRad = (deg) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
    Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // distance in meters
}

/**
 * Checks whether a given lat/lng is within the allowed campus radius.
 * Includes GPS_ACCURACY_BUFFER to handle indoor drift gracefully.
 *
 * The displayed distance to the user is always the raw distance (no buffer),
 * so it reflects their true position relative to campus.
 */
export function isWithinCampus(latitude, longitude, testMode = false) {
  if (testMode) {
    return {
      allowed: true,
      distance: 0,
      isTestMode: true,
    };
  }

  const effectiveLat = (testMode && OVERRIDE_COORDINATES) ? OVERRIDE_COORDINATES.latitude : latitude;
  const effectiveLon = (testMode && OVERRIDE_COORDINATES) ? OVERRIDE_COORDINATES.longitude : longitude;

  const distance = haversineDistance(
    COLLEGE_LOCATION.latitude,
    COLLEGE_LOCATION.longitude,
    effectiveLat,
    effectiveLon
  );
  return {
    // Effective gate = primary radius + buffer
    allowed: distance <= ALLOWED_RADIUS_METERS + GPS_ACCURACY_BUFFER,
    // Show user only the raw distance (without buffer), so they see accurate info
    distance: Math.round(distance),
    isTestMode: !!OVERRIDE_COORDINATES,
  };
}
