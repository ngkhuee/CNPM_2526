/**
 * CheckoutOrderSummary.jsx
 * Displays order summary with itemized breakdown
 */

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export const CheckoutOrderSummary = ({
    restaurantName,
    items = [],
    subtotal = 0,
    deliveryFee = 0,
    discountAmount = 0,
    promoCode = null,
    total = 0,
    compact = false,
}) => {
    return (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <MaterialIcons name="receipt" size={20} color="#ff6b35" />
                <Text style={styles.sectionTitle}>Tóm tắt đơn hàng</Text>
            </View>

            {/* Restaurant Name */}
            {restaurantName && (
                <View style={styles.restaurantContainer}>
                    <MaterialIcons name="restaurant" size={16} color="#666" />
                    <Text style={styles.restaurantName} numberOfLines={1}>
                        {restaurantName}
                    </Text>
                </View>
            )}

            {/* Items List */}
            {items.length > 0 && (
                <View style={styles.itemsContainer}>
                    <Text style={styles.itemsTitle}>Sản phẩm ({items.length})</Text>
                    <ScrollView scrollEnabled={!compact} style={styles.itemsList}>
                        {items.map((item, index) => (
                            <View key={`${item.id}-${index}`} style={styles.itemRow}>
                                <View style={styles.itemInfo}>
                                    <Text style={styles.itemQty}>{item.quantity}x</Text>
                                    <Text style={styles.itemName} numberOfLines={1}>
                                        {item.name}
                                    </Text>
                                </View>
                                <Text style={styles.itemPrice}>
                                    ₫{(item.price * item.quantity).toLocaleString('vi-VN')}
                                </Text>
                            </View>
                        ))}
                    </ScrollView>
                </View>
            )}

            {/* Summary */}
            <View style={styles.summaryContainer}>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Tạm tính</Text>
                    <Text style={styles.summaryValue}>
                        ₫{subtotal.toLocaleString('vi-VN')}
                    </Text>
                </View>

                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Phí giao hàng</Text>
                    <Text style={styles.summaryValue}>
                        ₫{deliveryFee.toLocaleString('vi-VN')}
                    </Text>
                </View>

                {discountAmount > 0 && (
                    <View style={[styles.summaryRow, styles.discountRow]}>
                        <Text style={[styles.summaryLabel, styles.discountLabel]}>
                            Giảm giá {promoCode && `(${promoCode})`}
                        </Text>
                        <Text style={[styles.summaryValue, styles.discountValue]}>
                            -₫{discountAmount.toLocaleString('vi-VN')}
                        </Text>
                    </View>
                )}

                <View style={styles.divider} />

                <View style={[styles.summaryRow, styles.totalRow]}>
                    <Text style={styles.totalLabel}>Tổng cộng</Text>
                    <Text style={styles.totalValue}>
                        ₫{total.toLocaleString('vi-VN')}
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
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1a1a1a',
    },
    restaurantContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 12,
        paddingVertical: 8,
    },
    restaurantName: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1a1a1a',
    },
    itemsContainer: {
        marginBottom: 12,
    },
    itemsTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#666',
        marginBottom: 8,
    },
    itemsList: {
        maxHeight: 150,
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 0.5,
        borderBottomColor: '#f5f5f5',
    },
    itemInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        flex: 1,
    },
    itemQty: {
        fontSize: 12,
        fontWeight: '700',
        color: '#ff6b35',
        minWidth: 20,
    },
    itemName: {
        fontSize: 12,
        color: '#666',
        flex: 1,
    },
    itemPrice: {
        fontSize: 12,
        fontWeight: '600',
        color: '#1a1a1a',
        marginLeft: 8,
    },
    summaryContainer: {
        marginTop: 8,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 6,
    },
    summaryLabel: {
        fontSize: 13,
        color: '#666',
    },
    summaryValue: {
        fontSize: 13,
        fontWeight: '500',
        color: '#1a1a1a',
    },
    discountRow: {
        backgroundColor: '#f0f8f5',
        paddingHorizontal: 8,
        paddingVertical: 6,
        borderRadius: 4,
        marginVertical: 4,
    },
    discountLabel: {
        color: '#4caf50',
        fontWeight: '500',
    },
    discountValue: {
        color: '#4caf50',
    },
    divider: {
        height: 1,
        backgroundColor: '#eee',
        marginVertical: 8,
    },
    totalRow: {
        paddingTop: 8,
    },
    totalLabel: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1a1a1a',
    },
    totalValue: {
        fontSize: 18,
        fontWeight: '700',
        color: '#ff6b35',
    },
});
