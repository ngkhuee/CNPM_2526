import React from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    Modal,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { formatCurrency } from '../../shared/formatters';
import CartModalItem from './CartModalItem';

export default function CartModal({
    visible,
    localCart,
    setLocalCart,
    onClose,
    onCheckout,
}) {
    // Get unique ID from item (support multiple ID fields)
    const getItemId = (item) => item.item_id || item.menu_id || item.food_id || item.id;

    const handleUpdateQuantity = (itemId, newQty) => {
        if (newQty <= 0) {
            handleRemoveItem(itemId);
            return;
        }

        const updated = localCart.items.map(item =>
            getItemId(item) === itemId ? { ...item, quantity: newQty } : item
        );

        const newTotal = updated.reduce(
            (sum, item) => sum + (item.price * item.quantity),
            0
        );

        setLocalCart({
            ...localCart,
            items: updated,
            total: newTotal,
        });
    };

    const handleRemoveItem = (itemId) => {
        const updated = localCart.items.filter(item => getItemId(item) !== itemId);
        const newTotal = updated.reduce(
            (sum, item) => sum + (item.price * item.quantity),
            0
        );

        setLocalCart({
            ...localCart,
            items: updated,
            total: newTotal,
        });
    };

    const renderItem = ({ item }) => (
        <CartModalItem
            item={item}
            onUpdateQuantity={handleUpdateQuantity}
            onRemove={handleRemoveItem}
        />
    );

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <SafeAreaView style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Giỏ hàng của bạn</Text>
                    <TouchableOpacity onPress={onClose}>
                        <MaterialIcons name="close" size={24} color="#1a1a1a" />
                    </TouchableOpacity>
                </View>

                {/* Items List */}
                {localCart.items.length > 0 ? (
                    <FlatList
                        data={localCart.items}
                        renderItem={renderItem}
                        keyExtractor={(item, index) => (item.item_id || item.menu_id || item.food_id || item.id || `cart-item-${index}`).toString()}
                        scrollEnabled
                    />
                ) : (
                    <View style={styles.emptyContainer}>
                        <MaterialIcons name="shopping-cart" size={48} color="#ddd" />
                        <Text style={styles.emptyText}>Giỏ hàng trống</Text>
                    </View>
                )}

                {/* Footer */}
                {localCart.items.length > 0 && (
                    <View style={styles.footer}>
                        <View style={styles.totalSection}>
                            <Text style={styles.totalLabel}>Tạm tính</Text>
                            <Text style={styles.totalValue}>
                                {formatCurrency(localCart.total)}
                            </Text>
                        </View>

                        <View style={styles.buttonGroup}>
                            <TouchableOpacity
                                style={styles.continueBtn}
                                onPress={onClose}
                            >
                                <Text style={styles.continueBtnText}>Tiếp tục mua sắm</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.checkoutBtn}
                                onPress={onCheckout}
                            >
                                <Text style={styles.checkoutBtnText}>Thanh toán</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </SafeAreaView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1a1a1a',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 14,
        color: '#999',
        marginTop: 12,
    },
    footer: {
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: '#fff',
    },
    totalSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    totalLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    totalValue: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1a1a1a',
    },
    buttonGroup: {
        gap: 10,
    },
    continueBtn: {
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: '#ff6b35',
        borderRadius: 8,
        alignItems: 'center',
    },
    continueBtnText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#ff6b35',
    },
    checkoutBtn: {
        paddingVertical: 12,
        backgroundColor: '#ff6b35',
        borderRadius: 8,
        alignItems: 'center',
    },
    checkoutBtnText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#fff',
    },
});
