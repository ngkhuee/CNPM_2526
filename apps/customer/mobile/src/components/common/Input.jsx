/**
 * Input Component
 */
import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../styles';

export const Input = ({
    label,
    value,
    onChangeText,
    placeholder,
    error,
    touched,
    secureTextEntry,
    keyboardType = 'default',
    multiline = false,
    numberOfLines = 1,
    leftIcon,
    rightIcon,
    onRightIconPress,
    disabled = false,
    style,
    inputStyle,
    ...props
}) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <View style={[styles.container, style]}>
            {label && <Text style={styles.label}>{label}</Text>}

            <View
                style={[
                    styles.inputContainer,
                    isFocused && styles.inputContainerFocused,
                    error && touched && styles.inputContainerError,
                    disabled && styles.inputContainerDisabled,
                ]}
            >
                {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}

                <TextInput
                    style={[
                        styles.input,
                        multiline && styles.inputMultiline,
                        inputStyle,
                    ]}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor={colors.text.light}
                    secureTextEntry={secureTextEntry}
                    keyboardType={keyboardType}
                    multiline={multiline}
                    numberOfLines={numberOfLines}
                    editable={!disabled}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    {...props}
                />

                {rightIcon && (
                    <TouchableOpacity
                        style={styles.rightIcon}
                        onPress={onRightIconPress}
                        disabled={!onRightIconPress}
                    >
                        {rightIcon}
                    </TouchableOpacity>
                )}
            </View>

            {error && touched && <Text style={styles.error}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing.md,
    },
    label: {
        ...typography.bodyBold,
        color: colors.text.primary,
        marginBottom: spacing.sm,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.md,
        paddingHorizontal: spacing.md,
    },
    inputContainerFocused: {
        borderColor: colors.primary,
        borderWidth: 2,
    },
    inputContainerError: {
        borderColor: colors.danger,
    },
    inputContainerDisabled: {
        backgroundColor: colors.backgroundDark,
        opacity: 0.6,
    },
    input: {
        flex: 1,
        ...typography.body,
        color: colors.text.primary,
        paddingVertical: spacing.md,
    },
    inputMultiline: {
        minHeight: 80,
        textAlignVertical: 'top',
        paddingTop: spacing.md,
    },
    leftIcon: {
        marginRight: spacing.sm,
    },
    rightIcon: {
        marginLeft: spacing.sm,
    },
    error: {
        ...typography.caption,
        color: colors.danger,
        marginTop: spacing.xs,
    },
});

export default Input;
