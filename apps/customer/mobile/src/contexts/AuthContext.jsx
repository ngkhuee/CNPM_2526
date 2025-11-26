// AuthContext.jsx - Global authentication state for mobile
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initStorage, storage } from '../utils/storage';
import apiClient from '../services/apiClient';
import authService from '../services/authService';
import apiConfig from '../config/api.config';

// Initialize storage adapter for AsyncStorage
initStorage(AsyncStorage);

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState('');
    const [loading, setLoading] = useState(false);
    const [initialized, setInitialized] = useState(false);

    // Initialize auth state from AsyncStorage on app start
    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const savedToken = await storage.getItem('token');
                const savedUserStr = await storage.getItem('user');

                if (savedToken && savedUserStr) {
                    const savedUser = JSON.parse(savedUserStr);

                    // Restore user and token from storage
                    // Don't validate with API call to avoid unnecessary requests
                    console.log('[AuthContext] Restoring user from storage:', savedUser.email);
                    setToken(savedToken);
                    setUser(savedUser);
                }

                setInitialized(true);
            } catch (error) {
                console.error('[AuthContext] Error initializing auth:', error);
                setInitialized(true);
            }
        };

        initializeAuth();
    }, []);

    // Login action
    const login = useCallback(async (email, password) => {
        try {
            setLoading(true);
            const response = await apiClient.post('/auth/login', {
                email,
                password,
            });

            if (response.success && response.token) {
                const userData = response.user;

                // Validation 1: Check user role
                // Only 'customer' role can use this mobile app
                if (userData.roles && Array.isArray(userData.roles)) {
                    if (userData.roles.includes('restaurant_owner')) {
                        console.warn('[AuthContext] Attempt to login with restaurant_owner account');
                        return {
                            success: false,
                            message: 'Tài khoản này dành cho đối tác nhà hàng. Vui lòng sử dụng ứng dụng đối tác.',
                            accountType: 'restaurant_owner'
                        };
                    }
                    if (userData.roles.includes('admin')) {
                        console.warn('[AuthContext] Attempt to login with admin account');
                        return {
                            success: false,
                            message: 'Tài khoản này dành cho quản trị viên. Vui lòng sử dụng trang quản trị.',
                            accountType: 'admin'
                        };
                    }
                    if (!userData.roles.includes('customer')) {
                        console.warn('[AuthContext] User does not have customer role:', userData.roles);
                        return {
                            success: false,
                            message: 'Loại tài khoản không hợp lệ cho ứng dụng này'
                        };
                    }
                }

                // Validation 2: Check account status
                // Account must be 'active', not 'blocked', 'inactive', 'pending', etc.
                if (userData.status && userData.status !== 'active') {
                    console.warn('[AuthContext] Attempt to login with account status:', userData.status);
                    if (userData.status === 'blocked') {
                        return {
                            success: false,
                            message: 'Tài khoản của bạn đã bị khóa bởi quản trị viên. Vui lòng liên hệ hỗ trợ.',
                            accountType: 'blocked'
                        };
                    }
                    if (userData.status === 'pending') {
                        return {
                            success: false,
                            message: 'Tài khoản của bạn đang chờ duyệt. Vui lòng chờ xác nhận từ quản trị viên.',
                            accountType: 'pending'
                        };
                    }
                    return {
                        success: false,
                        message: `Trạng thái tài khoản: ${userData.status}. Vui lòng liên hệ hỗ trợ.`
                    };
                }

                // Map roles array to role string for easier access
                if (userData.roles && Array.isArray(userData.roles)) {
                    if (userData.roles.includes('restaurant_owner')) {
                        userData.role = 'restaurant';
                    } else if (userData.roles.includes('admin')) {
                        userData.role = 'admin';
                    } else if (userData.roles.includes('customer')) {
                        userData.role = 'customer';
                    } else {
                        userData.role = userData.roles[0];
                    }
                }

                // All validations passed - proceed with login
                // Store token and user in AsyncStorage
                await storage.setItem('token', response.token);
                await storage.setItem('user', JSON.stringify(userData));

                // Update state
                setToken(response.token);
                setUser(userData);

                console.log('[AuthContext] Login successful:', userData.email);
                return { success: true, user: userData };
            } else {
                return { success: false, message: response.message || 'Đăng nhập thất bại' };
            }
        } catch (error) {
            console.error('[AuthContext] Login error:', error.message);

            // Handle specific error cases
            let errorMessage = error.message || 'Đăng nhập thất bại';

            // 401 Unauthorized = Invalid email/password
            if (error.response?.status === 401) {
                errorMessage = 'Email hoặc mật khẩu không đúng. Vui lòng thử lại.';
            }
            // Network errors
            else if (error.code === 'ECONNABORTED' || !error.response) {
                errorMessage = 'Lỗi kết nối. Vui lòng kiểm tra kết nối mạng và thử lại.';
            }
            // Other HTTP errors
            else if (error.response?.status) {
                errorMessage = error.response.data?.message || `Lỗi: ${error.response.status}`;
            }

            return { success: false, message: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    // Register action
    const register = useCallback(async (userData) => {
        try {
            setLoading(true);
            const response = await apiClient.post('/auth/register', {
                name: userData.name,
                email: userData.email,
                password: userData.password,
                confirmPassword: userData.confirmPassword,
                phone: userData.phone || '',
            });

            if (response.success && response.token) {
                const newUser = response.user;

                // Store token and user in AsyncStorage
                await storage.setItem('token', response.token);
                await storage.setItem('user', JSON.stringify(newUser));

                // Update state (auto login)
                setToken(response.token);
                setUser(newUser);

                console.log('[AuthContext] Register successful:', newUser.email);
                return { success: true, user: newUser };
            } else {
                return { success: false, message: response.message || 'Đăng ký thất bại' };
            }
        } catch (error) {
            console.error('[AuthContext] Register error:', error.message);

            // Handle specific error cases
            let errorMessage = error.message || 'Đăng ký thất bại';

            // Handle field validation errors
            if (error.response?.data?.fieldError) {
                errorMessage = error.response.data.message || 'Lỗi xác thực';
            }
            // Email already exists
            else if (error.response?.status === 400 && error.response.data?.message?.includes('Email')) {
                errorMessage = 'Email này đã được đăng ký. Vui lòng dùng email khác hoặc đăng nhập.';
            }
            // Other HTTP errors
            else if (error.response?.status) {
                errorMessage = error.response.data?.message || `Lỗi: ${error.response.status}`;
            }
            // Network errors
            else if (error.code === 'ECONNABORTED' || !error.response) {
                errorMessage = 'Lỗi kết nối. Vui lòng kiểm tra kết nối mạng và thử lại.';
            }

            return { success: false, message: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    // Logout action
    const logout = useCallback(async () => {
        try {
            // Clear AsyncStorage
            await storage.removeItem('token');
            await storage.removeItem('user');
            await storage.removeItem('cartItems');

            // Clear state
            setToken('');
            setUser(null);

            console.log('[AuthContext] Logout successful');
            return { success: true };
        } catch (error) {
            console.error('[AuthContext] Logout error:', error);
            return { success: false, message: error.message };
        }
    }, []);

    // Check authentication status
    const isAuthenticated = !!token && !!user;

    const value = {
        user,
        token,
        loading,
        initialized,
        isAuthenticated,
        login,
        register,
        logout,
        setUser,
        setToken,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
