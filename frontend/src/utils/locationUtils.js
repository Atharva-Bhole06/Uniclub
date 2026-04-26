// ─── College Reference Location ────────────────────────────────────────────────
export const COLLEGE_LOCATION = {
  latitude: 19.2680325,
  longitude: 72.9672445,
  name: "College Campus",
};

// Acceptable radius in meters (300m)
export const ALLOWED_RADIUS_METERS = 300;

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
 */
export function isWithinCampus(latitude, longitude) {
  const distance = haversineDistance(
    COLLEGE_LOCATION.latitude,
    COLLEGE_LOCATION.longitude,
    latitude,
    longitude
  );
  return {
    allowed: distance <= ALLOWED_RADIUS_METERS,
    distance: Math.round(distance),
  };
}
