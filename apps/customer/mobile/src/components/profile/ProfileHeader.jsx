// components/profile/ProfileHeader.jsx
import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function ProfileHeader({ name, email, avatar, onAvatarPress }) {
    return (
        <View style={styles.profileHeader}>
            <TouchableOpacity
                style={styles.avatarContainer}
                onPress={onAvatarPress}
                activeOpacity={0.7}
            >
                {avatar ? (
                    <Image source={{ uri: avatar }} style={styles.avatar} />
                ) : (
                    <View style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarInitial}>
                            {name?.charAt(0).toUpperCase() || 'U'}
                        </Text>
                    </View>
                )}
                {/* Camera icon overlay */}
                <View style={styles.cameraIconContainer}>
                    <MaterialIcons name="camera-alt" size={20} color="#fff" />
                </View>
            </TouchableOpacity>
            <Text style={styles.userName}>{name}</Text>
            <Text style={styles.userEmail}>{email}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    profileHeader: {
        backgroundColor: '#fff',
        paddingVertical: 20,
        paddingHorizontal: 16,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    avatarContainer: {
        marginBottom: 12,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#f0f0f0',
    },
    avatarPlaceholder: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#FF6B35',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarInitial: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
    },
    cameraIconContainer: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#ff6b35',
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    userName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 14,
        color: '#999',
    },
});
