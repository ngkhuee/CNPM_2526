/**
 * Review Modal Component - Mobile Version
 */
import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, typography } from '../../styles';

const ReviewModal = ({
    isOpen,
    itemName,
    rating,
    comment,
    submitting,
    onRatingChange,
    onCommentChange,
    onSubmit,
    onClose,
}) => {
    return (
        <Modal
            visible={isOpen}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableOpacity
                style={styles.overlay}
                activeOpacity={1}
                onPress={onClose}
            >
                <View style={styles.modalContainer} onStartShouldSetResponder={() => true}>
                    <ScrollView contentContainerStyle={styles.content}>
                        <Text style={styles.title}>Rate Food</Text>
                        <Text style={styles.itemName}>{itemName}</Text>

                        <View style={styles.ratingSection}>
                            <Text style={styles.label}>Food Quality:</Text>
                            <View style={styles.stars}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <TouchableOpacity
                                        key={star}
                                        onPress={() => onRatingChange(star)}
                                        style={styles.starButton}
                                    >
                                        <Icon
                                            name={rating >= star ? 'star' : 'star-outline'}
                                            size={32}
                                            color={rating >= star ? '#ffc107' : '#ddd'}
                                        />
                                    </TouchableOpacity>
                                ))}
                            </View>
                            <Text style={styles.ratingText}>{rating}/5 stars</Text>
                        </View>

                        <View style={styles.commentSection}>
                            <Text style={styles.label}>Your comment:</Text>
                            <TextInput
                                style={styles.textarea}
                                value={comment}
                                onChangeText={onCommentChange}
                                placeholder="Share your experience with this dish..."
                                placeholderTextColor={colors.text.light}
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                            />
                        </View>

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={[styles.button, styles.submitButton, submitting && styles.buttonDisabled]}
                                onPress={onSubmit}
                                disabled={submitting}
                            >
                                <Text style={styles.buttonText}>
                                    {submitting ? 'Submitting...' : 'Submit Review'}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, styles.cancelButton]}
                                onPress={onClose}
                            >
                                <Text style={styles.buttonText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </TouchableOpacity>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        backgroundColor: colors.background,
        borderRadius: 12,
        width: '90%',
        maxWidth: 400,
        maxHeight: '80%',
    },
    content: {
        padding: spacing.lg,
    },
    title: {
        ...typography.h3,
        color: colors.text.primary,
        marginBottom: spacing.sm,
    },
    itemName: {
        ...typography.body,
        fontSize: 16,
        fontWeight: '600',
        color: colors.text.secondary,
        marginBottom: spacing.lg,
    },
    ratingSection: {
        marginBottom: spacing.lg,
    },
    label: {
        ...typography.body,
        fontWeight: '600',
        color: colors.text.primary,
        marginBottom: spacing.sm,
    },
    stars: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: spacing.sm,
    },
    starButton: {
        padding: spacing.xs,
    },
    ratingText: {
        ...typography.body,
        textAlign: 'center',
        color: colors.text.secondary,
    },
    commentSection: {
        marginBottom: spacing.lg,
    },
    textarea: {
        ...typography.body,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        padding: spacing.md,
        minHeight: 100,
        color: colors.text.primary,
        backgroundColor: colors.background,
    },
    modalActions: {
        gap: spacing.md,
    },
    button: {
        padding: spacing.md,
        borderRadius: 8,
        alignItems: 'center',
    },
    submitButton: {
        backgroundColor: colors.primary,
    },
    cancelButton: {
        backgroundColor: colors.text.light,
    },
    buttonDisabled: {
        backgroundColor: colors.text.light,
        opacity: 0.5,
    },
    buttonText: {
        ...typography.body,
        color: colors.background,
        fontWeight: '600',
    },
});

export default ReviewModal;
