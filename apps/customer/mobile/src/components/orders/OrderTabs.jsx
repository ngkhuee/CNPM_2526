// components/orders/OrderTabs.jsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function OrderTabs({ activeTab, onTabChange, currentCount, historyCount }) {
    return (
        <View style={styles.tabsContainer}>
            <TouchableOpacity
                style={[styles.tab, activeTab === 'current' && styles.tabActive]}
                onPress={() => onTabChange('current')}
            >
                <MaterialIcons
                    name="local-shipping"
                    size={20}
                    color={activeTab === 'current' ? '#FF6B35' : '#999'}
                />
                <Text
                    style={[
                        styles.tabText,
                        activeTab === 'current' && styles.tabTextActive,
                    ]}
                >
                    Đang xử lý ({currentCount})
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.tab, activeTab === 'history' && styles.tabActive]}
                onPress={() => onTabChange('history')}
            >
                <MaterialIcons
                    name="history"
                    size={20}
                    color={activeTab === 'history' ? '#FF6B35' : '#999'}
                />
                <Text
                    style={[
                        styles.tabText,
                        activeTab === 'history' && styles.tabTextActive,
                    ]}
                >
                    Lịch sử ({historyCount})
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    tabsContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderBottomWidth: 3,
        borderBottomColor: 'transparent',
    },
    tabActive: {
        borderBottomColor: '#FF6B35',
    },
    tabText: {
        marginLeft: 8,
        fontSize: 14,
        fontWeight: '500',
        color: '#666',
    },
    tabTextActive: {
        color: '#FF6B35',
        fontWeight: '600',
    },
});
