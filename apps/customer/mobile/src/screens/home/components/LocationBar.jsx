import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { GeolocationContext } from '../../../contexts/GeolocationContext';
import { LocationIcon } from '../../../components/Icons';

export function LocationBar() {
    const { location, locationGranted, loading, requestLocation } = useContext(GeolocationContext);

    // Nếu chưa có permission, hiện button để request
    if (!locationGranted) {
        return (
            <TouchableOpacity style={styles.container} onPress={requestLocation}>
                <View style={styles.content}>
                    <LocationIcon size={18} color="#ff6b35" />
                    <Text style={styles.text}>
                        {loading ? 'Getting location...' : 'Enable Location'}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    }

    // Nếu đã có permission, hiện tọa độ
    const getLocationLabel = () => {
        if (location) {
            return `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`;
        }
        if (loading) {
            return 'Locating...';
        }
        return 'Location enabled';
    };

    return (
        <TouchableOpacity style={styles.container} onPress={requestLocation} disabled={loading}>
            <View style={styles.content}>
                <LocationIcon size={18} color="#ff6b35" />
                <Text style={styles.text} numberOfLines={1}>{getLocationLabel()}</Text>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: '#fff',
        borderRadius: 20,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    text: {
        fontSize: 12,
        color: '#666',
        fontWeight: '500',
    },
});
