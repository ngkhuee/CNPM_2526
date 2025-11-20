import React, { useState, useContext, useEffect } from 'react';
import { View } from 'react-native';
import { AuthContext } from '../contexts/AuthContext';
import { NavigationContext } from '../contexts/NavigationContext';
import SplashScreen from '../screens/auth/SplashScreen';
import LoginAuthScreen from '../screens/auth/LoginAuthScreen';
import RegisterRestaurantScreen from '../screens/auth/RegisterRestaurantScreen';
import HomeScreen from '../screens/home/HomeScreen';
import OrdersScreen from '../screens/orders/OrdersScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import RestaurantDetail from '../screens/restaurant/RestaurantDetail';
import FoodDetailScreen from '../screens/restaurant/FoodDetailScreen';
import CartScreen from '../screens/cart/CartScreen';
import CheckoutScreen from '../screens/cart/CheckoutScreen';
import PaymentScreen from '../screens/orders/PaymentScreen';
import MoMoPaymentScreen from '../screens/payment/MoMoPaymentScreen';
import CardPaymentScreen from '../screens/payment/CardPaymentScreen';
import TrackingScreen from '../screens/orders/TrackingScreen';
import OrderDetailScreen from '../screens/orders/OrderDetailScreen';
import ReviewScreen from '../screens/orders/ReviewScreen';

/**
 * AppNavigator - Main navigation component
 * Routes between auth screens and main app screens
 * - SplashScreen: Shown while initializing auth
 * - LoginAuthScreen: Shown when not authenticated
 * - AppStack: Main app screens (7 screens)
 */
export default function AppNavigator() {
    const [selectedFood, setSelectedFood] = useState(null);
    const { activeRoute, isNavigating, targetRestaurantId, navigate } = useContext(NavigationContext);
    const { initialized, isAuthenticated } = useContext(AuthContext);

    // Auto navigate when context changes
    useEffect(() => {
        if (isNavigating && targetRestaurantId) {
            console.log('[AppNavigator] Auto navigating to restaurant:', targetRestaurantId);
            navigate('restaurant');
        }
    }, [isNavigating, targetRestaurantId, navigate]);

    // Show splash screen while initializing auth
    if (!initialized) {
        return <SplashScreen />;
    }

    // Show main app screens (user can browse without login)
    // Protected screens (cart, profile) will show login prompt if needed
    return <AppStack activeScreen={activeRoute} selectedFood={selectedFood} setSelectedFood={setSelectedFood} />;
}

/**
 * AppStack - Main application screens
 * Contains: Home, Restaurant, Food Detail, Cart, Checkout, Orders, Profile
 * 
 * NOTE: 
 * - RestaurantDetail & FoodDetailScreen have their own MiniCartBubble (shows LOCAL cart)
 * - HomeScreen can have GlobalCartBubble (shows global cart from current active restaurant)
 * - CartScreen doesn't need bubble
 */
function AppStack({ activeScreen, selectedFood, setSelectedFood }) {
    const { navigate, orderId } = useContext(NavigationContext);

    const renderScreen = () => {
        switch (activeScreen) {
            case 'login':
                return <LoginAuthScreen onBackPress={() => navigate('home')} />;
            case 'register-restaurant':
                return <RegisterRestaurantScreen onNavigate={navigate} />;
            case 'home':
                return <HomeScreen onNavigate={navigate} />;
            case 'restaurant':
                return <RestaurantDetail onNavigate={navigate} onSelectFood={setSelectedFood} />;
            case 'food-detail':
                return <FoodDetailScreen foodItem={selectedFood} onNavigate={navigate} />;
            case 'cart':
                return <CartScreen onNavigate={navigate} />;
            case 'checkout':
                return <CheckoutScreen />;
            case 'payment':
                return <PaymentScreen orderId={orderId} />;
            case 'momoPayment':
                return <MoMoPaymentScreen orderId={orderId} />;
            case 'cardPayment':
                return <CardPaymentScreen orderId={orderId} />;
            case 'tracking':
                return <TrackingScreen orderId={orderId} />;
            case 'order-detail':
                return <OrderDetailScreen orderId={orderId} />;
            case 'review':
                return <ReviewScreen orderId={orderId} />;
            case 'orders':
                return <OrdersScreen onNavigate={navigate} />;
            case 'profile':
                return <ProfileScreen onNavigate={navigate} />;
            default:
                return <HomeScreen onNavigate={navigate} />;
        }
    };

    return (
        <View style={{ flex: 1 }}>
            {renderScreen()}
        </View>
    );
}

