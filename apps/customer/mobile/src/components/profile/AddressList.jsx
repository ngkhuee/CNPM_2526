// components/profile/AddressList.jsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function AddressList({
    addresses,
    onSetDefault,
    onDelete,
    showAddForm,
    onToggleAddForm,
}) {
    return (
        <View style={styles.section}>
            <View style={styles.addressHeader}>
                <Text style={styles.sectionTitle}>Địa chỉ giao hàng</Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={onToggleAddForm}
                >
                    <MaterialIcons name="add" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            {addresses.length > 0 ? (
                addresses.map(address => (
                    <View key={address.id} style={styles.addressCard}>
                        <View style={styles.addressCardHeader}>
                            <View style={styles.addressInfo}>
                                <View style={styles.addressLocation}>
                                    <MaterialIcons
                                        name="location-on"
                                        size={20}
                                        color="#FF6B35"
                                    />
                                    <View style={styles.addressDetails}>
                                        <Text style={styles.addressTitle}>
                                            {address.district}, {address.city}
                                        </Text>
                                        <Text style={styles.addressText}>
                                            {address.address_line}
                                        </Text>
                                        {address.note && (
                                            <Text style={styles.addressNote}>
                                                Ghi chú: {address.note}
                                            </Text>
                                        )}
                                    </View>
                                </View>
                            </View>
                            {address.isDefault && (
                                <View style={styles.defaultBadge}>
                                    <Text style={styles.defaultBadgeText}>Mặc định</Text>
                                </View>
                            )}
                        </View>
                        <View style={styles.addressActions}>
                            {!address.isDefault && (
                                <TouchableOpacity
                                    style={styles.actionButton}
                                    onPress={() => onSetDefault(address.id)}
                                >
                                    <Text style={styles.actionButtonText}>Đặt làm mặc định</Text>
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity
                                style={[styles.actionButton, styles.deleteButton]}
                                onPress={() => onDelete(address.id)}
                            >
                                <MaterialIcons name="delete" size={18} color="#f44336" />
                                <Text style={styles.deleteButtonText}>Xóa</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))
            ) : (
                <View style={styles.emptyState}>
                    <MaterialIcons name="location-off" size={48} color="#ccc" />
                    <Text style={styles.emptyStateText}>Chưa có địa chỉ nào</Text>
                    <Text style={styles.emptyStateSubtext}>
                        Thêm địa chỉ giao hàng đầu tiên của bạn
                    </Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    section: {
        backgroundColor: '#fff',
        margin: 12,
        borderRadius: 8,
        padding: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    addressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    addButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FF6B35',
        justifyContent: 'center',
        alignItems: 'center',
    },
    addressCard: {
        borderWidth: 1,
        borderColor: '#f0f0f0',
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        backgroundColor: '#fafafa',
    },
    addressCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    addressInfo: {
        flex: 1,
    },
    addressLocation: {
        flexDirection: 'row',
    },
    addressDetails: {
        marginLeft: 10,
        flex: 1,
    },
    addressTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    addressText: {
        fontSize: 13,
        color: '#666',
        marginTop: 2,
    },
    addressNote: {
        fontSize: 12,
        color: '#999',
        marginTop: 4,
        fontStyle: 'italic',
    },
    defaultBadge: {
        backgroundColor: '#4caf50',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 4,
    },
    defaultBadgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    addressActions: {
        flexDirection: 'row',
        gap: 10,
    },
    actionButton: {
        flex: 1,
        paddingVertical: 8,
        paddingHorizontal: 10,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#FF6B35',
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionButtonText: {
        color: '#FF6B35',
        fontSize: 12,
        fontWeight: '600',
    },
    deleteButton: {
        flexDirection: 'row',
        borderColor: '#f44336',
    },
    deleteButtonText: {
        color: '#f44336',
        fontSize: 12,
        fontWeight: '600',
        marginLeft: 4,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyStateText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#999',
        marginTop: 12,
    },
    emptyStateSubtext: {
        fontSize: 13,
        color: '#bbb',
        marginTop: 4,
    },
});
