// components/tracking/ArrivedPopup.jsx
import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export const ArrivedPopup = ({ visible, onConfirmDelivery }) => {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={() => { }} // Prevent closing by back button
        >
            <View style={styles.overlay}>
                <View style={styles.popup}>
                    <View style={styles.iconContainer}>
                        <MaterialIcons name="check-circle" size={60} color="#4caf50" />
                    </View>

                    <Text style={styles.title}>Đơn hàng đã đến!</Text>

                    <Text style={styles.message}>
                        Đơn hàng của bạn đã đến nơi.{'\n'}
                        Nhấn nút bên dưới để xác nhận bạn đã nhận được hàng.
                    </Text>

                    <TouchableOpacity
                        style={styles.confirmButton}
                        onPress={onConfirmDelivery}
                        activeOpacity={0.8}
                    >
                        <MaterialIcons name="done-all" size={20} color="#fff" />
                        <Text style={styles.confirmButtonText}>Xác nhận đã nhận hàng</Text>
                    </TouchableOpacity>

                    <Text style={styles.note}>
                        Đơn hàng sẽ tự động hoàn thành sau 10 phút nếu không xác nhận.
                    </Text>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    popup: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        width: '100%',
        maxWidth: 340,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    iconContainer: {
        marginBottom: 16,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: '#1a1a1a',
        marginBottom: 12,
        textAlign: 'center',
    },
    message: {
        fontSize: 15,
        color: '#666',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 20,
    },
    confirmButton: {
        backgroundColor: '#4caf50',
        paddingHorizontal: 40,
        paddingVertical: 14,
        borderRadius: 8,
        width: '100%',
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
    },
    confirmButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    note: {
        fontSize: 11,
        color: '#999',
        textAlign: 'center',
        marginTop: 16,
        fontStyle: 'italic',
    },
});
