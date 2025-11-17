import React, { useState } from 'react';
import { View } from 'react-native';
import HomeScreen from '../screens/home/HomeScreen';
import OrdersScreen from '../screens/orders/OrdersScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

/**
 * Simple navigation without React Navigation
 * Uses state to manage which screen is active
 */
export default function AppNavigator() {
    const [activeScreen, setActiveScreen] = useState('home');

    const renderScreen = () => {
        switch (activeScreen) {
            case 'home':
                return <HomeScreen onNavigate={setActiveScreen} />;
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
