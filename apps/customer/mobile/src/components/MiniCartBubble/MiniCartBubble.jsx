import React from 'react';
import {
    Animated,
    TouchableOpacity,
    View,
    Text,
    StyleSheet,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function MiniCartBubble({
    totalItems,
    onPress,
    animatedScale,
}) {
    if (totalItems <= 0) return null;

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    transform: [{ scale: animatedScale }],
                },
            ]}
        >
            <TouchableOpacity
                style={styles.bubble}
                onPress={onPress}
                activeOpacity={0.8}
            >
                <View style={styles.iconContainer}>
                    <MaterialIcons name="shopping-cart" size={20} color="#fff" />

                    {/* Badge */}
                    {totalItems > 0 && (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>
                                {totalItems > 99 ? '99+' : totalItems}
                            </Text>
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        zIndex: 1000,
    },
    bubble: {
        width: 56,
        height: 56,
        borderRadius: 28,
        top: -30,
        backgroundColor: '#ff6b35',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    iconContainer: {
        position: 'relative',
    },
    badge: {
        position: 'absolute',
        top: -30,
        right: -20,
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#d32f2f',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    badgeText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#fff',
    },
});
