/**
 * Home Screen - Main screen matching web Home.jsx
 */
import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { StoreContext, GeolocationContext } from '../../contexts';
import { Header, ExploreMenu } from '../../components/common';
import { FoodDisplay } from '../../components/food/FoodDisplay';
import { RestaurantDisplay } from '../../components/restaurant/RestaurantDisplay';
import { colors, spacing } from '../../styles';
import { useHomeStack } from '../../navigation/useHomeStackNavigation';

export default function HomeScreen() {
    const [selectedFilter, setSelectedFilter] = useState('Top Rated');
    const [nearbyRestaurants, setNearbyRestaurants] = useState([]);

    // Get navigation context safely
    let navigation;
    try {
        navigation = useHomeStack();
    } catch (e) {
        console.warn('[HomeScreen] useHomeStack hook error:', e.message);
        navigation = { navigate: () => { } };
    }

    // Get data from StoreContext
    console.log('[HomeScreen] About to useContext(StoreContext)...');
    const storeContext = useContext(StoreContext);
    console.log('[HomeScreen] Got storeContext:', storeContext ? 'FOUND' : 'NULL', storeContext);

    console.log('[HomeScreen] About to useContext(GeolocationContext)...');
    const geoContext = useContext(GeolocationContext);
    console.log('[HomeScreen] Got geoContext:', geoContext ? 'FOUND' : 'NULL');

    // Safety check - should no longer be null due to default context value
    if (!storeContext) {
        console.error('[HomeScreen] ERROR: StoreContext is null - this should not happen');
        return <View style={styles.container}><Text>Store context initialization failed</Text></View>;
    }
    if (!geoContext) {
        console.error('[HomeScreen] ERROR: GeolocationContext is null');
        return <View style={styles.container}><Text>Geolocation context not available</Text></View>;
    }

    const { food_list, restaurant_list, loading, error } = storeContext;
    const { userLocation, requestLocation, geoLoading, locationPermissionDenied } = geoContext;

    // Show loading screen if still fetching data
    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ fontSize: 16, color: '#666' }}>Loading restaurants...</Text>
            </View>
        );
    }

    // Show error if fetch failed
    if (error) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ fontSize: 16, color: 'red' }}>Error: {error}</Text>
            </View>
        );
    }

    // Handler to request GPS permission
    const handleRequestLocation = async () => {
        console.log('[HomeScreen] User requesting GPS location...');
        await requestLocation();
    };

    const handleFoodPress = (food) => {
        console.log('[HomeScreen] Food pressed:', food.name);
    };

    const handleRestaurantPress = (restaurant) => {
        console.log('[HomeScreen] Restaurant pressed:', restaurant.name, 'id:', restaurant.id);
        navigation?.navigate?.('RestaurantDetail', { id: restaurant.id });
    };

    const handleNearbyRestaurantsLoaded = (nearby) => {
        console.log('[HomeScreen] Nearby restaurants loaded:', nearby.length);
        setNearbyRestaurants(nearby);
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Header Banner */}
            <View style={styles.headerContainer}>
                <Header onExplorePress={() => { }} />
            </View>

            {/* Nearby Restaurants Section - Only show when GPS is granted */}
            {userLocation && (
                <View style={styles.section}>
                    <ExploreMenu
                        selected="Nearby"
                        userLocation={userLocation}
                        restaurants={restaurant_list}
                        showOnlyNearby={true}
                        onNearbyRestaurantsLoaded={handleNearbyRestaurantsLoaded}
                    />
                </View>
            )}

            {/* Discover Delicious Food Section - Always show */}
            <View style={styles.section}>
                <ExploreMenu
                    selected={selectedFilter}
                    setSelected={setSelectedFilter}
                    restaurants={restaurant_list}
                    showOnlyNearby={false}
                />
            </View>

            {/* Top Rated / Best Selling Dishes */}
            <View style={styles.section}>
                <FoodDisplay
                    foods={food_list}
                    loading={loading}
                    filterBy="featured"
                    filterValue={selectedFilter}
                    onFoodPress={handleFoodPress}
                />
            </View>

            {/* All Restaurants Section */}
            <View style={styles.section}>
                <RestaurantDisplay
                    restaurants={restaurant_list}
                    loading={loading}
                    onRestaurantPress={handleRestaurantPress}
                    showAllRestaurants={true}
                />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    headerContainer: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.md,
    },
    section: {
        paddingHorizontal: spacing.lg,
        marginBottom: spacing.lg,
    },
});
