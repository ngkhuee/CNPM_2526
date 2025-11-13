/**
 * OrdersStack Context - Separated to avoid circular imports
 * Used by OrdersStackNavigator and useOrdersStack hook
 */
import React from 'react';

export const OrdersStackContext = React.createContext({
    currentScreen: 'MyOrders',
    navigate: () => { },
    goBack: () => { },
    canGoBack: false,
    params: {},
});

export default OrdersStackContext;
