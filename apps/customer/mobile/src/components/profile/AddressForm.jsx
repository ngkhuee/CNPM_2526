// components/profile/AddressForm.jsx
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Modal,
    FlatList,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

// HCMC Districts data
const HCMC_DISTRICTS = [
    'District 1',
    'District 2',
    'District 3',
    'District 4',
    'District 5',
    'District 6',
    'District 7',
    'District 8',
    'District 9',
    'District 10',
    'District 11',
    'District 12',
    'Binh Tan',
    'Binh Thanh',
    'Can Tho',
    'Cu Chi',
    'Go Vap',
    'Hoc Mon',
    'Nha Be',
    'Phu Nhuan',
    'Tan Binh',
    'Tan Phu',
    'Thu Duc City',
];

const CITIES = ['Ho Chi Minh'];

export default function AddressForm({
    newAddress,
    saveLoading,
    gpsLoading,
    onInputChange,
    onSave,
    onCancel,
    onGetGPS,
}) {
    const [showCityPicker, setShowCityPicker] = useState(false);
    const [showDistrictPicker, setShowDistrictPicker] = useState(false);

    const renderPickerModal = (visible, onClose, title, items, selectedValue, onSelect) => (
        <Modal
            transparent
            animationType="fade"
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.pickerContainer}>
                    <View style={styles.pickerHeader}>
                        <Text style={styles.pickerTitle}>{title}</Text>
                        <TouchableOpacity onPress={onClose}>
                            <MaterialIcons name="close" size={24} color="#666" />
                        </TouchableOpacity>
                    </View>
                    <FlatList
                        data={items}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={[
                                    styles.pickerItem,
                                    selectedValue === item && styles.pickerItemSelected,
                                ]}
                                onPress={() => {
                                    onSelect(item);
                                    onClose();
                                }}
                            >
                                <Text style={[
                                    styles.pickerItemText,
                                    selectedValue === item && styles.pickerItemTextSelected,
                                ]}>
                                    {item}
                                </Text>
                                {selectedValue === item && (
                                    <MaterialIcons name="check" size={20} color="#FF6B35" />
                                )}
                            </TouchableOpacity>
                        )}
                        keyExtractor={(item) => item}
                    />
                </View>
            </View>
        </Modal>
    );
    return (
        <View style={styles.addressForm}>
            <Text style={styles.formTitle}>Add New Address</Text>

            {/* City/Province */}
            <View style={styles.formGroup}>
                <Text style={styles.label}>City/Province</Text>
                <TouchableOpacity
                    style={styles.input}
                    onPress={() => setShowCityPicker(true)}
                >
                    <Text style={styles.selectText}>
                        {newAddress.city || 'Select city/province'}
                    </Text>
                    <MaterialIcons name="arrow-drop-down" size={24} color="#FF6B35" />
                </TouchableOpacity>
            </View>

            {/* District */}
            <View style={styles.formGroup}>
                <Text style={styles.label}>District</Text>
                <TouchableOpacity
                    style={styles.input}
                    onPress={() => setShowDistrictPicker(true)}
                >
                    <Text style={styles.selectText}>
                        {newAddress.district || 'Select district'}
                    </Text>
                    <MaterialIcons name="arrow-drop-down" size={24} color="#FF6B35" />
                </TouchableOpacity>
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

            {/* City Picker Modal */}
            {renderPickerModal(
                showCityPicker,
                () => setShowCityPicker(false),
                'Select City',
                CITIES,
                newAddress.city,
                (city) => onInputChange('city', city)
            )}

            {/* District Picker Modal */}
            {renderPickerModal(
                showDistrictPicker,
                () => setShowDistrictPicker(false),
                'Select District',
                HCMC_DISTRICTS,
                newAddress.district,
                (district) => onInputChange('district', district)
            )}
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    pickerContainer: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        maxHeight: '80%',
    },
    pickerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    pickerTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    pickerItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    pickerItemSelected: {
        backgroundColor: '#fff8f3',
    },
    pickerItemText: {
        fontSize: 14,
        color: '#666',
        flex: 1,
    },
    pickerItemTextSelected: {
        color: '#FF6B35',
        fontWeight: '600',
    },
});
