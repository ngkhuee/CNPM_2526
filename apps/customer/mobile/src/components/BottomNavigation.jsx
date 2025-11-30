/**
 * BottomNavigation.jsx - Navigation bar ở dưới cùng
 * 5 tab: Home, Explore, Cart (với badge), Orders, Me
 */

import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { CartContext } from '../contexts/CartContext';

export default function BottomNavigation({ activeRoute, onNavigate }) {
    const { getTotalItems } = useContext(CartContext);
    const cartItemsCount = getTotalItems();

    const isActive = (route) => activeRoute === route || (route === 'Explore' && activeRoute === 'explore');
    const iconColor = (route) => isActive(route) ? '#ff6b35' : '#999';
    const textColor = (route) => isActive(route) ? '#ff6b35' : '#666';

    return (
        <View style={styles.container}>
            {/* Home */}
            <TouchableOpacity
                style={[styles.navItem, isActive('home') && styles.activeItem]}
                onPress={() => onNavigate('home')}
            >
                <MaterialIcons
                    name="home"
                    size={24}
                    color={iconColor('home')}
                />
                <Text style={[styles.label, { color: textColor('home') }]}>Trang chủ</Text>
            </TouchableOpacity>

            {/* Explore */}
            <TouchableOpacity
                style={[styles.navItem, isActive('Explore') && styles.activeItem]}
                onPress={() => onNavigate('explore')}
            >
                <MaterialIcons
                    name="explore"
                    size={24}
                    color={iconColor('Explore')}
                />
                <Text style={[styles.label, { color: textColor('Explore') }]}>Khám phá</Text>
            </TouchableOpacity>

            {/* Cart với Badge */}
            <TouchableOpacity
                style={[styles.navItem, isActive('cart') && styles.activeItem]}
                onPress={() => onNavigate('cart')}
            >
                <View style={styles.iconContainer}>
                    <MaterialIcons
                        name="shopping-cart"
                        size={24}
                        color={iconColor('cart')}
                    />
                    {/* Cart Badge */}
                    {cartItemsCount > 0 && (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>
                                {cartItemsCount > 99 ? '99+' : cartItemsCount}
                            </Text>
                        </View>
                    )}
                </View>
                <Text style={[styles.label, { color: textColor('cart') }]}>Giỏ hàng</Text>
            </TouchableOpacity>

            {/* Orders */}
            <TouchableOpacity
                style={[styles.navItem, isActive('orders') && styles.activeItem]}
                onPress={() => onNavigate('orders')}
            >
                <MaterialIcons
                    name="receipt-long"
                    size={24}
                    color={iconColor('orders')}
                />
                <Text style={[styles.label, { color: textColor('orders') }]}>Đơn hàng</Text>
            </TouchableOpacity>

            {/* Me */}
            <TouchableOpacity
                style={[styles.navItem, isActive('profile') && styles.activeItem]}
                onPress={() => onNavigate('profile')}
            >
                <MaterialIcons
                    name="account-circle"
                    size={24}
                    color={iconColor('profile')}
                />
                <Text style={[styles.label, { color: textColor('profile') }]}>Tôi</Text>
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
    iconContainer: {
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
    },
    badge: {
        position: 'absolute',
        right: -8,
        top: -6,
        backgroundColor: '#ff6b35',
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '700',
    },
    label: {
        fontSize: 11,
        fontWeight: '600',
        marginTop: 4,
    },
});
