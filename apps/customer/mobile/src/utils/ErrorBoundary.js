import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('[ErrorBoundary] Error caught:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Something went wrong</Text>
                    <Text style={styles.errorDetails}>{this.state.error?.toString()}</Text>
                </View>
            );
        }

        return this.props.children;
    }
}

const styles = StyleSheet.create({
    errorContainer: {
        padding: 10,
        backgroundColor: '#ffebee',
        borderRadius: 8,
        marginBottom: 10,
    },
    errorText: {
        color: '#d32f2f',
        fontWeight: '600',
        fontSize: 14,
    },
    errorDetails: {
        color: '#d32f2f',
        fontSize: 12,
        marginTop: 4,
    },
});
