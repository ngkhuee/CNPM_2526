/**
 * Simple Navigation System - Bypass React Navigation React 19 compatibility issues
 * Uses conditional rendering instead of NavigationContainer
 */
import React, { useState, useCallback } from 'react';
import { View } from 'react-native';

// Navigators
import AuthNavigator from './AuthNavigator';
import { SimpleTabNavigator } from './SimpleTabNavigator';

// Navigation context for imperative navigation
export const NavigationContext = React.createContext();

export function SimpleNavigator({ user, isLoading }) {
    const [currentScreen, setCurrentScreen] = useState(user ? 'Main' : 'Auth');

    // Update screen based on auth state
    React.useEffect(() => {
        if (!isLoading) {
            setCurrentScreen(user ? 'Main' : 'Auth');
        }
    }, [user, isLoading]);

    console.log('[SimpleNavigator] rendering, screen:', currentScreen, 'loading:', isLoading);

    if (isLoading) {
        return <View style={{ flex: 1 }} />;
    }

    const navigationState = {
        currentScreen,
        navigate: (screenName) => {
            console.log('[SimpleNavigator] navigating to:', screenName);
            setCurrentScreen(screenName);
        },
    };

    return (
        <NavigationContext.Provider value={navigationState}>
            <View style={{ flex: 1 }}>
                {currentScreen === 'Auth' ? (
                    <AuthNavigator />
                ) : (
                    <SimpleTabNavigator />
                )}
            </View>
        </NavigationContext.Provider>
    );
}

// Hook to use navigation
export function useSimpleNavigation() {
    const context = React.useContext(NavigationContext);
    if (!context) {
        throw new Error('useSimpleNavigation must be used within NavigationContext.Provider');
    }
    return context;
}
