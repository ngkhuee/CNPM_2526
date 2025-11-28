import React, { useEffect, useRef } from 'react';
import {
    View,
    ScrollView,
    TouchableOpacity,
    Text,
    Animated,
    useWindowDimensions,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { styles, animationConfig } from './MenuDrawer.styles';

/**
 * MenuDrawer - Side drawer menu component
 * Slides in from left with overlay background
 * 
 * Props:
 * - isVisible: boolean - Show/hide drawer
 * - onClose: function - Close drawer callback
 * - onNavigate: function - Navigate to screen
 */
export default function MenuDrawer({ isVisible, onClose, onNavigate }) {
    const { width } = useWindowDimensions();
    const DRAWER_WIDTH = width * 0.7;
    const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;

    // Animate drawer open/close
    useEffect(() => {
        if (isVisible) {
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: animationConfig.duration,
                useNativeDriver: animationConfig.useNativeDriver,
            }).start();
        } else {
            Animated.timing(slideAnim, {
                toValue: -DRAWER_WIDTH,
                duration: animationConfig.duration,
                useNativeDriver: animationConfig.useNativeDriver,
            }).start();
        }
    }, [isVisible, slideAnim]);

    if (!isVisible) return null;

    // Menu items list
    const menuItems = [
        {
            id: 'become-partner',
            label: 'Trở thành đối tác nhà hàng',
            icon: 'store',
            screen: 'register-restaurant',
        },
        {
            id: 'profile',
            label: 'Trang cá nhân',
            icon: 'account-circle',
            screen: 'profile',
        },
        {
            id: 'settings',
            label: 'Cài đặt',
            icon: 'settings',
            screen: 'settings',
            disabled: true,
        },
        {
            id: 'about',
            label: 'Về chúng tôi',
            icon: 'info',
            screen: 'about',
            disabled: true,
        },
    ];

    const handleMenuItemPress = (screen) => {
        if (onNavigate) {
            onNavigate(screen);
        }
    };

    return (
        <View style={{ position: 'absolute', width: '100%', height: '100%', zIndex: 1000 }}>
            {/* Overlay - tap to close */}
            <TouchableOpacity
                style={styles.overlay}
                activeOpacity={1}
                onPress={onClose}
            />

            {/* Drawer Panel */}
            <Animated.View
                style={[
                    styles.drawerContainer,
                    { transform: [{ translateX: slideAnim }] },
                ]}
            >
                {/* Header */}
                <View style={styles.drawerHeader}>
                    <View style={styles.drawerHeaderLeft}>
                        <View style={styles.drawerHeaderIcon}>
                            <MaterialIcons name="menu" size={24} color="#ff6b35" />
                        </View>
                        <Text style={styles.drawerTitle}>Mở rộng</Text>
                    </View>
                    <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                        <MaterialIcons name="close" size={24} color="#333" />
                    </TouchableOpacity>
                </View>

                {/* Menu Items */}
                <ScrollView style={styles.menuItemsContainer} showsVerticalScrollIndicator={false}>
                    {menuItems.map((item, index) => (
                        <View key={item.id}>
                            <TouchableOpacity
                                style={styles.menuItem}
                                onPress={() => handleMenuItemPress(item.screen)}
                                disabled={item.disabled}
                                opacity={item.disabled ? 0.5 : 1}
                            >
                                <View style={styles.menuItemIcon}>
                                    <MaterialIcons
                                        name={item.icon}
                                        size={20}
                                        color={item.disabled ? '#ccc' : '#ff6b35'}
                                    />
                                </View>
                                <Text style={styles.menuItemLabel}>{item.label}</Text>
                            </TouchableOpacity>

                            {/* Divider after "Become a Restaurant Partner" */}
                            {index === 0 && <View style={styles.menuDivider} />}
                        </View>
                    ))}
                </ScrollView>
            </Animated.View>
        </View>
    );
}
