// components/profile/ProfileTabs.jsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function ProfileTabs({ activeTab, onTabChange }) {
    return (
        <View style={styles.tabContainer}>
            <TouchableOpacity
                style={[styles.tabButton, activeTab === 'account' && styles.tabButtonActive]}
                onPress={() => onTabChange('account')}
            >
                <MaterialIcons
                    name="person"
                    size={20}
                    color={activeTab === 'account' ? '#FF6B35' : '#666'}
                />
                <Text
                    style={[
                        styles.tabButtonText,
                        activeTab === 'account' && styles.tabButtonTextActive,
                    ]}
                >
                    Account
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.tabButton, activeTab === 'address' && styles.tabButtonActive]}
                onPress={() => onTabChange('address')}
            >
                <MaterialIcons
                    name="location-on"
                    size={20}
                    color={activeTab === 'address' ? '#FF6B35' : '#666'}
                />
                <Text
                    style={[
                        styles.tabButtonText,
                        activeTab === 'address' && styles.tabButtonTextActive,
                    ]}
                >
                    Addresses
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    tabButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 12,
        borderBottomWidth: 3,
        borderBottomColor: 'transparent',
    },
    tabButtonActive: {
        borderBottomColor: '#FF6B35',
    },
    tabButtonText: {
        marginLeft: 8,
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    tabButtonTextActive: {
        color: '#FF6B35',
        fontWeight: '600',
    },
});
