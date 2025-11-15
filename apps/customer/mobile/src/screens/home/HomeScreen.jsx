import React, { useContext, useEffect } from 'react';
import { View, ScrollView, StyleSheet, FlatList } from 'react-native';
import { StoreContext } from '../../contexts/StoreContext';
import { GeolocationContext } from '../../contexts/GeolocationContext';
import { Header } from '../../components/Header';
import { HomeHero } from './components/HomeHero';
import { LocationBar } from './components/LocationBar';
import { NearbyRestaurants } from './components/NearbyRestaurants';
import { SectionTitle } from './components/SectionTitle';
import { FoodCard } from './components/FoodCard';
import { RestaurantCard } from './components/RestaurantCard';

export default function HomeScreen() {
    const storeContext = useContext(StoreContext);
    const { requestLocation } = useContext(GeolocationContext);

    const foodList = storeContext?.foodList || [];
    const restaurantList = storeContext?.restaurantList || [];

    const topFoods = foodList.filter(f => f.rating >= 4).slice(0, 6);
    const topRestaurants = restaurantList.slice(0, 6);

    // Request location khi component mount
    useEffect(() => {
        requestLocation();
    }, [requestLocation]);

    const handleProfilePress = () => {
        // For future navigation to profile or login screen
        // Will be implemented when navigation stack is set up
    };

    const handleExplorePress = () => {
        // For future navigation to menu or restaurants
        // Will be implemented when navigation stack is set up
    };

    return (
        <View style={styles.container}>
            <Header onProfilePress={handleProfilePress} />
            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Location Bar */}
                <View style={styles.locationWrapper}>
                    <LocationBar />
                </View>

                {/* Hero Banner */}
                <HomeHero onExplorePress={handleExplorePress} />

                {/* Nearby Restaurants - Only show when GPS is granted */}
                <NearbyRestaurants onRestaurantPress={(id) => { }} />

                {/* Top Rated Foods */}
                <View style={styles.section}>
                    <SectionTitle
                        title="Discover Delicious Food"
                        count={topFoods.length}
                    />
                    <FlatList
                        scrollEnabled={false}
                        data={topFoods}
                        keyExtractor={(item) => item.id?.toString()}
                        renderItem={({ item }) => (
                            <FoodCard item={item} onPress={() => { }} />
                        )}
                    />
                </View>

                {/* Top Rated Restaurants */}
                <View style={styles.section}>
                    <SectionTitle
                        title="Top Rated Restaurants"
                        count={topRestaurants.length}
                    />
                    <FlatList
                        scrollEnabled={false}
                        data={topRestaurants}
                        keyExtractor={(item) => item.id?.toString()}
                        renderItem={({ item }) => (
                            <RestaurantCard item={item} onPress={() => { }} />
                        )}
                    />
                </View>

                {/* Spacer */}
                <View style={{ height: 20 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f8f8',
    },
    content: {
        flex: 1,
        padding: 16,
    },
    locationWrapper: {
        marginBottom: 16,
        alignItems: 'flex-start',
    },
    section: {
        marginBottom: 24,
    },
});
