import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useContext, useEffect, useState } from 'react';
import {
    RestaurantContext,
    CartContext,
    GeolocationContext,
    useRestaurantHours,
} from 'customer-shared';

export default function HomeScreen({ navigation }) {
    const { restaurants, loadingRestaurants } = useContext(RestaurantContext);
    const { userLocation, gpsLoading } = useContext(GeolocationContext);
    const [filteredRestaurants, setFilteredRestaurants] = useState([]);

    useEffect(() => {
        if (restaurants && restaurants.length > 0) {
            // Filter restaurants by delivery distance if needed
            setFilteredRestaurants(restaurants);
        }
    }, [restaurants]);

    const handleRestaurantPress = (restaurant) => {
        navigation.navigate('RestaurantDetails', { restaurantId: restaurant.id });
    };

    const renderRestaurantCard = ({ item }) => (
        <TouchableOpacity
            style={styles.restaurantCard}
            onPress={() => handleRestaurantPress(item)}
            activeOpacity={0.7}
        >
            <View style={styles.restaurantImage}>
                <Text style={styles.foodLabel}>Restaurant</Text>
            </View>
            <View style={styles.restaurantInfo}>
                <Text style={styles.restaurantName}>{item.name}</Text>
                <Text style={styles.restaurantAddress}>{item.address}</Text>
                <View style={styles.ratingRow}>
                    <View style={styles.ratingContainer}>
                        <Text style={styles.ratingLabel}>Rating:</Text>
                        <Text style={styles.rating}>{item.rating !== undefined ? item.rating : 'N/A'}</Text>
                    </View>
                    <View style={styles.distanceContainer}>
                        <Text style={styles.distanceLabel}>Distance:</Text>
                        <Text style={styles.distance}>{item.distance !== undefined ? item.distance : 'N/A'} km</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    if (loadingRestaurants || gpsLoading) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <ActivityIndicator size="large" color="#ff6b35" />
                <Text style={styles.loadingText}>Loading restaurants...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Location Info */}
            <View style={styles.locationHeader}>
                <View style={styles.locationLabelContainer}>
                    <Text style={styles.locationIconLabel}>📍</Text>
                    <Text style={styles.locationLabel}>Delivery to:</Text>
                </View>
                <Text style={styles.locationText}>
                    {userLocation?.address || 'Searching for your location...'}
                </Text>
            </View>

            {/* Search Bar Placeholder */}
            <View style={styles.searchContainer}>
                <Text style={styles.searchIconLabel}>🔍</Text>
                <Text style={styles.searchPlaceholder}>Search restaurants...</Text>
            </View>

            {/* Restaurants List */}
            {filteredRestaurants.length > 0 ? (
                <FlatList
                    data={filteredRestaurants}
                    renderItem={renderRestaurantCard}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    scrollEnabled={true}
                />
            ) : (
                <View style={[styles.container, styles.centerContent]}>
                    <Text style={styles.noDataText}>No restaurants available</Text>
                    <Text style={styles.noDataSubtext}>Try adjusting your location</Text>
                </View>
            )}

            {/* Floating Action Button */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('Cart')}
            >
                <Text style={styles.cartLabel}>Cart</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    locationHeader: {
        backgroundColor: '#fff',
        paddingHorizontal: 15,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    locationLabelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    locationIconLabel: {
        fontSize: 14,
        marginRight: 4,
    },
    locationLabel: {
        fontSize: 12,
        color: '#666',
        marginLeft: 4,
    },
    locationText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    searchContainer: {
        backgroundColor: '#fff',
        marginHorizontal: 15,
        marginVertical: 15,
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        flexDirection: 'row',
        alignItems: 'center',
    },
    searchIconLabel: {
        fontSize: 16,
        marginRight: 8,
    },
    searchPlaceholder: {
        fontSize: 14,
        color: '#999',
        marginLeft: 2,
    },
    listContent: {
        paddingHorizontal: 15,
        paddingBottom: 100,
    },
    restaurantCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 15,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    restaurantImage: {
        height: 150,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    foodLabel: {
        fontSize: 16,
        color: '#ff6b35',
        fontWeight: '600',
    },
    restaurantInfo: {
        padding: 12,
    },
    restaurantName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#333',
        marginBottom: 4,
    },
    restaurantAddress: {
        fontSize: 13,
        color: '#666',
        marginBottom: 8,
    },
    ratingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingLabel: {
        fontSize: 12,
        color: '#666',
        marginRight: 4,
    },
    rating: {
        fontSize: 12,
        color: '#ff6b35',
        fontWeight: '600',
        marginLeft: 2,
    },
    distanceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    distanceLabel: {
        fontSize: 12,
        color: '#666',
        marginRight: 4,
    },
    distance: {
        fontSize: 12,
        color: '#666',
        marginLeft: 2,
    },
    fab: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#ff6b35',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3,
    },
    cartLabel: {
        fontSize: 12,
        color: '#fff',
        fontWeight: '600',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: '#666',
    },
    noDataText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
        marginBottom: 8,
    },
    noDataSubtext: {
        fontSize: 13,
        color: '#999',
    },
});
