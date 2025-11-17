import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

export const useGeolocation = () => {
    const [location, setLocation] = useState(null);
    const [address, setAddress] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const requestLocation = async () => {
        try {
            setLoading(true);
            setError(null);

            // Request permission
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setError('Permission to access location was denied');
                setLoading(false);
                return null;
            }

            // Get current location
            const result = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
            });

            const { latitude, longitude } = result.coords;
            setLocation({ latitude, longitude });

            // Reverse geocode to get address
            try {
                const addresses = await Location.reverseGeocodeAsync({
                    latitude,
                    longitude,
                });

                if (addresses && addresses.length > 0) {
                    const addr = addresses[0];
                    const addressText = [
                        addr.street,
                        addr.district,
                        addr.city,
                        addr.country,
                    ]
                        .filter(Boolean)
                        .join(', ');

                    setAddress(addressText || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
                } else {
                    setAddress(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
                }
            } catch (geocodeError) {
                console.error('Geocoding error:', geocodeError);
                setAddress(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
            }

            return { latitude, longitude };
        } catch (err) {
            console.error('Geolocation error:', err);
            setError(err.message);
            return null;
        } finally {
            setLoading(false);
        }
    };

    return {
        location,
        address,
        loading,
        error,
        requestLocation,
    };
};
