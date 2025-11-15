import React, { useContext, useMemo } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { StoreContext } from '../../../contexts/StoreContext';
import { GeolocationContext } from '../../../contexts/GeolocationContext';
import { SectionTitle } from './SectionTitle';
import { RestaurantCard } from './RestaurantCard';

// Hàm tính khoảng cách giữa hai điểm (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Bán kính trái đất (km)
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

export function NearbyRestaurants({ onRestaurantPress }) {
    const { restaurantList } = useContext(StoreContext);
    const { location, locationGranted } = useContext(GeolocationContext);

    // Chỉ hiện nearby restaurants khi user đã cấp quyền GPS và có location
    const nearbyRestaurants = useMemo(() => {
        if (!locationGranted || !location) return [];

        // Tính khoảng cách và filter restaurants trong bán kính 5km
        const restaurantsWithDistance = restaurantList.map(restaurant => {
            const distance = calculateDistance(
                location.lat,
                location.lng,
                restaurant.location?.lat || 0,
                restaurant.location?.lng || 0
            );
            return { ...restaurant, distance };
        });

        return restaurantsWithDistance
            .filter(r => r.distance <= 5)
            .sort((a, b) => a.distance - b.distance)
            .slice(0, 6);
    }, [restaurantList, location, locationGranted]);

    // Không hiện gì nếu chưa cấp quyền hoặc không có nearby restaurants
    if (!locationGranted || nearbyRestaurants.length === 0) {
        return null;
    }

    return (
        <View style={styles.container}>
            <SectionTitle
                title="Nearby Restaurants"
                count={nearbyRestaurants.length}
            />
            <FlatList
                scrollEnabled={false}
                data={nearbyRestaurants}
                keyExtractor={(item) => item.id?.toString()}
                renderItem={({ item }) => (
                    <RestaurantCard
                        item={item}
                        onPress={() => onRestaurantPress?.(item.id)}
                    />
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
    },
});
