/**
 * Geolocation polyfill for React Native
 * Wraps expo-location to provide navigator.geolocation API
 */
import * as Location from 'expo-location';

export const setupGeolocationPolyfill = () => {
    if (typeof global.navigator === 'undefined') {
        global.navigator = {};
    }

    global.navigator.geolocation = {
        getCurrentPosition: async (success, error, options) => {
            try {
                // Request permissions
                const { status } = await Location.requestForegroundPermissionsAsync();

                if (status !== 'granted') {
                    if (error) {
                        error({
                            code: 1, // PERMISSION_DENIED
                            message: 'Location permission denied',
                        });
                    }
                    return;
                }

                // Get current position
                const location = await Location.getCurrentPositionAsync({
                    accuracy: options?.enableHighAccuracy
                        ? Location.Accuracy.High
                        : Location.Accuracy.Balanced,
                });

                if (success) {
                    success({
                        coords: {
                            latitude: location.coords.latitude,
                            longitude: location.coords.longitude,
                            accuracy: location.coords.accuracy,
                            altitude: location.coords.altitude,
                            altitudeAccuracy: location.coords.altitudeAccuracy,
                            heading: location.coords.heading,
                            speed: location.coords.speed,
                        },
                        timestamp: location.timestamp,
                    });
                }
            } catch (err) {
                if (error) {
                    error({
                        code: 2, // POSITION_UNAVAILABLE
                        message: err.message,
                    });
                }
            }
        },

        watchPosition: (success, error, options) => {
            // Not implemented for now
            console.warn('watchPosition not implemented');
            return 0;
        },

        clearWatch: (watchId) => {
            // Not implemented for now
            console.warn('clearWatch not implemented');
        },
    };
};
