import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function BottomNavigation({ activeRoute, onNavigate }) {
    const isActive = (route) => activeRoute === route;
    const iconColor = (route) => isActive(route) ? '#ff6b35' : '#999';
    const textColor = (route) => isActive(route) ? '#ff6b35' : '#666';

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={[styles.navItem, isActive('home') && styles.activeItem]}
                onPress={() => onNavigate('home')}
            >
                <MaterialIcons
                    name="home"
                    size={24}
                    color={iconColor('home')}
                />
                <Text style={[styles.label, { color: textColor('home') }]}>Home</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.navItem, isActive('orders') && styles.activeItem]}
                onPress={() => onNavigate('orders')}
            >
                <MaterialIcons
                    name="receipt-long"
                    size={24}
                    color={iconColor('orders')}
                />
                <Text style={[styles.label, { color: textColor('orders') }]}>Orders</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.navItem, isActive('profile') && styles.activeItem]}
                onPress={() => onNavigate('profile')}
            >
                <MaterialIcons
                    name="account-circle"
                    size={24}
                    color={iconColor('profile')}
                />
                <Text style={[styles.label, { color: textColor('profile') }]}>Me</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingVertical: 8,
        height: 90,
        paddingBottom: 30,
    },
    navItem: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
    },
    activeItem: {
        backgroundColor: '#fff8f3',
    },
    label: {
        fontSize: 11,
        fontWeight: '600',
        marginTop: 4,
    },
});
