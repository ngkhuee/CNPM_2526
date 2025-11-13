import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Import shared contexts & providers
import {
    AuthProvider,
    CartProvider,
    OrderProvider,
    RestaurantProvider,
    GeolocationProvider
} from 'customer-shared';

// Import screens
import HomeScreen from './src/screens/HomeScreen';
import RestaurantDetailsScreen from './src/screens/RestaurantDetailsScreen';
import CartScreen from './src/screens/CartScreen';
import CheckoutScreen from './src/screens/CheckoutScreen';
import MyOrdersScreen from './src/screens/MyOrdersScreen';
import TrackingScreen from './src/screens/TrackingScreen';
import LoginScreen from './src/screens/LoginScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SavedAddressesScreen from './src/screens/SavedAddressesScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Home Stack Navigator
const HomeStackNavigator = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: true,
                headerStyle: styles.header,
                headerTintColor: '#fff',
                headerTitleStyle: {
                    fontWeight: '600',
                    fontSize: 18,
                },
            }}
        >
            <Stack.Screen
                name="HomeStack"
                component={HomeScreen}
                options={{ headerTitle: 'Drone Food Delivery' }}
            />
            <Stack.Screen
                name="RestaurantDetails"
                component={RestaurantDetailsScreen}
                options={{ headerTitle: 'Restaurant Menu' }}
            />
            <Stack.Screen
                name="Cart"
                component={CartScreen}
                options={{ headerTitle: 'Your Cart' }}
            />
            <Stack.Screen
                name="Checkout"
                component={CheckoutScreen}
                options={{ headerTitle: 'Checkout' }}
            />
        </Stack.Navigator>
    );
};

// Orders Stack Navigator
const OrdersStackNavigator = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: true,
                headerStyle: styles.header,
                headerTintColor: '#fff',
                headerTitleStyle: {
                    fontWeight: '600',
                    fontSize: 18,
                },
            }}
        >
            <Stack.Screen
                name="MyOrdersStack"
                component={MyOrdersScreen}
                options={{ headerTitle: 'My Orders' }}
            />
            <Stack.Screen
                name="Tracking"
                component={TrackingScreen}
                options={{ headerTitle: 'Track Order' }}
            />
        </Stack.Navigator>
    );
};

// Profile Stack Navigator
const ProfileStackNavigator = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: true,
                headerStyle: styles.header,
                headerTintColor: '#fff',
                headerTitleStyle: {
                    fontWeight: '600',
                    fontSize: 18,
                },
            }}
        >
            <Stack.Screen
                name="ProfileStack"
                component={ProfileScreen}
                options={{ headerTitle: 'Profile' }}
            />
            <Stack.Screen
                name="SavedAddresses"
                component={SavedAddressesScreen}
                options={{ headerTitle: 'Saved Addresses' }}
            />
        </Stack.Navigator>
    );
};

// Tab Navigator (for authenticated users)
const TabNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: styles.tabBar,
                tabBarActiveTintColor: '#ff6b35',
                tabBarInactiveTintColor: '#999',
            }}
        >
            <Tab.Screen
                name="Home"
                component={HomeStackNavigator}
                options={{
                    tabBarLabel: 'Home',
                    tabBarIcon: ({ color }) => <HomeIcon color={color} />,
                }}
            />
            <Tab.Screen
                name="Orders"
                component={OrdersStackNavigator}
                options={{
                    tabBarLabel: 'Orders',
                    tabBarIcon: ({ color }) => <OrdersIcon color={color} />,
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileStackNavigator}
                options={{
                    tabBarLabel: 'Profile',
                    tabBarIcon: ({ color }) => <ProfileIcon color={color} />,
                }}
            />
        </Tab.Navigator>
    );
};

// Root Stack Navigator
const RootStackNavigator = () => {
    const [isAuthenticated, setIsAuthenticated] = React.useState(false);

    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                animationEnabled: true,
            }}
        >
            {isAuthenticated ? (
                <Stack.Screen
                    name="MainApp"
                    component={TabNavigator}
                />
            ) : (
                <Stack.Screen
                    name="Login"
                    component={LoginScreen}
                    options={{ animationEnabled: false }}
                />
            )}
        </Stack.Navigator>
    );
};

// Placeholder icon components
const HomeIcon = ({ color }) => (
    <Text style={{ fontSize: 24 }}>🏠</Text>
);
const OrdersIcon = ({ color }) => (
    <Text style={{ fontSize: 24 }}>📦</Text>
);
const ProfileIcon = ({ color }) => (
    <Text style={{ fontSize: 24 }}>👤</Text>
);

export default function App() {
    return (
        <SafeAreaView style={styles.container}>
            <AuthProvider>
                <CartProvider>
                    <OrderProvider>
                        <RestaurantProvider>
                            <GeolocationProvider>
                                <NavigationContainer>
                                    <RootStackNavigator />
                                </NavigationContainer>
                            </GeolocationProvider>
                        </RestaurantProvider>
                    </OrderProvider>
                </CartProvider>
            </AuthProvider>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        backgroundColor: '#ff6b35',
    },
    tabBar: {
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        paddingBottom: 5,
        paddingTop: 5,
    },
});
