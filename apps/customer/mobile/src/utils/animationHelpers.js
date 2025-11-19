import { Animated } from 'react-native';

export const createScaleAnimation = (fromValue = 1, toValue = 1.2, duration = 200) => {
    const scaleValue = new Animated.Value(fromValue);

    const animate = () => {
        Animated.sequence([
            Animated.timing(scaleValue, {
                toValue: toValue,
                duration: duration,
                useNativeDriver: true,
            }),
            Animated.timing(scaleValue, {
                toValue: fromValue,
                duration: duration,
                useNativeDriver: true,
            }),
        ]).start();
    };

    return {
        scaleValue,
        animate,
    };
};

export const createBubbleAnimation = () => {
    const scale = new Animated.Value(1);

    const pulse = () => {
        Animated.sequence([
            Animated.timing(scale, {
                toValue: 1.15,
                duration: 150,
                useNativeDriver: true,
            }),
            Animated.timing(scale, {
                toValue: 1,
                duration: 150,
                useNativeDriver: true,
            }),
        ]).start();
    };

    return { scale, pulse };
};
