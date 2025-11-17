// screens/profile/ProfileScreen.jsx
import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    Text,
    SafeAreaView,
} from 'react-native';
import BottomNavigation from '../../components/BottomNavigation';
import ProfileHeader from '../../components/profile/ProfileHeader';
import ProfileTabs from '../../components/profile/ProfileTabs';
import AccountInfo from '../../components/profile/AccountInfo';
import AddressList from '../../components/profile/AddressList';
import AddressForm from '../../components/profile/AddressForm';
import { useProfile } from '../../hooks/useProfile';
import { useAddress } from '../../hooks/useAddress';

export default function ProfileScreen({ onNavigate }) {
    const [activeTab, setActiveTab] = useState('account');
    const [activeRoute, setActiveRoute] = useState('profile');

    // Profile hook
    const {
        user,
        loading,
        editing,
        saveLoading: profileSaveLoading,
        formData,
        setEditing,
        handleInputChange,
        handleSaveProfile,
        handleLogout,
    } = useProfile();

    // Address hook
    const {
        addresses,
        showAddressForm,
        saveLoading: addressSaveLoading,
        gpsLoading,
        newAddress,
        setShowAddressForm,
        handleAddressInputChange,
        handleAddAddress,
        handleDeleteAddress,
        handleSetDefaultAddress,
        handleGetGPS,
    } = useAddress(user?.id);

    const handleNavigate = (route) => {
        setActiveRoute(route);
        if (onNavigate) {
            onNavigate(route);
        }
    };

    // Loading state
    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.centerContent}>
                    <ActivityIndicator size="large" color="#FF6B35" />
                </View>
            </SafeAreaView>
        );
    }

    // Not logged in state
    if (!user) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.centerContent}>
                    <Text style={styles.notLoggedInText}>Please login first</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <View style={styles.screenContainer}>
            <SafeAreaView style={styles.container}>
                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    {/* Profile Header */}
                    <ProfileHeader
                        name={formData.name}
                        email={formData.email}
                        avatar={formData.avatar}
                    />

                    {/* Tabs */}
                    <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />

                    {/* Account Tab Content */}
                    {activeTab === 'account' && (
                        <AccountInfo
                            formData={formData}
                            editing={editing}
                            saveLoading={profileSaveLoading}
                            onInputChange={handleInputChange}
                            onEdit={() => setEditing(true)}
                            onSave={handleSaveProfile}
                            onCancel={() => setEditing(false)}
                            onLogout={handleLogout}
                        />
                    )}

                    {/* Address Tab Content */}
                    {activeTab === 'address' && (
                        <>
                            {/* Address Form */}
                            {showAddressForm && (
                                <View style={{ marginHorizontal: 12, marginTop: 12 }}>
                                    <AddressForm
                                        newAddress={newAddress}
                                        saveLoading={addressSaveLoading}
                                        gpsLoading={gpsLoading}
                                        onInputChange={handleAddressInputChange}
                                        onSave={handleAddAddress}
                                        onCancel={() => setShowAddressForm(false)}
                                        onGetGPS={handleGetGPS}
                                    />
                                </View>
                            )}

                            {/* Address List */}
                            <AddressList
                                addresses={addresses}
                                onSetDefault={handleSetDefaultAddress}
                                onDelete={handleDeleteAddress}
                                showAddForm={showAddressForm}
                                onToggleAddForm={() => setShowAddressForm(!showAddressForm)}
                            />
                        </>
                    )}

                    <View style={{ height: 30 }} />
                </ScrollView>
            </SafeAreaView>
            <BottomNavigation activeRoute={activeRoute} onNavigate={handleNavigate} />
        </View>
    );
}

const styles = StyleSheet.create({
    screenContainer: {
        flex: 1,
        backgroundColor: '#f8f8f8',
    },
    container: {
        flex: 1,
        backgroundColor: '#f8f8f8',
    },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    notLoggedInText: {
        fontSize: 16,
        color: '#999',
    },
    content: {
        flex: 1,
    },
});
