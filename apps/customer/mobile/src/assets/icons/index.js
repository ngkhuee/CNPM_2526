/**
 * Customer Mobile - Icon Library
 * Using react-native-svg for consistent design with web
 * Shows text labels as fallback (emoji đã xóa)
 */

import React from 'react';
import { Text } from 'react-native';

/**
 * Icon wrapper component with text fallback
 * Mobile app sử dụng text labels thay vì SVG để đơn giản
 * Thiết kế vẫn đồng bộ với web qua color scheme
 */

// Generic icon component
const IconComponent = ({ name, size = 24, color = '#333' }) => (
    <Text style={{ fontSize: size, color }}>
        {name}
    </Text>
);

// Food/Restaurant icons
export const RestaurantIcon = ({ size = 24, color = '#ff6b35' }) => (
    <IconComponent name="RESTAURANT" size={size} color={color} />
);

export const FoodIcon = ({ size = 24, color = '#ff6b35' }) => (
    <IconComponent name="FOOD" size={size} color={color} />
);

// Navigation/Location icons
export const LocationIcon = ({ size = 24, color = '#ff6b35' }) => (
    <IconComponent name="LOC" size={size} color={color} />
);

export const MapIcon = ({ size = 24, color = '#333' }) => (
    <IconComponent name="MAP" size={size} color={color} />
);

export const NavigationIcon = ({ size = 24, color = '#333' }) => (
    <IconComponent name="NAV" size={size} color={color} />
);

// Rating/Star icons
export const StarIcon = ({ size = 24, color = '#ffc107', filled = true }) => (
    <IconComponent name={filled ? '★' : '☆'} size={size} color={color} />
);

// Status icons
export const CheckIcon = ({ size = 24, color = '#4caf50' }) => (
    <IconComponent name="✓" size={size} color={color} />
);

export const ErrorIcon = ({ size = 24, color = '#dc3545' }) => (
    <IconComponent name="✕" size={size} color={color} />
);

export const CancelIcon = ({ size = 24, color = '#dc3545' }) => (
    <IconComponent name="✕" size={size} color={color} />
);

export const RefreshIcon = ({ size = 24, color = '#333' }) => (
    <IconComponent name="↻" size={size} color={color} />
);

// Shopping icons
export const CartIcon = ({ size = 24, color = '#333' }) => (
    <IconComponent name="CART" size={size} color={color} />
);

export const BagIcon = ({ size = 24, color = '#333' }) => (
    <IconComponent name="BAG" size={size} color={color} />
);

// User/Profile icons
export const UserIcon = ({ size = 24, color = '#333' }) => (
    <IconComponent name="USER" size={size} color={color} />
);

export const EditIcon = ({ size = 24, color = '#333' }) => (
    <IconComponent name="EDIT" size={size} color={color} />
);

export const LogoutIcon = ({ size = 24, color = '#333' }) => (
    <IconComponent name="EXIT" size={size} color={color} />
);

export const SettingsIcon = ({ size = 24, color = '#333' }) => (
    <IconComponent name="⚙" size={size} color={color} />
);

// Communication icons
export const NotificationIcon = ({ size = 24, color = '#333' }) => (
    <IconComponent name="BELL" size={size} color={color} />
);

export const PaymentIcon = ({ size = 24, color = '#333' }) => (
    <IconComponent name="💳" size={size} color={color} />
);

export const HelpIcon = ({ size = 24, color = '#333' }) => (
    <IconComponent name="?" size={size} color={color} />
);

export const PhoneIcon = ({ size = 24, color = '#333' }) => (
    <IconComponent name="☎" size={size} color={color} />
);

// Search/Action icons
export const SearchIcon = ({ size = 24, color = '#333' }) => (
    <IconComponent name="🔍" size={size} color={color} />
);

export const DeleteIcon = ({ size = 24, color = '#dc3545' }) => (
    <IconComponent name="DEL" size={size} color={color} />
);

export const AddIcon = ({ size = 24, color = '#333' }) => (
    <IconComponent name="+" size={size} color={color} />
);

export const MoreIcon = ({ size = 24, color = '#333' }) => (
    <IconComponent name="⋯" size={size} color={color} />
);

export const BackIcon = ({ size = 24, color = '#333' }) => (
    <IconComponent name="←" size={size} color={color} />
);

// Delivery/Tracking icons
export const ShippingIcon = ({ size = 24, color = '#333' }) => (
    <IconComponent name="SHIP" size={size} color={color} />
);

export const DeliveryIcon = ({ size = 24, color = '#333' }) => (
    <IconComponent name="🚗" size={size} color={color} />
);

export const DroneIcon = ({ size = 24, color = '#333' }) => (
    <IconComponent name="DRONE" size={size} color={color} />
);

export const TimelineIcon = ({ size = 24, color = '#333' }) => (
    <IconComponent name="───" size={size} color={color} />
);

export const HomeIcon = ({ size = 24, color = '#333' }) => (
    <IconComponent name="HOME" size={size} color={color} />
);

// Form icons
export const VisibilityIcon = ({ size = 24, color = '#333' }) => (
    <IconComponent name="👁" size={size} color={color} />
);

export const VisibilityOffIcon = ({ size = 24, color = '#999' }) => (
    <IconComponent name="🚫" size={size} color={color} />
);

export const EmailIcon = ({ size = 24, color = '#333' }) => (
    <IconComponent name="✉" size={size} color={color} />
);

// Icon sizes for consistency
export const ICON_SIZES = {
    xs: 14,
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32,
};

// Icon colors for consistency
export const ICON_COLORS = {
    primary: '#ff6b35',
    success: '#4caf50',
    error: '#dc3545',
    warning: '#ffc107',
    info: '#0066cc',
    text: '#333333',
    textLight: '#666666',
    textMuted: '#999999',
    border: '#e0e0e0',
};
