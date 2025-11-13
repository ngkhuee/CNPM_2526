/**
 * Simple Orders Stack Navigator - Custom stack navigation without React Navigation
 * Bypasses React Navigation's React 19 incompatibilities
 */
import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../styles';
import { OrdersStackContext } from './OrdersStackContext';

// Screens
import MyOrdersScreen from '../screens/orders/MyOrdersScreen';
import TrackingScreen from '../screens/orders/TrackingScreen';

const screenConfig = {
    MyOrders: { component: MyOrdersScreen, title: 'My Orders', canGoBack: false },
    Tracking: { component: TrackingScreen, title: 'Track Order', canGoBack: true },
};

export default function OrdersStackNavigator() {
    const [screenStack, setScreenStack] = useState(['MyOrders']);
    const [screenParams, setScreenParams] = useState({});

    const currentScreenName = screenStack[screenStack.length - 1];
    const screenConfig_ = screenConfig[currentScreenName];
    const CurrentComponent = screenConfig_?.component;
    const canGoBack = screenStack.length > 1;

    const handleNavigate = (screenName, params = {}) => {
        console.log('[OrdersStackNavigator] navigating to:', screenName, 'params:', params);
        setScreenStack([...screenStack, screenName]);
        setScreenParams({ ...screenParams, [screenName]: params });
    };

    const handleGoBack = () => {
        if (canGoBack) {
            console.log('[OrdersStackNavigator] going back');
            setScreenStack(screenStack.slice(0, -1));
        }
    };

    const stackContext = {
        currentScreen: currentScreenName,
        navigate: handleNavigate,
        goBack: handleGoBack,
        canGoBack,
        params: screenParams[currentScreenName] || {},
    };

    return (
        <OrdersStackContext.Provider value={stackContext}>
            <View style={{ flex: 1 }}>
                {/* Header */}
                <View style={styles.header}>
                    {canGoBack && (
                        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
                            <Icon name="chevron-back" size={24} color={colors.white} />
                        </TouchableOpacity>
                    )}
                    <Text style={styles.headerTitle}>{screenConfig_?.title || 'Orders'}</Text>
                    <View style={styles.headerSpacer} />
                </View>

                {/* Screen */}
                {CurrentComponent && <CurrentComponent />}
            </View>
        </OrdersStackContext.Provider>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primary,
        paddingHorizontal: 10,
        paddingVertical: 12,
        height: 56,
    },
    backButton: {
        padding: 8,
        marginRight: 8,
    },
    headerTitle: {
        flex: 1,
        color: colors.white,
        fontSize: 18,
        fontWeight: '600',
    },
    headerSpacer: {
        width: 40,
    },
});
