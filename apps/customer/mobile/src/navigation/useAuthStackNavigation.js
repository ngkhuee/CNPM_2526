/**
 * useAuthStack hook - Extracted to break circular dependency
 */
import React from 'react';
import { AuthStackContext } from './AuthStackContext';

export function useAuthStack() {
    const context = React.useContext(AuthStackContext);
    if (!context) {
        console.warn('[useAuthStack] AuthStackContext not available');
        return null;
    }
    return context;
}

export default useAuthStack;
