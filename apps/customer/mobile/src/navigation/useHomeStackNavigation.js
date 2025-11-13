/**
 * useHomeStack hook - Extracted to break circular dependency
 * Allows HomeScreen to use navigation without importing HomeStackNavigator
 */
import React from 'react';
import { HomeStackContext } from './HomeStackContext';

export function useHomeStack() {
    const context = React.useContext(HomeStackContext);
    if (!context) {
        console.warn('[useHomeStack] HomeStackContext not available');
        return null;
    }
    return context;
}

export default useHomeStack;


