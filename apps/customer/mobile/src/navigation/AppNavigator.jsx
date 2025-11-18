import React, { useState, useContext, useEffect } from 'react';
import { View } from 'react-native';
import { NavigationContext } from '../contexts/NavigationContext';
import HomeScreen from '../screens/home/HomeScreen';
import OrdersScreen from '../screens/orders/OrdersScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import RestaurantDetail from '../screens/restaurant/RestaurantDetail';
import FoodDetailScreen from '../screens/restaurant/FoodDetailScreen';

/**
 * Simple navigation without React Navigation
 * Uses state to manage which screen is active
 * Listens to NavigationContext for automatic navigation
 */
export default function AppNavigator() {
    const [activeScreen, setActiveScreen] = useState('home');
    const [selectedFood, setSelectedFood] = useState(null);
    const { isNavigating, targetRestaurantId } = useContext(NavigationContext);

    // Auto navigate khi Context thay đổi
    useEffect(() => {
        if (isNavigating && targetRestaurantId) {
            console.log('[AppNavigator] Auto navigating to restaurant:', targetRestaurantId);
            setActiveScreen('restaurant');
        }
    }, [isNavigating, targetRestaurantId]);

    const renderScreen = () => {
        switch (activeScreen) {
            case 'home':
                return <HomeScreen onNavigate={setActiveScreen} />;
            case 'restaurant':
                return <RestaurantDetail onNavigate={setActiveScreen} onSelectFood={setSelectedFood} />;
            case 'food-detail':
                return <FoodDetailScreen foodItem={selectedFood} onNavigate={setActiveScreen} />;
            case 'orders':
                return <OrdersScreen onNavigate={setActiveScreen} />;
            case 'profile':
                return <ProfileScreen onNavigate={setActiveScreen} />;
            default:
                return <HomeScreen onNavigate={setActiveScreen} />;
        }
    };

    return (
        <View style={{ flex: 1 }}>
            {renderScreen()}
        </View>
    );
}
