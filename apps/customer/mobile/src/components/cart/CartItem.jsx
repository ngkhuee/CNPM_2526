/**
 * Cart Item Component
 */
import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, borderRadius, typography, shadows } from '../../styles';
import { getImageUrl, getPlaceholderImage } from '../../utils/imageHelper';
import { formatCurrency } from 'shared-utils';

export const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
    const imageUrl = getImageUrl(item.image);
    const placeholderImage = getPlaceholderImage();

    const handleIncrease = () => {
        onUpdateQuantity(item.id, item.quantity + 1);
    };

    const handleDecrease = () => {
        if (item.quantity > 1) {
            onUpdateQuantity(item.id, item.quantity - 1);
        }
    };

    return (
        <View style={styles.container}>
            <Image
                source={{ uri: imageUrl }}
                style={styles.image}
                defaultSource={placeholderImage}
            />

            <View style={styles.info}>
                <Text style={styles.name} numberOfLines={2}>
                    {item.name}
                </Text>
                <Text style={styles.price}>{formatCurrency(item.price)}</Text>

                <View style={styles.footer}>
                    <View style={styles.quantityControls}>
                        <TouchableOpacity
                            style={[styles.quantityButton, item.quantity === 1 && styles.quantityButtonDisabled]}
                            onPress={handleDecrease}
                            disabled={item.quantity === 1}
                        >
                            <Text style={styles.quantityButtonText}>-</Text>
                        </TouchableOpacity>
                        <Text style={styles.quantityValue}>{item.quantity}</Text>
                        <TouchableOpacity style={styles.quantityButton} onPress={handleIncrease}>
                            <Text style={styles.quantityButtonText}>+</Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.total}>{formatCurrency(item.price * item.quantity)}</Text>
                </View>
            </View>

            <TouchableOpacity style={styles.removeButton} onPress={() => onRemove(item.id)}>
                <Icon name="close-circle" size={24} color={colors.danger} />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: colors.white,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        marginBottom: spacing.md,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    image: {
        width: 80,
        height: 80,
        borderRadius: borderRadius.md,
        backgroundColor: colors.backgroundDark,
    },
    info: {
        flex: 1,
        marginLeft: spacing.md,
        justifyContent: 'space-between',
    },
    name: {
        ...typography.bodyBold,
        color: colors.text.primary,
    },
    price: {
        ...typography.body,
        color: colors.primary,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    quantityControls: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    quantityButton: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    quantityButtonDisabled: {
        opacity: 0.5,
    },
    quantityButtonText: {
        ...typography.bodyBold,
        color: colors.white,
    },
    quantityValue: {
        ...typography.bodyBold,
        color: colors.text.primary,
        marginHorizontal: spacing.md,
        minWidth: 20,
        textAlign: 'center',
    },
    total: {
        ...typography.h4,
        color: colors.primary,
    },
    removeButton: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: colors.backgroundDark,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: spacing.sm,
    },

});

export default CartItem;
