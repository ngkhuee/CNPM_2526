/**
 * Simple Auth Navigator - Custom auth navigation without React Navigation
 * Bypasses React Navigation's React 19 incompatibilities
 */
import React, { useState } from 'react';
import { View } from 'react-native';
import { AuthStackContext } from './AuthStackContext';

// Auth screens
import LoginScreen from '../screens/auth/LoginScreen';

export default function AuthNavigator() {
    const [currentScreen, setCurrentScreen] = useState('Login');

    const handleNavigate = (screenName) => {
        console.log('[AuthNavigator] navigating to:', screenName);
        setCurrentScreen(screenName);
    };

    const authStackState = {
        currentScreen,
        navigate: handleNavigate,
        goBack: () => {
            if (currentScreen !== 'Login') {
                setCurrentScreen('Login');
            }
        },
    };

    console.log('[AuthNavigator] rendering screen:', currentScreen);

    return (
        <AuthStackContext.Provider value={authStackState}>
            <View style={{ flex: 1 }}>
                {currentScreen === 'Login' && <LoginScreen />}
            </View>
        </AuthStackContext.Provider>
    );
}
