/**
 * App Root - Customer Mobile App
 * Production version with Auth and Navigation
 * React 19 compatible
 */
import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Import providers and navigation
import { AuthProvider, useAuth } from './src/contexts';
import RootNavigatorContent from './src/navigation/RootNavigator';

console.log('[App.jsx] Module loaded');

// Main app content wrapped with auth
function RootWithAuth() {
    console.log('[RootWithAuth] rendering');
    try {
        const { user, isLoading } = useAuth();
        console.log('[RootWithAuth] got auth context:', { user: !!user, isLoading });
        return <RootNavigatorContent user={user} isLoading={isLoading} />;
    } catch (error) {
        console.error('[RootWithAuth] error:', error, error?.stack);
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Error in RootWithAuth</Text>
                <Text style={styles.errorMessage}>{error?.message || 'Unknown error'}</Text>
            </View>
        );
    }
}

// Error Boundary for React 19
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('[ErrorBoundary] caught error:', error);
        console.error('[ErrorBoundary] error info:', errorInfo);
        this.setState({ errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>⚠️ App Error</Text>
                    <Text style={styles.errorMessage}>{this.state.error?.message}</Text>
                    <Text style={styles.errorStack}>{this.state.error?.toString().substring(0, 100)}</Text>
                </View>
            );
        }

        return this.props.children;
    }
}

export default function App() {
    console.log('[App] Rendering App component');

    return (
        <ErrorBoundary>
            <GestureHandlerRootView style={{ flex: 1 }}>
                <SafeAreaProvider>
                    <AuthProvider>
                        <RootWithAuth />
                    </AuthProvider>
                </SafeAreaProvider>
            </GestureHandlerRootView>
        </ErrorBoundary>
    );
}

const styles = StyleSheet.create({
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffebee',
        padding: 20,
    },
    errorText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#c62828',
        marginBottom: 10,
        textAlign: 'center',
    },
    errorMessage: {
        fontSize: 14,
        color: '#d32f2f',
        textAlign: 'center',
        marginBottom: 10,
    },
    errorStack: {
        fontSize: 11,
        color: '#c62828',
        textAlign: 'center',
        fontFamily: 'monospace',
    },
});
