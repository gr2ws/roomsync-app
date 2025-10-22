/**
 * Calculate the distance between two geographic coordinates using the Haversine formula
 * @param lat1 Latitude of first point
 * @param lon1 Longitude of first point
 * @param lat2 Latitude of second point
 * @param lon2 Longitude of second point
 * @returns Distance in kilometers
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Parse coordinate string from database
 * Expected format: "latitude,longitude" or similar JSON format
 * @param coordinates String representation of coordinates
 * @returns Object with lat and lon, or null if invalid
 */
export function parseCoordinates(coordinates: string | null): {
  lat: number;
  lon: number;
} | null {
  if (!coordinates) return null;

  try {
    // Try parsing as JSON first (e.g., '{"lat": 9.3068, "lon": 123.3054}')
    if (coordinates.startsWith('{')) {
      const parsed = JSON.parse(coordinates);
      if (parsed.lat && parsed.lon) {
        return { lat: parseFloat(parsed.lat), lon: parseFloat(parsed.lon) };
      }
      if (parsed.latitude && parsed.longitude) {
        return { lat: parseFloat(parsed.latitude), lon: parseFloat(parsed.longitude) };
      }
    }

    // Try parsing as comma-separated values (e.g., "9.3068,123.3054")
    if (coordinates.includes(',')) {
      const parts = coordinates.split(',').map((s) => s.trim());
      if (parts.length === 2) {
        const lat = parseFloat(parts[0]);
        const lon = parseFloat(parts[1]);
        if (!isNaN(lat) && !isNaN(lon)) {
          return { lat, lon };
        }
      }
    }

    return null;
  } catch (error) {
    console.error('Error parsing coordinates:', error);
    return null;
  }
}

/**
 * Calculate distance between two coordinate strings
 * @param coords1 First coordinate string
 * @param coords2 Second coordinate string
 * @returns Distance in kilometers, or null if coordinates are invalid
 */
export function calculateDistanceFromStrings(
  coords1: string | null,
  coords2: string | null
): number | null {
  const point1 = parseCoordinates(coords1);
  const point2 = parseCoordinates(coords2);

  if (!point1 || !point2) return null;

  return calculateDistance(point1.lat, point1.lon, point2.lat, point2.lon);
}

/**
 * Format distance for display
 * @param distance Distance in kilometers
 * @returns Formatted string (e.g., "1.2 km" or "850 m")
 */
export function formatDistance(distance: number | null): string {
  if (distance === null || distance === undefined) return 'N/A';

  if (distance < 1) {
    return `${Math.round(distance * 1000)} m`;
  }

  return `${distance.toFixed(1)} km`;
}

/**
 * Extract city from location string
 * Looks for one of the four supported cities: Dumaguete City, Valencia, Bacong, Sibulan
 * @param location Location string from user profile (e.g., "Silliman University, Dumaguete City")
 * @returns City name or "Dumaguete City" as default
 */
export function extractCityFromLocation(location: string | null | undefined): string {
  if (!location) return 'Dumaguete City';

  const cities = ['Dumaguete City', 'Valencia', 'Bacong', 'Sibulan'];

  for (const city of cities) {
    if (location.includes(city)) {
      return city;
    }
  }

  return 'Dumaguete City';
}
