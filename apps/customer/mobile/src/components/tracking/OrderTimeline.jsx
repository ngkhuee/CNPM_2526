// components/tracking/OrderTimeline.jsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export const OrderTimeline = ({ timeline, currentStatusIndex }) => {
    return (
        <View style={styles.timelineContainer}>
            <Text style={styles.timelineTitle}>Order Progress</Text>
            <View style={styles.timeline}>
                {timeline.map((step, index) => {
                    const isCompleted = index <= currentStatusIndex;
                    const isCurrent = index === currentStatusIndex;

                    return (
                        <View key={step.status} style={styles.timelineItem}>
                            {/* Timeline node */}
                            <View style={styles.nodeContainer}>
                                <View
                                    style={[
                                        styles.node,
                                        isCompleted && styles.nodeCompleted,
                                        isCurrent && styles.nodeCurrent,
                                    ]}
                                >
                                    <MaterialIcons
                                        name={step.icon}
                                        size={16}
                                        color={isCompleted ? '#fff' : '#ccc'}
                                    />
                                </View>
                                {index < timeline.length - 1 && (
                                    <View
                                        style={[
                                            styles.line,
                                            isCompleted && styles.lineCompleted,
                                        ]}
                                    />
                                )}
                            </View>

                            {/* Timeline label */}
                            <View style={styles.labelContainer}>
                                <Text
                                    style={[
                                        styles.label,
                                        isCompleted && styles.labelCompleted,
                                        isCurrent && styles.labelCurrent,
                                    ]}
                                >
                                    {step.label}
                                </Text>
                            </View>
                        </View>
                    );
                })}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    timelineContainer: {
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 16,
        marginBottom: 8,
    },
    timelineTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 16,
    },
    timeline: {
        marginLeft: 20,
    },
    timelineItem: {
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    nodeContainer: {
        alignItems: 'center',
        marginRight: 12,
        marginTop: 2,
    },
    node: {
        width: 36,
        height: 36,
        borderRadius: 18,
        borderWidth: 2,
        borderColor: '#ddd',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    nodeCompleted: {
        backgroundColor: '#4caf50',
        borderColor: '#4caf50',
    },
    nodeCurrent: {
        backgroundColor: '#ff6b35',
        borderColor: '#ff6b35',
        width: 40,
        height: 40,
    },
    line: {
        width: 2,
        height: 40,
        backgroundColor: '#ddd',
        marginTop: 4,
    },
    lineCompleted: {
        backgroundColor: '#4caf50',
    },
    labelContainer: {
        flex: 1,
        paddingVertical: 8,
    },
    label: {
        fontSize: 13,
        color: '#999',
        fontWeight: '500',
    },
    labelCompleted: {
        color: '#4caf50',
        fontWeight: '600',
    },
    labelCurrent: {
        color: '#ff6b35',
        fontWeight: '700',
    },
});
