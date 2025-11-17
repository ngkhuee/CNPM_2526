import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import HomeScreen from '../screens/home/HomeScreen';
import RestaurantDetail from '../screens/restaurant/RestaurantDetail';
import OrdersScreen from '../screens/orders/OrdersScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function HomeStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="HomeMain" component={HomeScreen} />
            <Stack.Screen
                name="RestaurantDetail"
                component={RestaurantDetail}
                options={{ animationEnabled: true }}
            />
        </Stack.Navigator>
    );
}

export default function RootNavigator() {
    return (
        <NavigationContainer>
            <Tab.Navigator
                screenOptions={{
                    headerShown: false,
                    tabBarShowLabel: false,
                    tabBarStyle: {
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        backgroundColor: '#fff',
                        borderTopWidth: 1,
                        borderTopColor: '#eee',
                        height: 90,
                        paddingBottom: 30,
                    },
                    tabBarActiveTintColor: '#ff6b35',
                    tabBarInactiveTintColor: '#999',
                }}
            >
                <Tab.Screen
                    name="HomeTab"
                    component={HomeStack}
                    options={{
                        tabBarIcon: ({ color }) => (
                            <MaterialIcons name="home" size={24} color={color} />
                        ),
                    }}
                />
                <Tab.Screen
                    name="OrdersTab"
                    component={OrdersScreen}
                    options={{
                        tabBarIcon: ({ color }) => (
                            <MaterialIcons name="receipt-long" size={24} color={color} />
                        ),
                    }}
                />
                <Tab.Screen
                    name="ProfileTab"
                    component={ProfileScreen}
                    options={{
                        tabBarIcon: ({ color }) => (
                            <MaterialIcons name="account-circle" size={24} color={color} />
                        ),
                    }}
                />
            </Tab.Navigator>
        </NavigationContainer>
    );
}
