// components/tracking/OrderTimeline.jsx
import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated, ScrollView, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const NODE_SIZE = 44;
const NODE_SIZE_CURRENT = 50;
const LABEL_HEIGHT = 40;
const ITEM_WIDTH = 80;
const LINE_WIDTH = 50;
const SCREEN_WIDTH = Dimensions.get('window').width;

export const OrderTimeline = ({ timeline, currentStatusIndex }) => {
    const [animatedValues, setAnimatedValues] = useState([]);
    const scrollViewRef = useRef(null);

    console.log('[OrderTimeline] Rendering with', timeline.length, 'items, currentStatusIndex:', currentStatusIndex);

    useEffect(() => {
        const values = timeline.map((_, index) => {
            const anim = new Animated.Value(index > currentStatusIndex ? 0 : 1);
            if (index <= currentStatusIndex) {
                Animated.timing(anim, {
                    toValue: 1,
                    duration: 300 + index * 100,
                    useNativeDriver: true,
                }).start();
            }
            return anim;
        });
        setAnimatedValues(values);

        // Auto-scroll to center current status
        setTimeout(() => {
            if (scrollViewRef.current && timeline.length > 0) {
                const itemFullWidth = ITEM_WIDTH + LINE_WIDTH;
                const scrollPosition = Math.max(
                    0,
                    currentStatusIndex * itemFullWidth - SCREEN_WIDTH / 2 + ITEM_WIDTH / 2
                );
                scrollViewRef.current.scrollTo({ x: scrollPosition, animated: true });
            }
        }, 400);
    }, [currentStatusIndex, timeline.length]);

    const renderTimelineItem = (step, index) => {
        const isCompleted = index < currentStatusIndex;
        const isCurrent = index === currentStatusIndex;
        const isLineCompleted = index < currentStatusIndex;
        const animValue = animatedValues[index];

        return (
            <View key={`${step.status}-${index}`} style={styles.itemContainer}>
                {/* Node */}
                <Animated.View style={styles.nodeWrapper}>
                    <View
                        style={[
                            styles.node,
                            isCompleted && styles.nodeCompleted,
                            isCurrent && styles.nodeCurrent,
                        ]}
                    >
                        <MaterialIcons
                            name={step.icon}
                            size={isCurrent ? 24 : 20}
                            color={isCompleted || isCurrent ? '#fff' : '#ccc'}
                        />
                    </View>
                    {/* Label below node */}
                    <Text
                        style={[
                            styles.label,
                            isCompleted && styles.labelCompleted,
                            isCurrent && styles.labelCurrent,
                        ]}
                        numberOfLines={2}
                    >
                        {step.label}
                    </Text>
                </Animated.View>

                {/* Connecting Line */}
                {index < timeline.length - 1 && (
                    <View style={styles.lineWrapper}>
                        <View
                            style={[
                                styles.line,
                                isLineCompleted && styles.lineCompleted,
                            ]}
                        />
                    </View>
                )}
            </View>
        );
    };

    return (
        <View style={styles.timelineContainer}>
            <Text style={styles.timelineTitle}>Tiến trình đơn hàng</Text>
            <ScrollView
                ref={scrollViewRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                scrollEventThrottle={16}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.timeline}>
                    {timeline.map((step, index) => renderTimelineItem(step, index))}
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    timelineContainer: {
        backgroundColor: '#fff',
        paddingVertical: 20,
        marginBottom: 8,
    },
    timelineTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 16,
        paddingHorizontal: 16,
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    timeline: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    nodeWrapper: {
        width: ITEM_WIDTH,
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    node: {
        width: NODE_SIZE,
        height: NODE_SIZE,
        borderRadius: NODE_SIZE / 2,
        borderWidth: 3,
        borderColor: '#ddd',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        marginBottom: 8,
    },
    nodeCompleted: {
        backgroundColor: '#4caf50',
        borderColor: '#4caf50',
    },
    nodeCurrent: {
        backgroundColor: '#ff6b35',
        borderColor: '#ff6b35',
        width: NODE_SIZE_CURRENT,
        height: NODE_SIZE_CURRENT,
        borderRadius: NODE_SIZE_CURRENT / 2,
        borderWidth: 3,
    },
    lineWrapper: {
        width: LINE_WIDTH,
        height: NODE_SIZE,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    line: {
        height: 2,
        width: '100%',
        backgroundColor: '#ddd',
    },
    lineCompleted: {
        backgroundColor: '#4caf50',
    },
    label: {
        fontSize: 11,
        color: '#999',
        fontWeight: '500',
        textAlign: 'center',
        lineHeight: 14,
        paddingHorizontal: 4,
        minHeight: LABEL_HEIGHT,
    },
    labelCompleted: {
        color: '#4caf50',
        fontWeight: '600',
    },
    labelCurrent: {
        color: '#ff6b35',
        fontWeight: '700',
        fontSize: 12,
    },
});
