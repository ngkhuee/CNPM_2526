import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';

export const OrderItemsList = ({ order }) => {
    if (!order?.items || order.items.length === 0) {
        return null;
    }

    const renderItem = ({ item }) => (
        <View style={styles.itemRow}>
            <View style={styles.itemInfo}>
                <Text style={styles.itemQty}>{item.quantity}x</Text>
                <View style={styles.itemDetails}>
                    <Text style={styles.itemName}>{item.name || item.food_name}</Text>
                    <Text style={styles.itemPrice}>
                        ₫{(item.unit_price || item.price || 0).toLocaleString('vi-VN')}
                    </Text>
                </View>
            </View>
            <Text style={styles.itemTotal}>
                ₫{((item.unit_price || item.price || 0) * item.quantity).toLocaleString('vi-VN')}
            </Text>
        </View>
    );

    return (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Items</Text>
            <FlatList
                data={order.items}
                renderItem={renderItem}
                keyExtractor={(item, idx) => `${item.id || idx}`}
                scrollEnabled={false}
                contentContainerStyle={styles.itemsList}
            />
            <View style={styles.summarySection}>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Subtotal</Text>
                    <Text style={styles.summaryValue}>
                        ₫{(order.subtotal || 0).toLocaleString('vi-VN')}
                    </Text>
                </View>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Delivery Fee</Text>
                    <Text style={styles.summaryValue}>
                        ₫{(order.deliveryFee || order.delivery_fee || 0).toLocaleString('vi-VN')}
                    </Text>
                </View>
                {(order.discountAmount || order.discount_amount) > 0 && (
                    <View style={[styles.summaryRow, styles.discountRow]}>
                        <Text style={styles.discountLabel}>
                            Discount {order.promo_code && `(${order.promo_code})`}
                        </Text>
                        <Text style={styles.discountValue}>
                            -₫{(order.discountAmount || order.discount_amount || 0).toLocaleString('vi-VN')}
                        </Text>
                    </View>
                )}
                <View style={[styles.summaryRow, styles.totalRow]}>
                    <Text style={styles.totalLabel}>Total</Text>
                    <Text style={styles.totalValue}>
                        ₫{(order.totalPrice || order.total_amount || 0).toLocaleString('vi-VN')}
                    </Text>
                </View>
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
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 12,
    },
    itemsList: {
        gap: 0,
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f5f5f5',
    },
    itemInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flex: 1,
    },
    itemQty: {
        fontSize: 14,
        fontWeight: '700',
        color: '#ff6b35',
        minWidth: 25,
    },
    itemDetails: {
        flex: 1,
    },
    itemName: {
        fontSize: 13,
        fontWeight: '500',
        color: '#1a1a1a',
    },
    itemPrice: {
        fontSize: 12,
        color: '#999',
        marginTop: 2,
    },
    itemTotal: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1a1a1a',
    },
    summarySection: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f5f5f5',
        gap: 8,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    summaryLabel: {
        fontSize: 13,
        color: '#666',
        fontWeight: '500',
    },
    summaryValue: {
        fontSize: 13,
        color: '#1a1a1a',
        fontWeight: '500',
    },
    discountRow: {
        backgroundColor: '#f0f8f5',
        paddingHorizontal: 8,
        paddingVertical: 6,
        borderRadius: 4,
        marginVertical: 4,
    },
    discountLabel: {
        fontSize: 13,
        color: '#4caf50',
        fontWeight: '500',
    },
    discountValue: {
        fontSize: 13,
        fontWeight: '600',
        color: '#4caf50',
    },
    totalRow: {
        paddingVertical: 10,
    },
    totalLabel: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1a1a1a',
    },
    totalValue: {
        fontSize: 16,
        fontWeight: '700',
        color: '#ff6b35',
    },
});
