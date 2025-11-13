/**
 * Order Timeline Component - Mobile Version
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, typography } from '../../styles';

export const OrderTimeline = ({ order, timelineStages = null }) => {
    const iconMap = {
        paid: 'card',
        confirmed: 'checkmark-circle',
        preparing: 'restaurant',
        ready: 'cube',
        picking_up: 'airplane',
        picked_up: 'location',
        delivering: 'car',
        delivered: 'checkmark-done-circle',
    };

    const defaultStages = [
        { status: 'paid', label: 'Paid' },
        { status: 'confirmed', label: 'Confirmed' },
        { status: 'preparing', label: 'Preparing' },
        { status: 'ready', label: 'Ready' },
        { status: 'picking_up', label: 'Picking Up' },
        { status: 'picked_up', label: 'Picked Up' },
        { status: 'delivering', label: 'Delivering' },
        { status: 'delivered', label: 'Delivered' },
    ];

    const stages = timelineStages || defaultStages;
    const statusOrder = stages.map((s) => s.status);
    const currentIndex = statusOrder.indexOf(order?.status);

    return (
        <View style={styles.container}>
            <View style={styles.timeline}>
                {stages.map((stage, index) => {
                    const isCompleted = index <= currentIndex;
                    const isActive = index === currentIndex;

                    return (
                        <React.Fragment key={stage.status}>
                            <View style={styles.stageContainer}>
                                <View
                                    style={[
                                        styles.iconCircle,
                                        isCompleted && styles.iconCompleted,
                                        isActive && styles.iconActive,
                                    ]}
                                >
                                    <Icon
                                        name={iconMap[stage.status] || 'ellipse'}
                                        size={20}
                                        color={isCompleted ? colors.background : colors.text.light}
                                    />
                                </View>
                                <Text
                                    style={[
                                        styles.label,
                                        isCompleted && styles.labelCompleted,
                                    ]}
                                >
                                    {stage.label}
                                </Text>
                            </View>

                            {index < stages.length - 1 && (
                                <View
                                    style={[
                                        styles.connector,
                                        isCompleted && styles.connectorCompleted,
                                    ]}
                                />
                            )}
                        </React.Fragment>
                    );
                })}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: spacing.lg,
    },
    timeline: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    stageContainer: {
        flex: 1,
        alignItems: 'center',
    },
    iconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.border,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    iconCompleted: {
        backgroundColor: '#4caf50',
    },
    iconActive: {
        backgroundColor: '#4caf50',
        shadowColor: '#4caf50',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 8,
    },
    label: {
        ...typography.caption,
        fontSize: 11,
        color: colors.text.light,
        textAlign: 'center',
        fontWeight: '600',
    },
    labelCompleted: {
        color: colors.text.primary,
    },
    connector: {
        height: 2,
        flex: 1,
        backgroundColor: colors.border,
        marginBottom: 24,
    },
    connectorCompleted: {
        backgroundColor: '#4caf50',
    },
});

export default OrderTimeline;
