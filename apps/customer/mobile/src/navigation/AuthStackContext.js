/**
 * AuthStack Context - Separated to avoid circular imports
 * Used by AuthNavigator and useAuthStack hook
 */
import React from 'react';

export const AuthStackContext = React.createContext({
    currentScreen: 'Login',
    navigate: () => { },
    goBack: () => { },
    canGoBack: false,
    params: {},
});

export default AuthStackContext;
