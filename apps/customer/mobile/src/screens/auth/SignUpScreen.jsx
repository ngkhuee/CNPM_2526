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

export default function SignInScreen({ navigation }) {
    const { register, loading } = useContext(AuthContext);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [agree, setAgree] = useState(false);
    const [error, setError] = useState('');

    const onSubmit = async () => {
        setError('');

        if (!name.trim()) {
            setError('Name is required');
            return;
        }

        if (!email.trim()) {
            setError('Email is required');
            return;
        }

        if (!password.trim()) {
            setError('Password is required');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        if (!agree) {
            setError('You must agree to the terms');
            return;
        }

        const result = await register(name, email, password);

        if (!result.success) {
            setError(result.message || 'Registration failed');
        }
    };

    return (
        <View style={styles.container}>
            <Text>Sign Up Screen</Text>

            {/* Name, Email, and Password Inputs */}
            <TextInput
                placeholder="Full Name"
                value={name}
                onChangeText={setName}
            />
            <TextInput
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
            />
            <TextInput
                placeholder="Password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />

            {/* Terms Checkbox */}
            <TouchableOpacity onPress={() => setAgree(!agree)}>
                <Text>{agree ? '✓' : '❌'} Agree to Terms</Text>
            </TouchableOpacity>

            {/* Submit Button */}
            <TouchableOpacity onPress={onSubmit} disabled={loading}>
                {loading ? <ActivityIndicator /> : <Text>Create Account</Text>}
            </TouchableOpacity>

            {/* Link to Login */}
            <Text onPress={() => navigation.navigate('Login')}>Already have an account? Login</Text>
        </View>
    );
}
