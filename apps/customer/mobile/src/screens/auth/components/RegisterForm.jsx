// components/RegisterForm.jsx - Tách UI Register
import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export const RegisterForm = ({ formData, updateField, toggleTerms, onSubmit, loading }) => {
    return (
        <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Create New Account</Text>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter your name"
                    placeholderTextColor="#999"
                    editable={!loading}
                    value={formData.name}
                    onChangeText={(text) => updateField('name', text)}
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
                    placeholderTextColor="#999"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!loading}
                    value={formData.email}
                    onChangeText={(text) => updateField('email', text)}
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter your password"
                    placeholderTextColor="#999"
                    secureTextEntry={true}
                    editable={!loading}
                    value={formData.password}
                    onChangeText={(text) => updateField('password', text)}
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Phone (Optional)</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter your phone"
                    placeholderTextColor="#999"
                    keyboardType="phone-pad"
                    editable={!loading}
                    value={formData.phone}
                    onChangeText={(text) => updateField('phone', text)}
                />
            </View>

            <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={toggleTerms}
                disabled={loading}
            >
                <View style={[styles.checkbox, formData.agreeTerms && styles.checkboxChecked]}>
                    {formData.agreeTerms && (
                        <MaterialIcons name="check" size={16} color="#fff" />
                    )}
                </View>
                <Text style={styles.checkboxLabel}>
                    I agree to Terms and Conditions
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                onPress={onSubmit}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" size="small" />
                ) : (
                    <Text style={styles.submitButtonText}>Create Account</Text>
                )}
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    formContainer: {
        paddingHorizontal: 20,
    },
    formTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#000',
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        color: '#333',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        fontSize: 14,
        color: '#000',
        backgroundColor: '#fafafa',
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: '#FF6B35',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    checkboxChecked: {
        backgroundColor: '#FF6B35',
        borderColor: '#FF6B35',
    },
    checkboxLabel: {
        marginLeft: 12,
        fontSize: 14,
        color: '#666',
    },
    submitButton: {
        backgroundColor: '#FF6B35',
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
        marginBottom: 16,
    },
    submitButtonDisabled: {
        opacity: 0.6,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
