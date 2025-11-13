import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { useContext, useState, useEffect } from 'react';
import { AuthContext, useAddresses } from 'customer-shared';

export default function ProfileScreen({ navigation }) {
    const { user, setUser, logout } = useContext(AuthContext);
    const { addresses, loading: addressLoading, addAddress: addAddressHook } = useAddresses(user?.id);

    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
    });
    const [loading, setLoading] = useState(false);

    // Initialize form with user data
    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
            });
        }
    }, [user]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSaveProfile = async () => {
        try {
            setLoading(true);
            const updatedUser = { ...user, ...formData };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setEditMode(false);
            alert('Cập nhật thông tin thành công!');
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Lỗi cập nhật thông tin');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigation.navigate('Login');
    };

    if (!user) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <Text style={styles.notLoggedInText}>Vui lòng đăng nhập</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            {/* Avatar Section */}
            <View style={styles.avatarSection}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                        {formData.name.charAt(0).toUpperCase() || 'U'}
                    </Text>
                </View>
                <Text style={styles.userName}>{formData.name || 'User'}</Text>
                <Text style={styles.userEmail}>{formData.email}</Text>
            </View>

            {/* Edit Mode Toggle */}
            <View style={styles.buttonRow}>
                {editMode ? (
                    <>
                        <TouchableOpacity
                            style={[styles.button, styles.saveBtn]}
                            onPress={handleSaveProfile}
                            disabled={loading}
                        >
                            <Text style={styles.buttonText}>
                                {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelBtn]}
                            onPress={() => setEditMode(false)}
                        >
                            <Text style={styles.buttonText}>Hủy</Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    <TouchableOpacity
                        style={[styles.button, styles.editBtn]}
                        onPress={() => setEditMode(true)}
                    >
                        <Text style={styles.buttonText}>Chỉnh sửa</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Personal Information Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Họ và tên</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.name}
                        onChangeText={(text) => handleInputChange('name', text)}
                        placeholder="Nhập tên của bạn"
                        editable={editMode}
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Email</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.email}
                        onChangeText={(text) => handleInputChange('email', text)}
                        placeholder="Nhập email"
                        keyboardType="email-address"
                        editable={editMode}
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Số điện thoại</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.phone}
                        onChangeText={(text) => handleInputChange('phone', text)}
                        placeholder="Nhập số điện thoại"
                        keyboardType="phone-pad"
                        editable={editMode}
                    />
                </View>
            </View>

            {/* Addresses Section */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Địa chỉ giao hàng</Text>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('SavedAddresses')}
                    >
                        <Text style={styles.viewAllLink}>Xem tất cả ›</Text>
                    </TouchableOpacity>
                </View>

                {addressLoading ? (
                    <ActivityIndicator size="small" color="#ff6b35" style={{ marginVertical: 10 }} />
                ) : addresses.length > 0 ? (
                    <View>
                        {addresses.slice(0, 2).map((addr) => (
                            <View key={addr.id} style={styles.addressPreview}>
                                <Text style={styles.addressText}>{addr.address_line}</Text>
                                <Text style={styles.addressDetail}>
                                    {addr.district}, {addr.city}
                                </Text>
                                {addr.is_default && (
                                    <Text style={styles.defaultBadge}>Địa chỉ mặc định</Text>
                                )}
                            </View>
                        ))}
                        {addresses.length > 2 && (
                            <Text style={styles.moreAddresses}>+{addresses.length - 2} địa chỉ khác</Text>
                        )}
                    </View>
                ) : (
                    <Text style={styles.noDataText}>Chưa có địa chỉ nào</Text>
                )}

                <TouchableOpacity
                    style={styles.addAddressBtn}
                    onPress={() => navigation.navigate('SavedAddresses')}
                >
                    <Text style={styles.addAddressBtnText}>+ Thêm địa chỉ</Text>
                </TouchableOpacity>
            </View>

            {/* Settings Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Cài đặt</Text>

                <TouchableOpacity style={styles.settingItem}>
                    <Text style={styles.settingLabel}>Thông báo</Text>
                    <Text style={styles.settingArrow}>›</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.settingItem}>
                    <Text style={styles.settingLabel}>Phương thức thanh toán</Text>
                    <Text style={styles.settingArrow}>›</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.settingItem}>
                    <Text style={styles.settingLabel}>Về ứng dụng</Text>
                    <Text style={styles.settingArrow}>›</Text>
                </TouchableOpacity>
            </View>

            {/* Logout Button */}
            <TouchableOpacity
                style={styles.logoutBtn}
                onPress={handleLogout}
            >
                <Text style={styles.logoutText}>Đăng xuất</Text>
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
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    notLoggedInText: {
        fontSize: 16,
        color: '#666',
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
    buttonRow: {
        flexDirection: 'row',
        paddingHorizontal: 15,
        paddingVertical: 12,
        gap: 10,
    },
    button: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    editBtn: {
        backgroundColor: '#ff6b35',
    },
    saveBtn: {
        backgroundColor: '#4caf50',
    },
    cancelBtn: {
        backgroundColor: '#ccc',
    },
    buttonText: {
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
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#333',
        textTransform: 'uppercase',
    },
    viewAllLink: {
        fontSize: 12,
        color: '#ff6b35',
        fontWeight: '600',
    },
    formGroup: {
        marginBottom: 15,
    },
    label: {
        fontSize: 12,
        fontWeight: '600',
        color: '#999',
        textTransform: 'uppercase',
        marginBottom: 6,
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
    addressPreview: {
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        padding: 12,
        marginBottom: 10,
        borderLeftWidth: 3,
        borderLeftColor: '#ff6b35',
    },
    addressText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    addressDetail: {
        fontSize: 12,
        color: '#666',
    },
    defaultBadge: {
        fontSize: 10,
        color: '#ff6b35',
        fontWeight: '700',
        marginTop: 6,
    },
    moreAddresses: {
        fontSize: 12,
        color: '#999',
        textAlign: 'center',
        marginVertical: 10,
    },
    noDataText: {
        fontSize: 13,
        color: '#999',
        textAlign: 'center',
        marginVertical: 10,
    },
    addAddressBtn: {
        borderWidth: 2,
        borderColor: '#ff6b35',
        borderStyle: 'dashed',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
        marginTop: 10,
    },
    addAddressBtnText: {
        fontSize: 13,
        color: '#ff6b35',
        fontWeight: '600',
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
