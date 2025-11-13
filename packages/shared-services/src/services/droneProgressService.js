/**
 * Drone Progress Calculation Service
 * Handles drone position calculations, progress tracking, and animations
 * Used by order tracking in web and mobile apps
 */

/**
 * Calculate drone progress based on order status and GPS
 * Returns a value between 0 and 1
 * @param {Object} order - Order object with status and GPS data
 * @returns {number} - Progress value 0-1
 */
export const calculateDroneProgress = (order) => {
    if (!order || !order.status) return 0;

    switch (order.status) {
        case "pending":
        case "paid":
            return 0;
        case "confirmed":
            return 0.1;
        case "preparing":
            return 0.2;
        case "ready":
            return 0.3;
        case "picking_up":
            return 0.4;
        case "picked_up":
            return 0.5;
        case "delivering": {
            // Calculate progress based on GPS position if available
            if (
                order.current_gps &&
                order.pickup_gps &&
                order.dropoff_gps
            ) {
                const progress = calculateGPSProgress(
                    order.pickup_gps,
                    order.dropoff_gps,
                    order.current_gps
                );
                // Progress from 0.5 to 1.0 during delivery
                return 0.5 + progress * 0.5;
            }
            return 0.7;
        }
        case "delivered":
            return 1;
        default:
            return 0;
    }
};

/**
 * Calculate progress based on GPS coordinates
 * Returns a value between 0 and 1 representing how far along the route the drone is
 * @param {Object} pickup - {lat, lng}
 * @param {Object} dropoff - {lat, lng}
 * @param {Object} current - {lat, lng}
 * @returns {number} - Progress value 0-1
 */
export const calculateGPSProgress = (pickup, dropoff, current) => {
    if (!pickup || !dropoff || !current) return 0.5;

    const pickupLat = pickup.lat || pickup.latitude;
    const pickupLng = pickup.lng || pickup.longitude;
    const dropoffLat = dropoff.lat || dropoff.latitude;
    const dropoffLng = dropoff.lng || dropoff.longitude;
    const currentLat = current.lat || current.latitude;
    const currentLng = current.lng || current.longitude;

    // Calculate total distance from pickup to dropoff
    const totalDistance = Math.sqrt(
        Math.pow(dropoffLat - pickupLat, 2) +
        Math.pow(dropoffLng - pickupLng, 2)
    );

    if (totalDistance === 0) return 1;

    // Calculate distance from pickup to current position
    const currentDistance = Math.sqrt(
        Math.pow(currentLat - pickupLat, 2) +
        Math.pow(currentLng - pickupLng, 2)
    );

    // Return progress clamped between 0 and 1
    return Math.min(currentDistance / totalDistance, 1);
};

/**
 * Convert GPS coordinates to screen coordinates for visualization
 * @param {Object} pickupGPS - {lat, lng}
 * @param {Object} dropoffGPS - {lat, lng}
 * @param {Object} currentGPS - {lat, lng}
 * @param {number} mapWidth - Map width in pixels
 * @param {number} mapHeight - Map height in pixels
 * @returns {Object} - {x, y} screen coordinates
 */
export const gpsToScreenCoordinates = (
    pickupGPS,
    dropoffGPS,
    currentGPS,
    mapWidth = 900,
    mapHeight = 450
) => {
    const startX = 50;
    const startY = mapHeight - 50;
    const endX = mapWidth - 50;
    const endY = 50;

    const progress = calculateGPSProgress(pickupGPS, dropoffGPS, currentGPS);

    return {
        x: startX + (endX - startX) * progress,
        y: startY + (endY - startY) * progress,
    };
};

/**
 * Calculate estimated arrival time based on current progress and status
 * @param {Object} order - Order object
 * @param {number} averageSpeedKmH - Average speed in km/h
 * @returns {string|null} - ISO timestamp of estimated arrival or null
 */
export const calculateEstimatedArrivalTime = (order, averageSpeedKmH = 40) => {
    if (!order || !order.pickup_gps || !order.dropoff_gps) return null;
    if (!["ready", "picking_up", "picked_up", "delivering"].includes(order.status)) {
        return null;
    }

    // Calculate total distance in degrees (simplified)
    const pickupLat = order.pickup_gps.lat || order.pickup_gps.latitude;
    const pickupLng = order.pickup_gps.lng || order.pickup_gps.longitude;
    const dropoffLat = order.dropoff_gps.lat || order.dropoff_gps.latitude;
    const dropoffLng = order.dropoff_gps.lng || order.dropoff_gps.longitude;

    const distanceDegrees = Math.sqrt(
        Math.pow(dropoffLat - pickupLat, 2) +
        Math.pow(dropoffLng - pickupLng, 2)
    );

    // Approximate: 1 degree ≈ 111 km (at equator)
    const distanceKm = distanceDegrees * 111;

    // Calculate time in minutes
    const timeMinutes = (distanceKm / averageSpeedKmH) * 60;

    // Add estimated time to current time
    const now = new Date();
    const eta = new Date(now.getTime() + timeMinutes * 60000);

    return eta.toISOString();
};

/**
 * Check if drone has arrived at delivery location
 * Checks if current position is very close to dropoff location
 * @param {Object} currentGPS - {lat, lng}
 * @param {Object} dropoffGPS - {lat, lng}
 * @param {number} toleranceDegrees - Tolerance in degrees (default ~100m)
 * @returns {boolean}
 */
export const hasDroneArrived = (
    currentGPS,
    dropoffGPS,
    toleranceDegrees = 0.0009
) => {
    if (!currentGPS || !dropoffGPS) return false;

    const currentLat = currentGPS.lat || currentGPS.latitude;
    const currentLng = currentGPS.lng || currentGPS.longitude;
    const dropoffLat = dropoffGPS.lat || dropoffGPS.latitude;
    const dropoffLng = dropoffGPS.lng || dropoffGPS.longitude;

    const distance = Math.sqrt(
        Math.pow(dropoffLat - currentLat, 2) +
        Math.pow(dropoffLng - currentLng, 2)
    );

    return distance <= toleranceDegrees;
};

/**
 * Get drone progress status text
 * @param {number} progress - Progress value 0-1
 * @returns {string} - Status text
 */
export const getDroneProgressText = (progress) => {
    if (progress < 0.1) return "Order Placed";
    if (progress < 0.2) return "Confirmed";
    if (progress < 0.3) return "Preparing";
    if (progress < 0.4) return "Ready";
    if (progress < 0.5) return "Picking Up";
    if (progress < 0.6) return "In Transit";
    if (progress < 1) return `Delivering ${Math.round(progress * 100)}%`;
    return "Delivered";
};

/**
 * Get status badge color based on progress
 * @param {number} progress - Progress value 0-1
 * @param {string} status - Order status
 * @returns {string} - Hex color code
 */
export const getStatusColor = (progress, status) => {
    switch (status) {
        case "delivered":
            return "#4caf50"; // Green
        case "delivering":
        case "picking_up":
        case "picked_up":
            return "#2196f3"; // Blue
        case "preparing":
        case "ready":
            return "#ff9800"; // Orange
        case "confirmed":
            return "#8bc34a"; // Light Green
        case "paid":
            return "#9c27b0"; // Purple
        default:
            return "#757575"; // Gray
    }
};

export const droneProgressService = {
    calculateDroneProgress,
    calculateGPSProgress,
    gpsToScreenCoordinates,
    calculateEstimatedArrivalTime,
    hasDroneArrived,
    getDroneProgressText,
    getStatusColor,
};
