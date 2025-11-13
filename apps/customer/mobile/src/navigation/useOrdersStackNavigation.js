/**
 * useOrdersStack hook - Extracted to break circular dependency
 */
import React from 'react';
import { OrdersStackContext } from './OrdersStackContext';

export function useOrdersStack() {
    const context = React.useContext(OrdersStackContext);
    if (!context) {
        console.warn('[useOrdersStack] OrdersStackContext not available');
        return null;
    }
    return context;
}

export default useOrdersStack;
