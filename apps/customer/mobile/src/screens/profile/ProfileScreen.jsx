// screens/profile/ProfileScreen.jsx
import React, { useState, useContext } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    Text,
    SafeAreaView,
    TouchableOpacity,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { NavigationContext } from '../../contexts/NavigationContext';
import { AuthContext } from '../../contexts/AuthContext';
import BottomNavigation from '../../components/BottomNavigation';
import ProfileHeader from '../../components/profile/ProfileHeader';
import ProfileTabs from '../../components/profile/ProfileTabs';
import AccountInfo from '../../components/profile/AccountInfo';
import AddressList from '../../components/profile/AddressList';
import AddressForm from '../../components/profile/AddressForm';
import { useProfile } from '../../hooks/useProfile';
import { useAddress } from '../../hooks/useAddress';

export default function ProfileScreen({ onNavigate }) {
    const { activeRoute, navigate } = useContext(NavigationContext);
    const { isAuthenticated } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('account');

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
        if (onNavigate) {
            onNavigate(route);
        }
        navigate(route);
    };

    // Check if user is authenticated - show login prompt instead of profile
    if (!isAuthenticated) {
        return (
            <View style={styles.screenContainer}>
                <SafeAreaView style={styles.container}>
                    <View style={styles.loginPromptContainer}>
                        <MaterialIcons
                            name="lock"
                            size={48}
                            color="#ff6b35"
                            style={styles.lockIcon}
                        />
                        <Text style={styles.modalTitle}>Yêu cầu đăng nhập</Text>
                        <Text style={styles.modalSubtitle}>
                            Đăng nhập để xem hồ sơ và quản lý địa chỉ
                        </Text>

                        <TouchableOpacity
                            style={styles.modalLoginButton}
                            onPress={() => {
                                handleNavigate('login');
                            }}
                        >
                            <Text style={styles.modalLoginButtonText}>Đăng nhập</Text>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
                <BottomNavigation activeRoute={activeRoute} onNavigate={handleNavigate} />
            </View>
        );
    }

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
                    <Text style={styles.notLoggedInText}>Vui lòng đăng nhập</Text>
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
        paddingHorizontal: 20,
    },
    notLoggedInText: {
        fontSize: 18,
        color: '#333',
        marginTop: 16,
        fontWeight: '600',
    },
    notLoggedInSubtitle: {
        fontSize: 14,
        color: '#666',
        marginTop: 8,
        textAlign: 'center',
    },
    loginButton: {
        marginTop: 24,
        backgroundColor: '#FF6B35',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 8,
    },
    loginButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    content: {
        flex: 1,
    },
    emptyContainer: {
        flex: 1,
        backgroundColor: '#f8f8f8',
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContent: {
        alignItems: 'center',
        gap: 16,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1a1a1a',
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        maxWidth: 280,
    },
    browseButton: {
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 24,
        marginTop: 8,
    },
    browseButtonText: {
        color: '#666',
        fontSize: 14,
        fontWeight: '600',
    },
    loginPromptButton: {
        backgroundColor: '#ff6b35',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 24,
        marginTop: 8,
    },
    loginPromptButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    // Login prompt styles
    loginPromptContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    loginPromptBox: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        width: '100%',
        maxWidth: 320,
    },
    lockIcon: {
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1a1a1a',
        marginBottom: 8,
    },
    modalSubtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 20,
    },
    modalLoginButton: {
        backgroundColor: '#ff6b35',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 32,
        width: '100%',
        alignItems: 'center',
        marginBottom: 12,
    },
    modalLoginButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    modalBackButton: {
        borderWidth: 1,
        borderColor: '#ff6b35',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 24,
        width: '100%',
        alignItems: 'center',
        marginTop: 12,
    },
    modalBackButtonText: {
        color: '#ff6b35',
        fontSize: 14,
        fontWeight: '600',
    },
    modalCloseButton: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalCloseButtonText: {
        color: '#ff6b35',
        fontSize: 14,
        fontWeight: '600',
    },
});

