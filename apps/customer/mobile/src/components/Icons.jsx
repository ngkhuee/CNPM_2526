import React from 'react';
import { View } from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

// Star icon
export function StarIcon({ size = 24, color = '#ff6b35' }) {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
            <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </Svg>
    );
}

// Bell/Notification icon
export function BellIcon({ size = 24, color = '#333' }) {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
            <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <Path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </Svg>
    );
}

// Profile/Account icon
export function AccountIcon({ size = 24, color = '#333' }) {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
            <Circle cx="12" cy="8" r="4" />
            <Path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
        </Svg>
    );
}

// Explore icon
export function ExploreIcon({ size = 24, color = '#ff6b35' }) {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
            <Circle cx="12" cy="12" r="10" />
            <Rect x="9" y="9" width="6" height="6" transform="rotate(45 12 12)" />
        </Svg>
    );
}

// Offer/Tag icon
export function OfferIcon({ size = 24, color = '#ff6b35' }) {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
            <Path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
            <Circle cx="8" cy="7" r="1" />
        </Svg>
    );
}

// Clock icon
export function ClockIcon({ size = 24, color = '#666' }) {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
            <Circle cx="12" cy="12" r="10" />
            <Path d="M12 6v6l4 2" />
        </Svg>
    );
}

// Cart icon
export function CartIcon({ size = 24, color = '#333' }) {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
            <Circle cx="9" cy="21" r="1" />
            <Circle cx="20" cy="21" r="1" />
            <Path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </Svg>
    );
}

// Heart icon
export function HeartIcon({ size = 24, color = '#ff6b35', filled = false }) {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? color : 'none'} stroke={color} strokeWidth={2}>
            <Path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </Svg>
    );
}

// Arrow right icon
export function ArrowRightIcon({ size = 24, color = '#333' }) {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
            <Path d="M5 12h14M12 5l7 7-7 7" />
        </Svg>
    );
}

// Close icon
export function CloseIcon({ size = 24, color = '#333' }) {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
            <Path d="M18 6L6 18M6 6l12 12" />
        </Svg>
    );
}

// Envelope icon (email)
export function EnvelopeIcon({ size = 24, color = '#333' }) {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
            <Rect x="2" y="4" width="20" height="16" rx="2" ry="2" />
            <Path d="M22 6l-10 8-10-8" />
        </Svg>
    );
}

// Lock icon (password)
export function LockIcon({ size = 24, color = '#333' }) {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
            <Rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <Path d="M7 11V7a5 5 0 0 1 10 0v4" />
            <Circle cx="12" cy="20" r="1" />
        </Svg>
    );
}

// Location icon
export function LocationIcon({ size = 24, color = '#ff6b35' }) {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
            <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <Circle cx="12" cy="10" r="3" />
        </Svg>
    );
}
