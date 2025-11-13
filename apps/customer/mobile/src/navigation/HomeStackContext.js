/**
 * HomeStack Context - Separated to avoid circular imports
 * Used by HomeStackNavigator and useHomeStack hook
 */
import React from 'react';

export const HomeStackContext = React.createContext({
    currentScreen: 'Home',
    navigate: () => { },
    goBack: () => { },
    canGoBack: false,
    params: {},
});

export default HomeStackContext;
