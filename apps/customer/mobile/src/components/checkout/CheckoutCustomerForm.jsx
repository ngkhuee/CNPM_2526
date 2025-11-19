/**
 * CheckoutCustomerForm.jsx
 * Handles customer information input (name, phone, email)
 */

import React from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export const CheckoutCustomerForm = ({
    data,
    errors = {},
    onChange,
    onBlur,
}) => {
    const handleFieldChange = (field, value) => {
        onChange({ ...data, [field]: value });
    };

    return (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <MaterialIcons name="person" size={20} color="#ff6b35" />
                <Text style={styles.sectionTitle}>Customer Information</Text>
            </View>

            {/* Name Field */}
            <View style={styles.fieldContainer}>
                <Text style={styles.label}>Full Name *</Text>
                <TextInput
                    style={[styles.input, errors.customerName && styles.inputError]}
                    placeholder="Enter full name"
                    placeholderTextColor="#aaa"
                    value={data.customerName || ''}
                    onChangeText={(val) => handleFieldChange('customerName', val)}
                    onBlur={() => onBlur?.('customerName')}
                />
                {errors.customerName && (
                    <Text style={styles.errorText}>{errors.customerName}</Text>
                )}
            </View>

            {/* Phone Field */}
            <View style={styles.fieldContainer}>
                <Text style={styles.label}>Phone Number *</Text>
                <TextInput
                    style={[styles.input, errors.phone && styles.inputError]}
                    placeholder="Enter phone number"
                    placeholderTextColor="#aaa"
                    value={data.phone || ''}
                    onChangeText={(val) => handleFieldChange('phone', val)}
                    onBlur={() => onBlur?.('phone')}
                    keyboardType="phone-pad"
                />
                {errors.phone && (
                    <Text style={styles.errorText}>{errors.phone}</Text>
                )}
            </View>

            {/* Email Field */}
            <View style={styles.fieldContainer}>
                <Text style={styles.label}>Email Address *</Text>
                <TextInput
                    style={[styles.input, errors.email && styles.inputError]}
                    placeholder="Enter email address"
                    placeholderTextColor="#aaa"
                    value={data.email || ''}
                    onChangeText={(val) => handleFieldChange('email', val)}
                    onBlur={() => onBlur?.('email')}
                    keyboardType="email-address"
                />
                {errors.email && (
                    <Text style={styles.errorText}>{errors.email}</Text>
                )}
            </View>
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
    fieldContainer: {
        marginBottom: 16,
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 6,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
        color: '#1a1a1a',
        backgroundColor: '#fff',
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
});
