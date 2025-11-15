import React, { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosInstance from '../services/axiosInstance';

export const AuthContext = React.createContext(null);

export function useAuth() {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Initialize auth from AsyncStorage
    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const [savedToken, savedUser] = await Promise.all([
                    AsyncStorage.getItem('token'),
                    AsyncStorage.getItem('user'),
                ]);

                if (savedToken && savedUser) {
                    setToken(savedToken);
                    setUser(JSON.parse(savedUser));
                    setIsAuthenticated(true);
                }
            } catch (error) {
                console.error('[Auth] Initialize error:', error);
            } finally {
                setLoading(false);
            }
        };

        initializeAuth();
    }, []);

    // Login
    const login = useCallback(async (email, password) => {
        try {
            setLoading(true);
            const response = await axiosInstance.post('/auth/login', {
                email,
                password,
            });

            if (response.data?.success && response.data?.token) {
                const userData = response.data.user;
                const tokenData = response.data.token;

                // Save to AsyncStorage
                await Promise.all([
                    AsyncStorage.setItem('token', tokenData),
                    AsyncStorage.setItem('user', JSON.stringify(userData)),
                ]);

                setToken(tokenData);
                setUser(userData);
                setIsAuthenticated(true);

                return { success: true, user: userData };
            } else {
                return { success: false, message: response.data?.message || 'Login failed' };
            }
        } catch (error) {
            return { success: false, message: error.response?.data?.message || error.message };
        } finally {
            setLoading(false);
        }
    }, []);

    // Register
    const register = useCallback(async (name, email, password) => {
        try {
            setLoading(true);
            const response = await axiosInstance.post('/auth/register', {
                name,
                email,
                password,
                role: 'user',
            });

            if (response.data?.success && response.data?.token) {
                const userData = response.data.user;
                const tokenData = response.data.token;

                // Save to AsyncStorage
                await Promise.all([
                    AsyncStorage.setItem('token', tokenData),
                    AsyncStorage.setItem('user', JSON.stringify(userData)),
                ]);

                setToken(tokenData);
                setUser(userData);
                setIsAuthenticated(true);

                return { success: true, user: userData };
            } else {
                return { success: false, message: response.data?.message || 'Register failed' };
            }
        } catch (error) {
            return { success: false, message: error.response?.data?.message || error.message };
        } finally {
            setLoading(false);
        }
    }, []);

    // Logout
    const logout = useCallback(async () => {
        try {
            await Promise.all([
                AsyncStorage.removeItem('token'),
                AsyncStorage.removeItem('user'),
            ]);

            setUser(null);
            setToken(null);
            setIsAuthenticated(false);
        } catch (error) {
            console.error('[Auth] Logout error:', error);
        }
    }, []);

    return {
        user,
        token,
        loading,
        isAuthenticated,
        login,
        register,
        logout,
    };
}

export function AuthProvider({ children }) {
    const auth = useAuth();

    return (
        <AuthContext.Provider value={auth}>
            {children}
        </AuthContext.Provider>
    );
}
