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

    useEffect(() => {
        fetchOrder();
    }, [orderId]);

    const fetchOrder = async () => {
        try {
            setLoading(true);
            const data = await orderService.getOrderDetail(orderId);
            setOrder(data);

            // Route to specific payment screen based on payment method
            if (data.payment_method === 'momo') {
                navigate('momoPayment', { orderId: data.id });
            } else if (data.payment_method === 'card') {
                navigate('cardPayment', { orderId: data.id });
            } else {
                // Default fallback
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
