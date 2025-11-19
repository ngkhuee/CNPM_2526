/**
 * PaymentScreen.jsx
 * Router for payment processing - redirects to specific payment method screens
 */

import React, { useContext, useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { NavigationContext } from '../../contexts/NavigationContext';
import * as orderService from '../../services/orderService';
import { showToast } from '../../utils/toastHelper';

const PaymentScreen = ({ orderId }) => {
    const { navigate } = useContext(NavigationContext);
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    console.log('[PaymentScreen] Rendered with orderId:', orderId);

    useEffect(() => {
        console.log('[PaymentScreen] useEffect called, orderId:', orderId);
        if (!orderId) {
            console.log('[PaymentScreen] ERROR: orderId is null/undefined!');
            navigate('orders');
            return;
        }
        fetchOrder();
    }, [orderId]);

    const fetchOrder = async () => {
        try {
            console.log('[PaymentScreen] Fetching order with id:', orderId);
            setLoading(true);
            const data = await orderService.getOrderDetail(orderId);
            console.log('[PaymentScreen] Order fetched:', data);
            setOrder(data);

            // Route to specific payment screen based on payment method
            // Note: transformOrder returns paymentMethod (camelCase)
            console.log('[PaymentScreen] Routing based on paymentMethod:', data.paymentMethod);
            if (data.paymentMethod === 'momo') {
                console.log('[PaymentScreen] Navigating to momoPayment');
                navigate('momoPayment', { orderId: data.id });
            } else if (data.paymentMethod === 'card') {
                console.log('[PaymentScreen] Navigating to cardPayment');
                navigate('cardPayment', { orderId: data.id });
            } else {
                console.log('[PaymentScreen] Unknown payment method, navigating to orders');
                navigate('orders');
            }
        } catch (error) {
            console.error('[PaymentScreen] Error fetching order:', error);
            Alert.alert('Error', 'Failed to load order');
            navigate('orders');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ActivityIndicator size="large" color="#ff6b35" style={{ marginTop: 50 }} />
            <Text style={styles.loadingText}>Loading payment...</Text>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 35,
        backgroundColor: '#f8f8f8',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 14,
        color: '#666',
    },
});

export default PaymentScreen;
