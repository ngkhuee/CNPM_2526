// components/profile/AddressForm.jsx
import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function AddressForm({
    newAddress,
    saveLoading,
    gpsLoading,
    onInputChange,
    onSave,
    onCancel,
    onGetGPS,
}) {
    return (
        <View style={styles.addressForm}>
            <Text style={styles.formTitle}>Add New Address</Text>

            {/* City/Province */}
            <View style={styles.formGroup}>
                <Text style={styles.label}>City/Province</Text>
                <View style={styles.input}>
                    <Text style={styles.selectText}>
                        {newAddress.city || 'Select city/province'}
                    </Text>
                    <MaterialIcons name="arrow-drop-down" size={24} color="#FF6B35" />
                </View>
            </View>

            {/* District */}
            <View style={styles.formGroup}>
                <Text style={styles.label}>District</Text>
                <View style={styles.input}>
                    <Text style={styles.selectText}>
                        {newAddress.district || 'Select district'}
                    </Text>
                    <MaterialIcons name="arrow-drop-down" size={24} color="#FF6B35" />
                </View>
            </View>

            {/* Street Address */}
            <View style={styles.formGroup}>
                <Text style={styles.label}>
                    Street Address
                    {newAddress.lat && newAddress.lng && (
                        <Text style={styles.gpsIndicator}> (GPS-filled)</Text>
                    )}
                </Text>
                <TextInput
                    style={styles.input}
                    value={newAddress.address_line}
                    onChangeText={value => onInputChange('address_line', value)}
                    placeholder="Street address, building number, etc."
                    placeholderTextColor="#ccc"
                />
            </View>

            {/* Note */}
            <View style={styles.formGroup}>
                <Text style={styles.label}>Note (Optional)</Text>
                <TextInput
                    style={styles.input}
                    value={newAddress.note}
                    onChangeText={value => onInputChange('note', value)}
                    placeholder="e.g., Near the park, Gate 2, etc."
                    placeholderTextColor="#ccc"
                />
            </View>

            {/* GPS Button */}
            <TouchableOpacity style={styles.gpsButton} onPress={onGetGPS} disabled={gpsLoading}>
                {gpsLoading ? (
                    <ActivityIndicator color="#FF6B35" size="small" />
                ) : (
                    <>
                        <MaterialIcons name="gps-fixed" size={18} color="#FF6B35" />
                        <Text style={styles.gpsButtonText}>Get Current GPS Location</Text>
                    </>
                )}
            </TouchableOpacity>

            {/* Default Checkbox */}
            <View style={styles.checkboxGroup}>
                <TouchableOpacity
                    style={styles.checkbox}
                    onPress={() => onInputChange('isDefault', !newAddress.isDefault)}
                >
                    {newAddress.isDefault && (
                        <MaterialIcons name="check" size={18} color="#FF6B35" />
                    )}
                </TouchableOpacity>
                <Text style={styles.checkboxLabel}>
                    Set as default delivery address
                </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.addressFormActions}>
                <TouchableOpacity
                    style={[styles.button, styles.buttonPrimary]}
                    onPress={onSave}
                    disabled={saveLoading}
                >
                    {saveLoading ? (
                        <ActivityIndicator color="#fff" size="small" />
                    ) : (
                        <Text style={styles.buttonText}>Add Address</Text>
                    )}
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.button, styles.buttonSecondary]}
                    onPress={onCancel}
                >
                    <Text style={styles.buttonSecondaryText}>Cancel</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    addressForm: {
        backgroundColor: '#f9f9f9',
        borderWidth: 1,
        borderColor: '#f0f0f0',
        borderRadius: 8,
        padding: 16,
        marginBottom: 16,
    },
    formTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 16,
    },
    formGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
        color: '#333',
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    selectText: {
        flex: 1,
        fontSize: 14,
        color: '#333',
    },
    gpsIndicator: {
        color: '#4caf50',
        fontWeight: '600',
    },
    gpsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#FF6B35',
        borderRadius: 6,
        paddingVertical: 12,
        marginBottom: 16,
    },
    gpsButtonText: {
        marginLeft: 8,
        color: '#FF6B35',
        fontSize: 14,
        fontWeight: '600',
    },
    checkboxGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderWidth: 2,
        borderColor: '#ddd',
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    checkboxLabel: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },
    addressFormActions: {
        gap: 10,
    },
    button: {
        borderRadius: 6,
        paddingVertical: 12,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonPrimary: {
        backgroundColor: '#FF6B35',
    },
    buttonSecondary: {
        backgroundColor: '#f0f0f0',
        borderWidth: 1,
        borderColor: '#ddd',
    },
    buttonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    buttonSecondaryText: {
        color: '#666',
        fontSize: 14,
        fontWeight: '600',
    },
});
