/**
 * Geocoding utilities for converting addresses to coordinates
 * Uses Nominatim OpenStreetMap API (free, no API key required)
 */

const NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org";

/**
 * Calculate distance between two GPS coordinates using Haversine formula
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lng1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lng2 - Longitude of point 2
 * @returns {number} Distance in kilometers
 */
export function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km

  return distance;
}

/**
 * Convert address text to coordinates (lat, lng)
 * @param {string} address - Address text to geocode
 * @returns {Promise<{lat: number, lng: number, display_name: string} | null>}
 */
export async function geocodeAddress(address) {
  if (!address || address.trim() === "") {
    throw new Error("Address is required");
  }

  try {
    const response = await fetch(
      `${NOMINATIM_BASE_URL}/search?` +
        new URLSearchParams({
          q: address,
          format: "json",
          limit: 1,
          addressdetails: 1,
        }),
      {
        headers: {
          "User-Agent": "YummyDroneDelivery/1.0", // Required by Nominatim
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Geocoding failed: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      return null; // Address not found
    }

    const result = data[0];
    return {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      display_name: result.display_name,
    };
  } catch (error) {
    console.error("Geocoding error:", error);
    throw error;
  }
}

/**
 * Convert coordinates to address (reverse geocoding)
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<{address: string, display_name: string} | null>}
 */
export async function reverseGeocode(lat, lng) {
  if (lat == null || lng == null) {
    throw new Error("Latitude and longitude are required");
  }

  try {
    const response = await fetch(
      `${NOMINATIM_BASE_URL}/reverse?` +
        new URLSearchParams({
          lat: lat.toString(),
          lon: lng.toString(),
          format: "json",
          addressdetails: 1,
        }),
      {
        headers: {
          "User-Agent": "YummyDroneDelivery/1.0",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Reverse geocoding failed: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data || data.error) {
      return null;
    }

    return {
      address: data.address,
      display_name: data.display_name,
    };
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    throw error;
  }
}

/**
 * Search for places matching a query
 * @param {string} query - Search query
 * @param {number} limit - Maximum results (default 5)
 * @returns {Promise<Array>}
 */
export async function searchPlaces(query, limit = 5) {
  if (!query || query.trim() === "") {
    return [];
  }

  try {
    const response = await fetch(
      `${NOMINATIM_BASE_URL}/search?` +
        new URLSearchParams({
          q: query,
          format: "json",
          limit: limit.toString(),
          addressdetails: 1,
        }),
      {
        headers: {
          "User-Agent": "YummyDroneDelivery/1.0",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Search failed: ${response.statusText}`);
    }

    const data = await response.json();

    return data.map((item) => ({
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      display_name: item.display_name,
      type: item.type,
      address: item.address,
    }));
  } catch (error) {
    console.error("Place search error:", error);
    throw error;
  }
}
