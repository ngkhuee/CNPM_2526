/**
 * Auth Context Provider for Mobile
 * Manages authentication state and session
 */
import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Restore token on app start
    useEffect(() => {
        console.log('[AuthContext] useEffect hook starting restoreToken...');

        const restoreToken = async () => {
            try {
                console.log('[AuthContext] Attempting to restore token from AsyncStorage...');
                const savedToken = await AsyncStorage.getItem('token');
                const savedUser = await AsyncStorage.getItem('user');

                console.log('[AuthContext] Retrieved - token:', !!savedToken, 'user:', !!savedUser);

                if (savedToken) {
                    setToken(savedToken);
                }
                if (savedUser) {
                    setUser(JSON.parse(savedUser));
                }
            } catch (error) {
                console.error('[AuthContext] Failed to restore token:', error);
            } finally {
                console.log('[AuthContext] restoreToken complete - setting isLoading to false');
                setIsLoading(false);
            }
        };

        restoreToken();
    }, []);

    const login = async (userData, authToken) => {
        try {
            await AsyncStorage.setItem('token', authToken);
            await AsyncStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
            setToken(authToken);
        } catch (error) {
            console.error('Failed to save auth data:', error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('user');
            setUser(null);
            setToken(null);
        } catch (error) {
            console.error('Failed to clear auth data:', error);
            throw error;
        }
    };

    const value = {
        user,
        token,
        isLoading,
        login,
        logout,
    };

    console.log('[AuthContext] Provider rendering with:', { user: !!user, token: !!token, isLoading });

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = React.useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
