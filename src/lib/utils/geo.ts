/**
 * Geolocation & Maps Utility Module
 * No external API dependencies — generates standard Google Maps links and coordinates text.
 */

/**
 * Builds a direct Google Maps pin link from latitude and longitude coordinates.
 * Example Output: "https://www.google.com/maps?q=28.6139,77.2090"
 */
export function buildMapsLink(lat: number, lng: number): string {
  if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
    return 'https://maps.google.com';
  }
  return `https://www.google.com/maps?q=${lat.toFixed(6)},${lng.toFixed(6)}`;
}

/**
 * Formats latitude and longitude coordinates into readable text.
 * Example Output: "28.613900° N, 77.209000° E"
 */
export function formatCoordinates(lat: number, lng: number): string {
  if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
    return 'Coordinates Unavailable';
  }

  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';

  return `${Math.abs(lat).toFixed(6)}° ${latDir}, ${Math.abs(lng).toFixed(6)}° ${lngDir}`;
}
