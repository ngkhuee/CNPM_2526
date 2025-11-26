// DroneIcon.jsx - Web version for shared-ui
import React from 'react';

export const DroneIcon = ({ size = 40, color = '#FF6B35', className = '' }) => {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 40 40"
            fill="none"
            strokeWidth="1.5"
            stroke={color}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            style={{ display: 'inline-block', verticalAlign: 'middle' }}
        >
            {/* Central body */}
            <circle cx="20" cy="20" r="6" fill={color} />

            {/* Propeller arms - 4 arms forming X */}
            <line x1="20" y1="5" x2="20" y2="1" stroke={color} strokeWidth="1.5" />
            <line x1="20" y1="39" x2="20" y2="35" stroke={color} strokeWidth="1.5" />
            <line x1="5" y1="20" x2="1" y2="20" stroke={color} strokeWidth="1.5" />
            <line x1="35" y1="20" x2="39" y2="20" stroke={color} strokeWidth="1.5" />

            {/* Propeller circles at ends */}
            <circle cx="20" cy="4" r="2.5" fill={color} />
            <circle cx="20" cy="36" r="2.5" fill={color} />
            <circle cx="4" cy="20" r="2.5" fill={color} />
            <circle cx="36" cy="20" r="2.5" fill={color} />

            {/* Diagonal propeller arms */}
            <line x1="20" y1="20" x2="28" y2="12" stroke={color} strokeWidth="1.5" opacity="0.6" />
            <line x1="20" y1="20" x2="12" y2="28" stroke={color} strokeWidth="1.5" opacity="0.6" />
            <line x1="20" y1="20" x2="28" y2="28" stroke={color} strokeWidth="1.5" opacity="0.6" />
            <line x1="20" y1="20" x2="12" y2="12" stroke={color} strokeWidth="1.5" opacity="0.6" />

            {/* Camera lens indicator */}
            <circle cx="20" cy="20" r="2" fill={color} opacity="0.5" />
        </svg>
    );
};

export default DroneIcon;
