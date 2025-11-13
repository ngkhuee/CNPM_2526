import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import RootNavigatorContent from './navigation/RootNavigator';
import { AuthProvider, useAuth } from './contexts';
import { StoreContextProvider } from './contexts/StoreContext';
import { GeolocationProvider } from './contexts/GeolocationContext';

function RootWithAuth() {
    const { user, isLoading } = useAuth();
    console.log('[RootWithAuth] rendering');
    console.log('[RootWithAuth] got auth context:', { isLoading, user: !!user });
    return <RootNavigatorContent user={user} isLoading={isLoading} />;
}

function SafeStoreProvider({ children }) {
    console.log('[SafeStoreProvider] Rendering - DIRECTLY rendering StoreContextProvider (no ErrorBoundary)');
    return (
        <StoreContextProvider>
            {children}
        </StoreContextProvider>
    );
}

export default function App() {
    console.log('[App] Rendering App...');
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaProvider>
                <AuthProvider>
                    <SafeStoreProvider>
                        <GeolocationProvider>
                            <RootWithAuth />
                        </GeolocationProvider>
                    </SafeStoreProvider>
                </AuthProvider>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}
