// hooks/useAuth.js - Logic xử lý authentication
import { useContext } from 'react';
import { Alert } from 'react-native';
import { AuthContext } from '../contexts/AuthContext';

export const useAuth = () => {
    const { login, register, logout, loading } = useContext(AuthContext);

    const handleLogin = async (email, password, onSuccess) => {
        const response = await login(email, password);

        if (!response.success) {
            // Handle different types of login failures
            if (response.accountType === 'restaurant_owner') {
                Alert.alert(
                    'Partner App Required',
                    response.message,
                    [
                        {
                            text: 'OK',
                            onPress: () => {
                                // Logout to clear any partial session
                                logout();
                            }
                        }
                    ],
                    { cancelable: false }
                );
            } else if (response.accountType === 'admin') {
                Alert.alert(
                    'Admin Panel Required',
                    response.message,
                    [
                        {
                            text: 'OK',
                            onPress: () => {
                                // Logout to clear any partial session
                                logout();
                            }
                        }
                    ],
                    { cancelable: false }
                );
            } else if (response.accountType === 'blocked') {
                Alert.alert(
                    'Account Blocked',
                    response.message,
                    [
                        {
                            text: 'OK',
                            onPress: () => {
                                // Logout to clear any partial session
                                logout();
                            }
                        }
                    ],
                    { cancelable: false }
                );
            } else {
                // Generic login error
                Alert.alert('Login Failed', response.message || 'Invalid email or password');
            }
            return false;
        }

        Alert.alert('Success', 'Logged in successfully', [
            { text: 'OK', onPress: onSuccess }
        ]);
        return true;
    };

    const handleRegister = async (userData, onSuccess) => {
        const response = await register(userData);

        if (!response.success) {
            Alert.alert('Registration Failed', response.message || 'Unable to create account');
            return false;
        }

        Alert.alert('Success', 'Account created successfully. Please log in.', [
            { text: 'OK', onPress: onSuccess }
        ]);
        return true;
    };

    return {
        handleLogin,
        handleRegister,
        loading
    };
};
