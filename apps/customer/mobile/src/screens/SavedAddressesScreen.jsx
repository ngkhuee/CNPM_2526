import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    TextInput,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useContext, useState } from 'react';
import { AuthContext, useAddresses } from 'customer-shared';
import { MdAdd, MdDelete, MdCheckCircle } from 'react-icons/md';

export default function SavedAddressesScreen({ navigation }) {
    const { user } = useContext(AuthContext);
    const {
        addresses,
        loading: addressLoading,
        addAddress: addAddressHook,
        deleteAddress: deleteAddressHook,
        setDefaultAddress,
    } = useAddresses(user?.id);

    const [showAddForm, setShowAddForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [newAddress, setNewAddress] = useState({
        address_line: '',
        city: 'TP.HCM',
        district: '',
        lat: null,
        lng: null,
    });

    const handleAddressInputChange = (field, value) => {
        setNewAddress(prev => ({ ...prev, [field]: value }));
    };

    const handleGetGPS = () => {
        if (!navigator.geolocation) {
            Alert.alert('Lỗi', 'Trình duyệt không hỗ trợ GPS');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setNewAddress((prev) => ({
                    ...prev,
                    lat: latitude,
                    lng: longitude,
                }));
                Alert.alert('Thành công', `Đã lấy GPS: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
            },
            (error) => {
                console.error('GPS error:', error);
                Alert.alert('Lỗi', 'Không thể lấy GPS');
            }
        );
    };

    const handleAddAddress = async () => {
        if (!newAddress.address_line || !newAddress.district) {
            Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin địa chỉ');
            return;
        }

        try {
            setLoading(true);
            const result = await addAddressHook(newAddress);

            if (result.success) {
                setNewAddress({
                    address_line: '',
                    city: 'TP.HCM',
                    district: '',
                    lat: null,
                    lng: null,
                });
                setShowAddForm(false);
                Alert.alert('Thành công', 'Thêm địa chỉ thành công!');
            } else {
                Alert.alert('Lỗi', `Không thể thêm địa chỉ: ${result.message}`);
            }
        } catch (error) {
            console.error('Error adding address:', error);
            Alert.alert('Lỗi', 'Lỗi thêm địa chỉ');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAddress = (addressId) => {
        Alert.alert(
            'Xác nhận',
            'Bạn có chắc chắn muốn xóa địa chỉ này?',
            [
                { text: 'Hủy', onPress: () => { } },
                {
                    text: 'Xóa',
                    onPress: async () => {
                        try {
                            setLoading(true);
                            const result = await deleteAddressHook(addressId);
                            if (result.success) {
                                Alert.alert('Thành công', 'Xóa địa chỉ thành công');
                            } else {
                                Alert.alert('Lỗi', `Không thể xóa: ${result.message}`);
                            }
                        } catch (error) {
                            console.error('Error deleting address:', error);
                            Alert.alert('Lỗi', 'Lỗi xóa địa chỉ');
                        } finally {
                            setLoading(false);
                        }
                    },
                    style: 'destructive',
                },
            ]
        );
    };

    const handleSetDefault = async (addressId) => {
        try {
            setLoading(true);
            const result = await setDefaultAddress(addressId);
            if (result.success) {
                Alert.alert('Thành công', 'Đã đặt làm địa chỉ mặc định');
            } else {
                Alert.alert('Lỗi', `Không thể đặt: ${result.message}`);
            }
        } catch (error) {
            console.error('Error setting default:', error);
            Alert.alert('Lỗi', 'Lỗi đặt địa chỉ mặc định');
        } finally {
            setLoading(false);
        }
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
            {/* Header Section */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Địa chỉ giao hàng</Text>
                <TouchableOpacity
                    onPress={() => setShowAddForm(!showAddForm)}
                    style={styles.addBtn}
                >
                    <Text style={styles.addBtnText}>+ Thêm mới</Text>
                </TouchableOpacity>
            </View>

            {/* Add Address Form */}
            {showAddForm && (
                <View style={styles.formSection}>
                    <Text style={styles.formTitle}>Thêm địa chỉ mới</Text>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Địa chỉ chi tiết</Text>
                        <TextInput
                            style={styles.input}
                            value={newAddress.address_line}
                            onChangeText={(text) => handleAddressInputChange('address_line', text)}
                            placeholder="Số nhà, tên đường..."
                            placeholderTextColor="#ccc"
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Quận/Huyện</Text>
                        <TextInput
                            style={styles.input}
                            value={newAddress.district}
                            onChangeText={(text) => handleAddressInputChange('district', text)}
                            placeholder="Quận 1, Quận 2..."
                            placeholderTextColor="#ccc"
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Thành phố</Text>
                        <TextInput
                            style={styles.input}
                            value={newAddress.city}
                            onChangeText={(text) => handleAddressInputChange('city', text)}
                            editable={false}
                        />
                    </View>

                    <TouchableOpacity
                        style={styles.gpsBtn}
                        onPress={handleGetGPS}
                        disabled={loading}
                    >
                        <Text style={styles.gpsBtnText}>
                            {newAddress.lat ? '✓ Đã lấy GPS' : '📍 Lấy vị trí GPS'}
                        </Text>
                    </TouchableOpacity>

                    {newAddress.lat && (
                        <Text style={styles.gpsInfo}>
                            GPS: {newAddress.lat.toFixed(4)}, {newAddress.lng.toFixed(4)}
                        </Text>
                    )}

                    <View style={styles.formActions}>
                        <TouchableOpacity
                            style={[styles.formBtn, styles.saveBtn]}
                            onPress={handleAddAddress}
                            disabled={loading}
                        >
                            <Text style={styles.formBtnText}>
                                {loading ? 'Đang lưu...' : 'Lưu địa chỉ'}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.formBtn, styles.cancelBtn]}
                            onPress={() => setShowAddForm(false)}
                            disabled={loading}
                        >
                            <Text style={styles.formBtnText}>Hủy</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {/* Addresses List */}
            <View style={styles.listSection}>
                {addressLoading ? (
                    <ActivityIndicator size="large" color="#ff6b35" style={{ marginVertical: 20 }} />
                ) : addresses.length === 0 ? (
                    <Text style={styles.noDataText}>Chưa có địa chỉ nào. Thêm địa chỉ đầu tiên ngay!</Text>
                ) : (
                    addresses.map((addr) => (
                        <View key={addr.id} style={styles.addressCard}>
                            <View style={styles.addressContent}>
                                {addr.is_default && (
                                    <View style={styles.defaultBadgeContainer}>
                                        <Text style={styles.defaultBadgeText}>Mặc định</Text>
                                    </View>
                                )}
                                <Text style={styles.addressTitle}>{addr.address_line}</Text>
                                <Text style={styles.addressDetail}>
                                    {addr.district}, {addr.city}
                                </Text>
                                {addr.lat && addr.lng && (
                                    <Text style={styles.addressGPS}>
                                        📍 {addr.lat.toFixed(4)}, {addr.lng.toFixed(4)}
                                    </Text>
                                )}
                            </View>

                            <View style={styles.addressActions}>
                                {!addr.is_default && (
                                    <TouchableOpacity
                                        style={styles.actionBtn}
                                        onPress={() => handleSetDefault(addr.id)}
                                        disabled={loading}
                                    >
                                        <Text style={styles.actionBtnText}>Đặt mặc định</Text>
                                    </TouchableOpacity>
                                )}
                                <TouchableOpacity
                                    style={[styles.actionBtn, styles.deleteBtn]}
                                    onPress={() => handleDeleteAddress(addr.id)}
                                    disabled={loading}
                                >
                                    <Text style={styles.deleteBtnText}>Xóa</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))
                )}
            </View>
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
    header: {
        backgroundColor: '#fff',
        paddingHorizontal: 15,
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#333',
    },
    addBtn: {
        backgroundColor: '#ff6b35',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 6,
    },
    addBtnText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    formSection: {
        backgroundColor: '#fff',
        marginHorizontal: 15,
        marginVertical: 15,
        borderRadius: 12,
        padding: 15,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    formTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#333',
        marginBottom: 15,
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
    gpsBtn: {
        backgroundColor: '#f0f0f0',
        borderWidth: 1,
        borderColor: '#ff6b35',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
        marginBottom: 10,
    },
    gpsBtnText: {
        fontSize: 13,
        color: '#ff6b35',
        fontWeight: '600',
    },
    gpsInfo: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
        marginBottom: 15,
        fontStyle: 'italic',
    },
    formActions: {
        flexDirection: 'row',
        gap: 10,
    },
    formBtn: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    saveBtn: {
        backgroundColor: '#4caf50',
    },
    cancelBtn: {
        backgroundColor: '#ccc',
    },
    formBtnText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '600',
    },
    listSection: {
        paddingHorizontal: 15,
        paddingVertical: 10,
    },
    noDataText: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
        marginVertical: 30,
    },
    addressCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        marginBottom: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#ff6b35',
    },
    addressContent: {
        marginBottom: 12,
    },
    defaultBadgeContainer: {
        alignSelf: 'flex-start',
        backgroundColor: '#fff3e0',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        marginBottom: 8,
    },
    defaultBadgeText: {
        fontSize: 10,
        color: '#ff6b35',
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    addressTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    addressDetail: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
    },
    addressGPS: {
        fontSize: 11,
        color: '#999',
        marginTop: 6,
    },
    addressActions: {
        flexDirection: 'row',
        gap: 8,
    },
    actionBtn: {
        flex: 1,
        paddingVertical: 8,
        borderRadius: 6,
        backgroundColor: '#f0f0f0',
        alignItems: 'center',
    },
    deleteBtn: {
        backgroundColor: '#fee',
    },
    actionBtnText: {
        fontSize: 12,
        color: '#ff6b35',
        fontWeight: '600',
    },
    deleteBtnText: {
        fontSize: 12,
        color: '#dc3545',
        fontWeight: '600',
    },
});
