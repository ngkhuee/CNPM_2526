/**
 * Simple Tab Navigator - Custom tab navigation without React Navigation
 * Completely bypasses React Navigation's React 19 incompatibilities
 */
import React, { useState, useCallback } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../styles';

// Stack Navigators
import HomeStackNavigator from './HomeStackNavigator';
import OrdersStackNavigator from './OrdersStackNavigator';
import ProfileStackNavigator from './ProfileStackNavigator';

// Tab context for navigation
export const TabContext = React.createContext();

const tabs = [
    { name: 'HomeTab', label: 'Home', icon: 'home', component: HomeStackNavigator },
    { name: 'OrdersTab', label: 'Orders', icon: 'receipt', component: OrdersStackNavigator },
    { name: 'ProfileTab', label: 'Profile', icon: 'person', component: ProfileStackNavigator },
];

export function SimpleTabNavigator() {
    const [activeTab, setActiveTab] = useState('HomeTab');

    const handleTabPress = useCallback((tabName) => {
        console.log('[SimpleTabNavigator] switching to tab:', tabName);
        setActiveTab(tabName);
    }, []);

    const ActiveComponent = tabs.find(tab => tab.name === activeTab)?.component;

    if (!ActiveComponent) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>Tab not found</Text>
            </View>
        );
    }

    return (
        <TabContext.Provider value={{ activeTab, switchTab: handleTabPress }}>
            <View style={{ flex: 1 }}>
                {/* Main Content Area */}
                <View style={{ flex: 1 }}>
                    <ActiveComponent />
                </View>

                {/* Bottom Tab Bar */}
                <View style={styles.tabBar}>
                    {tabs.map((tab) => (
                        <TouchableOpacity
                            key={tab.name}
                            style={[
                                styles.tabItem,
                                activeTab === tab.name && styles.tabItemActive,
                            ]}
                            onPress={() => handleTabPress(tab.name)}
                        >
                            <Icon
                                name={tab.icon}
                                size={24}
                                color={activeTab === tab.name ? colors.primary : colors.text.light}
                            />
                            <Text
                                style={[
                                    styles.tabLabel,
                                    { color: activeTab === tab.name ? colors.primary : colors.text.light },
                                ]}
                            >
                                {tab.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </TabContext.Provider>
    );
}

// Hook to use tab navigation
export function useTabNavigation() {
    const context = React.useContext(TabContext);
    if (!context) {
        throw new Error('useTabNavigation must be used within TabContext.Provider');
    }
    return context;
}

const styles = StyleSheet.create({
    tabBar: {
        flexDirection: 'row',
        backgroundColor: colors.white,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        paddingBottom: 5,
        paddingTop: 5,
        height: 60,
    },
    tabItem: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 5,
    },
    tabItemActive: {
        borderTopWidth: 2,
        borderTopColor: colors.primary,
    },
    tabLabel: {
        fontSize: 10,
        marginTop: 2,
    },
});
