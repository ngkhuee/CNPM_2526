// components/restaurant/RestaurantTabs.jsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export const RestaurantTabs = ({ activeTab, onTabChange }) => {
    return (
        <View style={styles.tabContainer}>
            <TouchableOpacity
                style={[styles.tabButton, activeTab === 'menu' && styles.tabButtonActive]}
                onPress={() => onTabChange('menu')}
            >
                <MaterialIcons
                    name="restaurant-menu"
                    size={18}
                    color={activeTab === 'menu' ? '#ff6b35' : '#999'}
                />
                <Text style={[styles.tabText, activeTab === 'menu' && styles.tabTextActive]}>
                    Menu
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.tabButton, activeTab === 'reviews' && styles.tabButtonActive]}
                onPress={() => onTabChange('reviews')}
            >
                <MaterialIcons
                    name="rate-review"
                    size={18}
                    color={activeTab === 'reviews' ? '#ff6b35' : '#999'}
                />
                <Text style={[styles.tabText, activeTab === 'reviews' && styles.tabTextActive]}>
                    Reviews
                </Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#eee',
        justifyContent: 'space-around',
    },
    tabButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        gap: 6,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    tabButtonActive: { borderBottomColor: '#ff6b35' },
    tabText: { fontSize: 13, fontWeight: '600', color: '#999' },
    tabTextActive: { color: '#ff6b35' },
});
