/**
 * Debug helpers to identify undefined or null values being rendered
 */

export const safeRender = (value, defaultValue = '') => {
    if (value === null || value === undefined) {
        console.warn('[DEBUG] Attempting to render null/undefined value:', {
            value,
            stack: new Error().stack,
        });
        return defaultValue;
    }
    return value;
};

export const validateComponent = (componentName, props) => {
    console.log(`[${componentName}] Props:`, JSON.stringify(props, null, 2));
};
