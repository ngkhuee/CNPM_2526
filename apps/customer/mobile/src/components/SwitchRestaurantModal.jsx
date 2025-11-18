/**
 * SwitchRestaurantModal.jsx - Modal hỏi user muốn làm gì khi thêm từ restaurant khác
 * Cho phép: Checkout giỏ hiện tại, hoặc Clear và thêm từ restaurant mới
 */

import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const SwitchRestaurantModal = ({
    visible,
    currentRestaurant,
    newRestaurant,
    onCheckout,
    onClearAndAdd,
    onCancel
}) => {
    if (!visible) return null;

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onCancel}
        >
            <View style={styles.container}>
                <View style={styles.modal}>
                    {/* Header */}
                    <View style={styles.header}>
                        <MaterialIcons name="info" size={28} color="#ff6b35" />
                        <Text style={styles.title}>Change Restaurant?</Text>
                    </View>

                    {/* Content */}
                    <View style={styles.content}>
                        <Text style={styles.message}>
                            Your cart contains items from <Text style={styles.bold}>{currentRestaurant}</Text>
                        </Text>
                        <Text style={styles.message}>
                            You want to add items from <Text style={styles.bold}>{newRestaurant}</Text>
                        </Text>
                        <Text style={styles.question}>
                            What would you like to do?
                        </Text>
                    </View>

                    {/* Actions */}
                    <View style={styles.actions}>
                        {/* Checkout Button */}
                        <TouchableOpacity
                            style={[styles.button, styles.checkoutButton]}
                            onPress={onCheckout}
                        >
                            <MaterialIcons name="shopping-cart" size={20} color="#fff" />
                            <Text style={[styles.buttonText, styles.checkoutText]}>
                                Checkout Now
                            </Text>
                        </TouchableOpacity>

                        {/* Clear Cart Button */}
                        <TouchableOpacity
                            style={[styles.button, styles.clearButton]}
                            onPress={onClearAndAdd}
                        >
                            <MaterialIcons name="delete" size={20} color="#ff6b35" />
                            <Text style={[styles.buttonText, styles.clearText]}>
                                Clear Cart & Add New
                            </Text>
                        </TouchableOpacity>

                        {/* Cancel Button */}
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton]}
                            onPress={onCancel}
                        >
                            <MaterialIcons name="close" size={20} color="#666" />
                            <Text style={[styles.buttonText, styles.cancelText]}>
                                Cancel
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modal: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        marginHorizontal: 20,
        maxWidth: 350,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 12,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1a1a1a',
    },
    content: {
        marginBottom: 24,
    },
    message: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
        lineHeight: 20,
    },
    bold: {
        fontWeight: '600',
        color: '#1a1a1a',
    },
    question: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1a1a1a',
        marginTop: 12,
    },
    actions: {
        gap: 12,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        gap: 8,
    },
    checkoutButton: {
        backgroundColor: '#ff6b35',
    },
    checkoutText: {
        color: '#fff',
    },
    clearButton: {
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#ff6b35',
    },
    clearText: {
        color: '#ff6b35',
    },
    cancelButton: {
        backgroundColor: '#f5f5f5',
    },
    cancelText: {
        color: '#666',
    },
    buttonText: {
        fontSize: 14,
        fontWeight: '600',
    },
});

export default SwitchRestaurantModal;
