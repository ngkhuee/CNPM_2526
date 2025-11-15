import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Contexts
import { StoreContextProvider } from './src/contexts/StoreContext';
import { CartProvider } from './src/contexts/CartContext';
import { OrderProvider } from './src/contexts/OrderContext';
import { GeolocationProvider } from './src/contexts/GeolocationContext';
import { AuthProvider } from './src/contexts/AuthContext';

// Navigation
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaProvider>
                <AuthProvider>
                    <StoreContextProvider>
                        <CartProvider>
                            <OrderProvider>
                                <GeolocationProvider>
                                    <RootNavigator />
                                </GeolocationProvider>
                            </OrderProvider>
                        </CartProvider>
                    </StoreContextProvider>
                </AuthProvider>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}
