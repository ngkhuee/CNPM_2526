import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { BellIcon, AccountIcon } from './Icons';
import { AuthContext } from '../contexts/AuthContext';

export function Header({ onProfilePress }) {
    const { user } = useContext(AuthContext);

    return (
        <View style={styles.container}>
            <View style={styles.left}>
                <Text style={styles.logo}>Yummy</Text>
                <Text style={styles.subtitle}>Delivery</Text>
            </View>
            <View style={styles.right}>
                <TouchableOpacity style={styles.iconBtn}>
                    <BellIcon size={24} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconBtn} onPress={onProfilePress}>
                    {user?.avatar ? (
                        <Image
                            source={{ uri: user.avatar }}
                            style={styles.avatar}
                        />
                    ) : (
                        <AccountIcon size={24} color="#fff" />
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
} const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#ff6b35',
    },
    left: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    logo: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginRight: 4,
    },
    subtitle: {
        fontSize: 12,
        color: '#fff',
        opacity: 0.8,
    },
    right: {
        flexDirection: 'row',
        gap: 12,
        alignItems: 'center',
    },
    iconBtn: {
        padding: 6,
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#f0f0f0',
    },
});
