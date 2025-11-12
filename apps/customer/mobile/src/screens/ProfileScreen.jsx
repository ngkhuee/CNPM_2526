import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { useContext, useState } from 'react';
import { AuthContext } from 'customer-shared';

export default function ProfileScreen({ navigation }) {
    const { user, logout } = useContext(AuthContext);
    const [editMode, setEditMode] = useState(false);
    const [profile, setProfile] = useState({
        name: user?.name || 'John Doe',
        email: user?.email || 'john@example.com',
        phone: user?.phone || '+1 234 567 8900',
        address: user?.address || 'Add your delivery address',
    });

    const handleLogout = () => {
        logout();
        navigation.navigate('Login');
    };

    const handleSaveProfile = () => {
        setEditMode(false);
        // Save profile logic here
        alert('Profile updated successfully!');
    };

    return (
        <ScrollView style={styles.container}>
            {/* Profile Avatar */}
            <View style={styles.avatarSection}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                        {profile.name.charAt(0).toUpperCase()}
                    </Text>
                </View>
                <Text style={styles.userName}>{profile.name}</Text>
                <Text style={styles.userEmail}>{profile.email}</Text>
            </View>

            {/* Edit Mode Toggle */}
            {!editMode ? (
                <TouchableOpacity
                    style={styles.editBtn}
                    onPress={() => setEditMode(true)}
                >
                    <Text style={styles.editBtnText}>Edit Profile</Text>
                </TouchableOpacity>
            ) : (
                <TouchableOpacity
                    style={[styles.editBtn, { backgroundColor: '#4caf50' }]}
                    onPress={handleSaveProfile}
                >
                    <Text style={styles.editBtnText}>Save Changes</Text>
                </TouchableOpacity>
            )}

            {/* Profile Information */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Personal Information</Text>

                <View style={styles.infoField}>
                    <Text style={styles.label}>Full Name</Text>
                    {editMode ? (
                        <TextInput
                            style={styles.input}
                            value={profile.name}
                            onChangeText={(text) => setProfile({ ...profile, name: text })}
                            placeholder="Enter your name"
                        />
                    ) : (
                        <Text style={styles.value}>{profile.name}</Text>
                    )}
                </View>

                <View style={styles.infoField}>
                    <Text style={styles.label}>Email Address</Text>
                    {editMode ? (
                        <TextInput
                            style={styles.input}
                            value={profile.email}
                            onChangeText={(text) => setProfile({ ...profile, email: text })}
                            placeholder="Enter your email"
                            keyboardType="email-address"
                        />
                    ) : (
                        <Text style={styles.value}>{profile.email}</Text>
                    )}
                </View>

                <View style={styles.infoField}>
                    <Text style={styles.label}>Phone Number</Text>
                    {editMode ? (
                        <TextInput
                            style={styles.input}
                            value={profile.phone}
                            onChangeText={(text) => setProfile({ ...profile, phone: text })}
                            placeholder="Enter your phone"
                            keyboardType="phone-pad"
                        />
                    ) : (
                        <Text style={styles.value}>{profile.phone}</Text>
                    )}
                </View>

                <View style={styles.infoField}>
                    <Text style={styles.label}>Default Address</Text>
                    {editMode ? (
                        <TextInput
                            style={styles.input}
                            value={profile.address}
                            onChangeText={(text) => setProfile({ ...profile, address: text })}
                            placeholder="Enter your address"
                            multiline
                        />
                    ) : (
                        <Text style={styles.value}>{profile.address}</Text>
                    )}
                </View>
            </View>

            {/* Settings Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Settings & Help</Text>

                <TouchableOpacity style={styles.settingItem}>
                    <Text style={styles.settingLabel}>Notifications</Text>
                    <Text style={styles.settingArrow}>›</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.settingItem}>
                    <Text style={styles.settingLabel}>Payment Methods</Text>
                    <Text style={styles.settingArrow}>›</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.settingItem}>
                    <Text style={styles.settingLabel}>Saved Addresses</Text>
                    <Text style={styles.settingArrow}>›</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.settingItem}>
                    <Text style={styles.settingLabel}>Help & Support</Text>
                    <Text style={styles.settingArrow}>›</Text>
                </TouchableOpacity>
            </View>

            {/* Logout Button */}
            <TouchableOpacity
                style={styles.logoutBtn}
                onPress={handleLogout}
            >
                <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>

            <View style={styles.footer} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    avatarSection: {
        backgroundColor: '#fff',
        paddingVertical: 30,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#ff6b35',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    avatarText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
    },
    userName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#333',
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 13,
        color: '#666',
    },
    editBtn: {
        marginHorizontal: 15,
        marginVertical: 15,
        backgroundColor: '#ff6b35',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
    },
    editBtnText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    section: {
        backgroundColor: '#fff',
        marginHorizontal: 15,
        marginVertical: 10,
        borderRadius: 12,
        padding: 15,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#333',
        marginBottom: 15,
        textTransform: 'uppercase',
    },
    infoField: {
        marginBottom: 15,
    },
    label: {
        fontSize: 12,
        fontWeight: '600',
        color: '#999',
        textTransform: 'uppercase',
        marginBottom: 6,
    },
    value: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },
    input: {
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
        color: '#333',
        backgroundColor: '#f5f5f5',
    },
    settingItem: {
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    settingLabel: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },
    settingArrow: {
        fontSize: 18,
        color: '#ccc',
    },
    logoutBtn: {
        marginHorizontal: 15,
        marginVertical: 20,
        backgroundColor: '#dc3545',
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
    },
    logoutText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    footer: {
        height: 40,
    },
});
