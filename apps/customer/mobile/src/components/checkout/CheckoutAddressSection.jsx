/**
 * CheckoutAddressSection.jsx
 * Handles delivery address selection/input with GPS support
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export const CheckoutAddressSection = ({
    selectedAddress,
    onAddressSelect,
    gpsLoading = false,
    onRequestGPS,
    manualAddress,
    onManualAddressChange,
    addressError = null,
    savedAddresses = [],
}) => {
    const [showAddressList, setShowAddressList] = useState(false);
    const [showManualInput, setShowManualInput] = useState(!selectedAddress);

    const handleSelectSavedAddress = (address) => {
        onAddressSelect?.(address);
        setShowAddressList(false);
        setShowManualInput(false);
    };

    const handleGPSRequest = async () => {
        if (onRequestGPS) {
            try {
                await onRequestGPS();
                // Keep showManualInput true so user can edit the GPS address
                setShowManualInput(true);
            } catch (error) {
                Alert.alert('GPS Error', error.message || 'Failed to get GPS location');
            }
        }
    };

    return (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <MaterialIcons name="location-on" size={20} color="#ff6b35" />
                <Text style={styles.sectionTitle}>Delivery Address</Text>
            </View>

            {/* Selected Address Display */}
            {selectedAddress && !showManualInput && (
                <View style={styles.selectedAddressContainer}>
                    <View style={styles.addressInfo}>
                        <MaterialIcons name="check-circle" size={20} color="#4caf50" />
                        <View style={{ flex: 1, marginLeft: 8 }}>
                            <Text style={styles.addressLabel}>
                                {selectedAddress.label || 'Delivery Address'}
                            </Text>
                            <Text style={styles.addressText} numberOfLines={2}>
                                {selectedAddress.address_line || selectedAddress.address}
                            </Text>
                            {selectedAddress.latitude && (
                                <Text style={styles.gpsText}>
                                    GPS: {selectedAddress.latitude.toFixed(4)}, {selectedAddress.longitude.toFixed(4)}
                                </Text>
                            )}
                        </View>
                    </View>
                    <TouchableOpacity
                        onPress={() => setShowManualInput(true)}
                        style={styles.editButton}
                    >
                        <MaterialIcons name="edit" size={18} color="#ff6b35" />
                    </TouchableOpacity>
                </View>
            )}

            {/* Manual Address Input */}
            {showManualInput && (
                <View>
                    {/* GPS Button */}
                    <TouchableOpacity
                        style={styles.gpsButton}
                        onPress={handleGPSRequest}
                        disabled={gpsLoading}
                    >
                        {gpsLoading ? (
                            <>
                                <ActivityIndicator size="small" color="#fff" />
                                <Text style={styles.gpsButtonText}>Getting Location...</Text>
                            </>
                        ) : (
                            <>
                                <MaterialIcons name="my-location" size={18} color="#fff" />
                                <Text style={styles.gpsButtonText}>Use GPS Location</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    {/* Manual Address Input */}
                    <Text style={styles.orText}>OR</Text>
                    <View style={styles.fieldContainer}>
                        <Text style={styles.label}>Delivery Address *</Text>
                        <TextInput
                            style={[
                                styles.addressInput,
                                addressError && styles.inputError,
                            ]}
                            placeholder="Enter full delivery address"
                            placeholderTextColor="#aaa"
                            value={manualAddress || ''}
                            onChangeText={onManualAddressChange}
                            multiline
                            numberOfLines={3}
                            textAlignVertical="top"
                        />
                        {addressError && (
                            <Text style={styles.errorText}>{addressError}</Text>
                        )}
                    </View>
                </View>
            )}

            {/* Saved Addresses List */}
            {savedAddresses.length > 0 && (
                <>
                    <TouchableOpacity
                        style={styles.showAddressesButton}
                        onPress={() => setShowAddressList(!showAddressList)}
                    >
                        <MaterialIcons
                            name={showAddressList ? "expand-less" : "expand-more"}
                            size={20}
                            color="#ff6b35"
                        />
                        <Text style={styles.showAddressesText}>
                            Saved Addresses ({savedAddresses.length})
                        </Text>
                    </TouchableOpacity>

                    {showAddressList && (
                        <ScrollView style={styles.addressesList} scrollEnabled={false}>
                            {savedAddresses.map((address) => (
                                <TouchableOpacity
                                    key={address.id}
                                    style={styles.addressItem}
                                    onPress={() => handleSelectSavedAddress(address)}
                                >
                                    <View style={styles.addressItemContent}>
                                        <Text style={styles.addressItemLabel}>
                                            {address.label} {address.is_default && '(Default)'}
                                        </Text>
                                        <Text style={styles.addressItemText} numberOfLines={1}>
                                            {address.address_line}
                                        </Text>
                                    </View>
                                    <MaterialIcons name="chevron-right" size={20} color="#ccc" />
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    )}
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    section: {
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 16,
        marginBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1a1a1a',
    },
    selectedAddressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#f0f8f5',
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#4caf50',
    },
    addressInfo: {
        flexDirection: 'row',
        flex: 1,
    },
    addressLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#4caf50',
    },
    addressText: {
        fontSize: 13,
        color: '#1a1a1a',
        marginTop: 2,
    },
    gpsText: {
        fontSize: 11,
        color: '#999',
        marginTop: 2,
    },
    editButton: {
        padding: 8,
    },
    gpsButton: {
        backgroundColor: '#ff6b35',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 12,
    },
    gpsButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
    orText: {
        textAlign: 'center',
        color: '#999',
        fontSize: 12,
        marginVertical: 8,
        fontWeight: '500',
    },
    fieldContainer: {
        marginBottom: 12,
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 6,
    },
    addressInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
        color: '#1a1a1a',
        minHeight: 90,
    },
    inputError: {
        borderColor: '#e53935',
        backgroundColor: '#ffebee',
    },
    errorText: {
        fontSize: 12,
        color: '#e53935',
        marginTop: 4,
    },
    showAddressesButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 8,
        gap: 8,
        marginTop: 12,
    },
    showAddressesText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#ff6b35',
    },
    addressesList: {
        marginTop: 8,
        maxHeight: 250,
    },
    addressItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10,
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f5f5f5',
    },
    addressItemContent: {
        flex: 1,
    },
    addressItemLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1a1a1a',
    },
    addressItemText: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
});
