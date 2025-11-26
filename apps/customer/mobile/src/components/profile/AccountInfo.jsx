// components/profile/AccountInfo.jsx
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import DatePickerModal from './DatePickerModal';

export default function AccountInfo({
    formData,
    editing,
    saveLoading,
    onInputChange,
    onEdit,
    onSave,
    onCancel,
    onLogout,
}) {
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedDate, setSelectedDate] = useState(
        formData.dob ? new Date(formData.dob) : new Date()
    );
    return (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông tin tài khoản</Text>

            {/* Email - Read Only */}
            <View style={styles.formGroup}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                    style={[styles.input, styles.readonlyInput]}
                    value={formData.email}
                    editable={false}
                    placeholderTextColor="#ccc"
                />
            </View>

            {/* Full Name */}
            <View style={styles.formGroup}>
                <Text style={styles.label}>Họ và tên</Text>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={[styles.input, !editing && styles.disabledInput]}
                        value={formData.name}
                        onChangeText={value => onInputChange('name', value)}
                        editable={editing}
                        placeholderTextColor="#ccc"
                        placeholder="Nhập họ tên"
                    />
                    {editing && <MaterialIcons name="check-circle" size={20} color="#4caf50" />}
                </View>
            </View>

            {/* Phone */}
            <View style={styles.formGroup}>
                <Text style={styles.label}>Số điện thoại</Text>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={[styles.input, !editing && styles.disabledInput]}
                        value={formData.phone}
                        onChangeText={value => onInputChange('phone', value)}
                        editable={editing}
                        placeholder="Nhập số điện thoại"
                        placeholderTextColor="#ccc"
                        keyboardType="phone-pad"
                    />
                    {editing && <MaterialIcons name="check-circle" size={20} color="#4caf50" />}
                </View>
            </View>

            {/* Gender */}
            <View style={styles.formGroup}>
                <Text style={styles.label}>Giới tính</Text>
                <View style={styles.radioGroup}>
                    <TouchableOpacity
                        style={styles.radioOption}
                        onPress={() => editing && onInputChange('gender', 'Male')}
                    >
                        <View
                            style={[
                                styles.radioButton,
                                formData.gender === 'Male' && styles.radioButtonSelected,
                            ]}
                        />
                        <Text style={styles.radioLabel}>Nam</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.radioOption}
                        onPress={() => editing && onInputChange('gender', 'Female')}
                    >
                        <View
                            style={[
                                styles.radioButton,
                                formData.gender === 'Female' && styles.radioButtonSelected,
                            ]}
                        />
                        <Text style={styles.radioLabel}>Nữ</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Date of Birth */}
            <View style={styles.formGroup}>
                <Text style={styles.label}>Ngày sinh</Text>
                {!editing ? (
                    <View style={[styles.input, styles.disabledInput, { justifyContent: 'center' }]}>
                        <Text style={{ color: formData.dob ? '#333' : '#ccc', fontSize: 14 }}>
                            {formData.dob ? new Date(formData.dob).toLocaleDateString() : 'Chọn ngày sinh'}
                        </Text>
                    </View>
                ) : (
                    <TouchableOpacity
                        style={[styles.input, styles.datePickerButton]}
                        onPress={() => {
                            setSelectedDate(formData.dob ? new Date(formData.dob) : new Date());
                            setShowDatePicker(true);
                        }}
                    >
                        <Text style={{ fontSize: 14, color: '#333', flex: 1 }}>
                            {formData.dob ? new Date(formData.dob).toLocaleDateString() : 'Chạm để chọn ngày'}
                        </Text>
                        <MaterialIcons name="calendar-today" size={20} color="#FF6B35" />
                    </TouchableOpacity>
                )}

                {/* Custom Date Picker Modal */}
                <DatePickerModal
                    visible={showDatePicker && editing}
                    selectedDate={selectedDate}
                    onDateChange={setSelectedDate}
                    onConfirm={(date) => {
                        // Format date to YYYY-MM-DD
                        const year = date.getFullYear();
                        const month = String(date.getMonth() + 1).padStart(2, '0');
                        const day = String(date.getDate()).padStart(2, '0');
                        const formattedDate = `${year}-${month}-${day}`;
                        onInputChange('dob', formattedDate);
                        setShowDatePicker(false);
                    }}
                    onCancel={() => setShowDatePicker(false)}
                />
            </View>

            {/* Action Buttons */}
            <View style={styles.actions}>
                {editing ? (
                    <>
                        <TouchableOpacity
                            style={[styles.button, styles.buttonPrimary]}
                            onPress={onSave}
                            disabled={saveLoading}
                        >
                            {saveLoading ? (
                                <ActivityIndicator color="#fff" size="small" />
                            ) : (
                                <Text style={styles.buttonText}>Lưu thay đổi</Text>
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, styles.buttonSecondary]}
                            onPress={onCancel}
                        >
                            <Text style={styles.buttonSecondaryText}>Hủy</Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    <TouchableOpacity
                        style={[styles.button, styles.buttonPrimary]}
                        onPress={onEdit}
                    >
                        <MaterialIcons name="edit" size={18} color="#fff" />
                        <Text style={[styles.buttonText, { marginLeft: 8 }]}>Chỉnh sửa hồ sơ</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Logout Button */}
            <TouchableOpacity
                style={[styles.button, styles.buttonLogout]}
                onPress={onLogout}
            >
                <MaterialIcons name="logout" size={18} color="#fff" />
                <Text style={[styles.buttonText, { marginLeft: 8 }]}>Đăng xuất</Text>
            </TouchableOpacity>
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
        flex: 1,
    },
    readonlyInput: {
        backgroundColor: '#f5f5f5',
        color: '#999',
    },
    disabledInput: {
        backgroundColor: '#f5f5f5',
        color: '#999',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    radioGroup: {
        flexDirection: 'row',
    },
    radioOption: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 24,
    },
    radioButton: {
        width: 18,
        height: 18,
        borderRadius: 9,
        borderWidth: 2,
        borderColor: '#ddd',
        marginRight: 8,
    },
    radioButtonSelected: {
        borderColor: '#FF6B35',
        backgroundColor: '#FF6B35',
    },
    radioLabel: {
        fontSize: 14,
        color: '#333',
    },
    actions: {
        marginTop: 20,
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
    buttonLogout: {
        backgroundColor: '#f44336',
        marginTop: 10,
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
    datePickerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 6,
        backgroundColor: '#fff',
    },
});
