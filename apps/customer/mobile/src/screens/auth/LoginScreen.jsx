import React, { useContext, useState } from 'react';
import {
    View,
    ScrollView,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { AuthContext } from '../../contexts/AuthContext';
import { EnvelopeIcon, LockIcon } from '../../components/Icons';

export default function LoginScreen() {
    const { login, register, loading } = useContext(AuthContext);
    const [currState, setCurrState] = useState('Login'); // 'Login' or 'Sign Up'
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [agree, setAgree] = useState(false);

    const onSubmit = async () => {
        setError('');

        // Validation
        if (currState === 'Sign Up') {
            if (!name.trim()) {
                setError('Name is required');
                return;
            }
            if (!agree) {
                setError('Please agree to terms and conditions');
                return;
            }
        }

        if (!email.trim()) {
            setError('Email is required');
            return;
        }

        if (!password.trim()) {
            setError('Password is required');
            return;
        }

        // if (password.length < 6) {
        //     setError('Password must be at least 6 characters');
        //     return;
        // }

        // Call auth functions
        let result;
        if (currState === 'Sign Up') {
            result = await register(name, email, password);
            if (result.success) {
                setError('');
                setCurrState('Login');
            }
        } else {
            result = await login(email, password);
        }

        if (!result.success) {
            setError(result.message || 'Authentication failed');
        }
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.content}>
                {/* Logo/Title */}
                <View style={styles.header}>
                    <Text style={styles.logo}>Yummy</Text>
                    <Text style={styles.subtitle}>Delivery</Text>
                </View>

                {/* Tabs */}
                <View style={styles.tabsContainer}>
                    <TouchableOpacity
                        style={[styles.tab, currState === 'Login' && styles.tabActive]}
                        onPress={() => {
                            setCurrState('Login');
                            setError('');
                        }}
                    >
                        <Text style={[styles.tabText, currState === 'Login' && styles.tabTextActive]}>
                            Login
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, currState === 'Sign Up' && styles.tabActive]}
                        onPress={() => {
                            setCurrState('Sign Up');
                            setError('');
                        }}
                    >
                        <Text style={[styles.tabText, currState === 'Sign Up' && styles.tabTextActive]}>
                            Sign Up
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Error Message */}
                {error && (
                    <View style={styles.errorBox}>
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                )}

                {/* Form */}
                <View style={styles.form}>
                    {/* Name Input (Sign Up only) */}
                    {currState === 'Sign Up' && (
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Full Name</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your name"
                                value={name}
                                onChangeText={setName}
                                editable={!loading}
                                placeholderTextColor="#999"
                            />
                        </View>
                    )}

                    {/* Email Input */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email Address</Text>
                        <View style={styles.inputWithIcon}>
                            <EnvelopeIcon size={18} color="#ff6b35" />
                            <TextInput
                                style={styles.inputText}
                                placeholder="your@email.com"
                                value={email}
                                onChangeText={setEmail}
                                editable={!loading}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                placeholderTextColor="#999"
                            />
                        </View>
                    </View>

                    {/* Password Input */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Password</Text>
                        <View style={styles.inputWithIcon}>
                            <LockIcon size={18} color="#ff6b35" />
                            <TextInput
                                style={styles.inputText}
                                placeholder="••••••••"
                                value={password}
                                onChangeText={setPassword}
                                editable={!loading}
                                secureTextEntry
                                placeholderTextColor="#999"
                            />
                        </View>
                    </View>

                    {/* Terms & Conditions (Sign Up only) */}
                    {currState === 'Sign Up' && (
                        <View style={styles.agreeContainer}>
                            <TouchableOpacity
                                style={[styles.checkbox, agree && styles.checkboxActive]}
                                onPress={() => setAgree(!agree)}
                            >
                                {agree && <Text style={styles.checkmark}>✓</Text>}
                            </TouchableOpacity>
                            <Text style={styles.agreeText}>
                                I agree to the terms & conditions
                            </Text>
                        </View>
                    )}

                    {/* Submit Button */}
                    <TouchableOpacity
                        style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
                        onPress={onSubmit}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Text style={styles.submitBtnText}>
                                {currState === 'Sign Up' ? 'Create Account' : 'Login'}
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Footer Text */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        {currState === 'Login'
                            ? "Don't have an account? "
                            : 'Already have an account? '}
                        <Text
                            style={styles.footerLink}
                            onPress={() => {
                                setCurrState(currState === 'Login' ? 'Sign Up' : 'Login');
                                setError('');
                            }}
                        >
                            {currState === 'Login' ? 'Sign Up' : 'Login'}
                        </Text>
                    </Text>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        padding: 24,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
        marginTop: 40,
    },
    logo: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#ff6b35',
    },
    subtitle: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    },
    tabsContainer: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        marginBottom: 24,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
    },
    tabActive: {
        borderBottomWidth: 2,
        borderBottomColor: '#ff6b35',
    },
    tabText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#999',
    },
    tabTextActive: {
        color: '#ff6b35',
    },
    errorBox: {
        backgroundColor: '#ffe0e0',
        borderRadius: 8,
        padding: 12,
        marginBottom: 20,
        borderLeftWidth: 4,
        borderLeftColor: '#ff4444',
    },
    errorText: {
        color: '#cc0000',
        fontSize: 14,
    },
    form: {
        marginBottom: 24,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#f9f9f9',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        fontSize: 14,
        color: '#333',
    },
    inputWithIcon: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f9f9f9',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        paddingHorizontal: 12,
        gap: 8,
    },
    inputText: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 14,
        color: '#333',
    },
    agreeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        gap: 8,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderWidth: 2,
        borderColor: '#e0e0e0',
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxActive: {
        backgroundColor: '#ff6b35',
        borderColor: '#ff6b35',
    },
    checkmark: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    agreeText: {
        fontSize: 14,
        color: '#666',
        flex: 1,
    },
    submitBtn: {
        backgroundColor: '#ff6b35',
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    submitBtnDisabled: {
        opacity: 0.6,
    },
    submitBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    footer: {
        alignItems: 'center',
        marginTop: 20,
    },
    footerText: {
        fontSize: 14,
        color: '#666',
    },
    footerLink: {
        color: '#ff6b35',
        fontWeight: '600',
    },
});
