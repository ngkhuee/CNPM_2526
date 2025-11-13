/**
 * Food Detail Modal - giống FoodDetailPopup.jsx của web
 */
import React, { useState } from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    Modal,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, borderRadius, typography, shadows } from '../../styles';
import { getImageUrl, getPlaceholderImage } from '../../utils/imageHelper';
import { formatCurrency } from 'shared-utils';
import { Button } from '../common/Button';

export const FoodDetailModal = ({ visible, food, onClose, onAddToCart }) => {
    const [quantity, setQuantity] = useState(1);

    if (!food) return null;

    const imageUrl = getImageUrl(food.image);
    const placeholderImage = getPlaceholderImage();

    const handleIncrease = () => {
        setQuantity((prev) => prev + 1);
    };

    const handleDecrease = () => {
        if (quantity > 1) {
            setQuantity((prev) => prev - 1);
        }
    };

    const handleAddToCart = () => {
        onAddToCart(food.id, quantity);
        setQuantity(1);
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    {/* Close button */}
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Icon name="close" size={28} color={colors.text.primary} />
                    </TouchableOpacity>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        {/* Image */}
                        <View style={styles.imageContainer}>
                            <Image
                                source={{ uri: imageUrl }}
                                style={styles.image}
                                defaultSource={placeholderImage}
                            />
                        </View>

                        {/* Content */}
                        <View style={styles.content}>
                            <Text style={styles.name}>{food.name}</Text>

                            <View style={styles.metaRow}>
                                {food.rating > 0 && (
                                    <View style={styles.ratingContainer}>
                                        <Icon name="star" size={16} color={colors.warning} />
                                        <Text style={styles.rating}>{food.rating.toFixed(1)}</Text>
                                    </View>
                                )}
                                {food.sold > 0 && (
                                    <View style={styles.soldContainer}>
                                        <Icon name="flame" size={16} color={colors.danger} />
                                        <Text style={styles.sold}>{food.sold} sold</Text>
                                    </View>
                                )}
                            </View>

                            {food.description && (
                                <Text style={styles.description}>{food.description}</Text>
                            )}

                            <Text style={styles.price}>{formatCurrency(food.price)}</Text>

                            {/* Quantity selector */}
                            <View style={styles.quantityContainer}>
                                <Text style={styles.quantityLabel}>Quantity:</Text>
                                <View style={styles.quantityControls}>
                                    <TouchableOpacity
                                        style={[styles.quantityButton, quantity === 1 && styles.quantityButtonDisabled]}
                                        onPress={handleDecrease}
                                        disabled={quantity === 1}
                                    >
                                        <Text style={styles.quantityButtonText}>-</Text>
                                    </TouchableOpacity>
                                    <Text style={styles.quantityValue}>{quantity}</Text>
                                    <TouchableOpacity style={styles.quantityButton} onPress={handleIncrease}>
                                        <Text style={styles.quantityButtonText}>+</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Total */}
                            <View style={styles.totalRow}>
                                <Text style={styles.totalLabel}>Total:</Text>
                                <Text style={styles.totalValue}>
                                    {formatCurrency(food.price * quantity)}
                                </Text>
                            </View>

                            {/* Add to cart button */}
                            <Button
                                title={`Add to Cart (${quantity})`}
                                onPress={handleAddToCart}
                                variant="primary"
                                fullWidth
                                style={styles.addButton}
                            />
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modal: {
        backgroundColor: colors.white,
        borderTopLeftRadius: borderRadius.xl,
        borderTopRightRadius: borderRadius.xl,
        maxHeight: '90%',
        ...shadows.xl,
    },
    closeButton: {
        position: 'absolute',
        top: spacing.md,
        right: spacing.md,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
        ...shadows.md,
    },

    imageContainer: {
        width: '100%',
        height: 250,
        backgroundColor: colors.backgroundDark,
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    content: {
        padding: spacing.lg,
    },
    name: {
        ...typography.h2,
        color: colors.text.primary,
        marginBottom: spacing.sm,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: spacing.lg,
    },

    rating: {
        ...typography.bodyBold,
        color: colors.primary,
    },
    soldContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    sold: {
        ...typography.body,
        color: colors.text.secondary,
    },
    description: {
        ...typography.body,
        color: colors.text.secondary,
        lineHeight: 20,
        marginBottom: spacing.lg,
    },
    price: {
        ...typography.h2,
        color: colors.primary,
        marginBottom: spacing.lg,
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.lg,
    },
    quantityLabel: {
        ...typography.bodyBold,
        color: colors.text.primary,
    },
    quantityControls: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    quantityButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    quantityButtonDisabled: {
        opacity: 0.5,
    },
    quantityButtonText: {
        ...typography.h3,
        color: colors.white,
    },
    quantityValue: {
        ...typography.h3,
        color: colors.text.primary,
        marginHorizontal: spacing.lg,
        minWidth: 30,
        textAlign: 'center',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        marginBottom: spacing.lg,
    },
    totalLabel: {
        ...typography.h3,
        color: colors.text.primary,
    },
    totalValue: {
        ...typography.h2,
        color: colors.primary,
    },
    addButton: {
        marginTop: spacing.md,
    },
});

export default FoodDetailModal;
