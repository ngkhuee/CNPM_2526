/**
 * CartItem.jsx - Component hiển thị một item trong giỏ hàng
 * Bao gồm: hình ảnh, tên, giá, số lượng, nút xóa
 */

import React from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
    const handleDecrease = () => {
        const newQuantity = item.quantity - 1;
        onUpdateQuantity(item.id, newQuantity);
    };

    const handleIncrease = () => {
        const newQuantity = item.quantity + 1;
        onUpdateQuantity(item.id, newQuantity);
    };

    const handleRemove = () => {
        onRemove(item.id);
    };

    const itemTotal = item.price * item.quantity;

    return (
        <View style={styles.container}>
            {/* Image */}
            <Image
                source={{ uri: item.image || 'https://via.placeholder.com/80' }}
                style={styles.image}
            />

            {/* Content */}
            <View style={styles.content}>
                {/* Name & Price */}
                <View style={styles.header}>
                    <Text style={styles.name} numberOfLines={2}>
                        {item.name}
                    </Text>
                    <Text style={styles.price}>${item.price.toFixed(2)}</Text>
                </View>

                {/* Note */}
                {item.note && (
                    <Text style={styles.note} numberOfLines={1}>
                        Note: {item.note}
                    </Text>
                )}

                {/* Quantity & Total */}
                <View style={styles.footer}>
                    {/* Quantity Selector */}
                    <View style={styles.quantityContainer}>
                        <TouchableOpacity
                            onPress={handleDecrease}
                            style={styles.quantityButton}
                        >
                            <MaterialIcons name="remove" size={16} color="#ff6b35" />
                        </TouchableOpacity>

                        <Text style={styles.quantity}>{item.quantity}</Text>

                        <TouchableOpacity
                            onPress={handleIncrease}
                            style={styles.quantityButton}
                        >
                            <MaterialIcons name="add" size={16} color="#ff6b35" />
                        </TouchableOpacity>
                    </View>

                    {/* Total & Remove */}
                    <View style={styles.rightSection}>
                        <Text style={styles.total}>${itemTotal.toFixed(2)}</Text>
                        <TouchableOpacity
                            onPress={handleRemove}
                            style={styles.removeButton}
                        >
                            <MaterialIcons name="delete" size={18} color="#ff6b35" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        gap: 12,
    },
    image: {
        width: 80,
        height: 80,
        borderRadius: 8,
        backgroundColor: '#f5f5f5',
    },
    content: {
        flex: 1,
        justifyContent: 'space-between',
    },
    header: {
        marginBottom: 4,
    },
    name: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 4,
    },
    price: {
        fontSize: 13,
        color: '#ff6b35',
        fontWeight: '600',
    },
    note: {
        fontSize: 12,
        color: '#999',
        fontStyle: 'italic',
        marginBottom: 4,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#f5f5f5',
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    quantityButton: {
        padding: 4,
    },
    quantity: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1a1a1a',
        minWidth: 24,
        textAlign: 'center',
    },
    rightSection: {
        alignItems: 'flex-end',
        gap: 4,
    },
    total: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1a1a1a',
    },
    removeButton: {
        padding: 4,
    },
});

export default CartItem;
