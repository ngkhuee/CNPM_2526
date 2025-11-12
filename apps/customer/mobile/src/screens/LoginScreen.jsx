import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { useContext, useState } from 'react';
import { AuthContext } from 'customer-shared';

export default function LoginScreen({ navigation }) {
    const { login } = useContext(AuthContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            alert('Please enter email and password');
            return;
        }

        setLoading(true);
        try {
            // Mock login
            await login(email, password);
            navigation.replace('MainApp');
        } catch (error) {
            alert('Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDemoLogin = async () => {
        setLoading(true);
        try {
            await login('demo@example.com', '123456');
            navigation.replace('MainApp');
        } catch (error) {
            alert('Demo login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* Logo/Header */}
            <View style={styles.header}>
                <Text style={styles.logo}>DRONE</Text>
                <Text style={styles.appName}>Drone Food Delivery</Text>
                <Text style={styles.tagline}>Fast, Fresh, By Drone</Text>
            </View>

            {/* Login Form */}
            <View style={styles.formContainer}>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Email Address</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter your email"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        editable={!loading}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Password</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter your password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        editable={!loading}
                    />
                </View>

                <TouchableOpacity
                    style={[styles.loginBtn, loading && styles.disabledBtn]}
                    onPress={handleLogin}
                    disabled={loading}
                >
                    <Text style={styles.loginBtnText}>
                        {loading ? 'Logging in...' : 'Login'}
                    </Text>
                </TouchableOpacity>

                <View style={styles.divider}>
                    <View style={styles.line} />
                    <Text style={styles.dividerText}>or</Text>
                    <View style={styles.line} />
                </View>

                <TouchableOpacity
                    style={styles.demoBtn}
                    onPress={handleDemoLogin}
                    disabled={loading}
                >
                    <Text style={styles.demoBtnText}>Demo Login</Text>
                </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>Don't have an account?</Text>
                <TouchableOpacity>
                    <Text style={styles.signupLink}>Sign up here</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        justifyContent: 'space-between',
        paddingBottom: 40,
    },
    header: {
        alignItems: 'center',
        paddingTop: 80,
        paddingBottom: 60,
    },
    logo: {
        fontSize: 80,
        marginBottom: 20,
    },
    appName: {
        fontSize: 24,
        fontWeight: '700',
        color: '#333',
        marginBottom: 8,
    },
    tagline: {
        fontSize: 13,
        color: '#666',
        fontStyle: 'italic',
    },
    formContainer: {
        paddingHorizontal: 20,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    input: {
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        paddingHorizontal: 15,
        paddingVertical: 12,
        fontSize: 14,
        color: '#333',
        backgroundColor: '#f5f5f5',
    },
    loginBtn: {
        backgroundColor: '#ff6b35',
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 10,
    },
    disabledBtn: {
        opacity: 0.6,
    },
    loginBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 25,
    },
    line: {
        flex: 1,
        height: 1,
        backgroundColor: '#e0e0e0',
    },
    dividerText: {
        marginHorizontal: 15,
        color: '#999',
        fontSize: 13,
    },
    demoBtn: {
        borderWidth: 2,
        borderColor: '#ff6b35',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
    },
    demoBtnText: {
        color: '#ff6b35',
        fontSize: 16,
        fontWeight: '600',
    },
    footer: {
        alignItems: 'center',
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        marginHorizontal: 20,
    },
    footerText: {
        fontSize: 13,
        color: '#666',
        marginBottom: 6,
    },
    signupLink: {
        color: '#ff6b35',
        fontSize: 13,
        fontWeight: '600',
    },
});
