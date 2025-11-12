/**
 * Helper functions for restaurant opening hours
 */

const DAYS_OF_WEEK = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
];

/**
 * Check if restaurant is currently open based on opening_hours
 * @param {Object} openingHours - Opening hours object with day keys: {day: {open: "HH:mm", close: "HH:mm"}}
 * @returns {boolean} - True if currently open, false otherwise
 */
export const isRestaurantOpen = (openingHours) => {
    if (!openingHours || typeof openingHours !== "object") {
        return true; // Assume open if no hours data
    }

    const now = new Date();
    const dayOfWeek = DAYS_OF_WEEK[now.getDay()]; // 0 = Sunday
    const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(
        now.getMinutes()
    ).padStart(2, "0")}`;

    const dayHours = openingHours[dayOfWeek];

    if (!dayHours || !dayHours.open || !dayHours.close) {
        return false; // Closed on this day
    }

    // Simple string comparison works for HH:mm format
    return currentTime >= dayHours.open && currentTime < dayHours.close;
};

/**
 * Get opening hours for today
 * @param {Object} openingHours - Opening hours object
 * @returns {Object|null} - {open: "HH:mm", close: "HH:mm"} or null if closed
 */
export const getTodayHours = (openingHours) => {
    if (!openingHours) return null;

    const now = new Date();
    const dayOfWeek = DAYS_OF_WEEK[now.getDay()];
    const dayHours = openingHours[dayOfWeek];

    return dayHours && dayHours.open && dayHours.close ? dayHours : null;
};

/**
 * Format opening hours for display (next opening time or current hours)
 * @param {Object} openingHours - Opening hours object
 * @returns {string} - Formatted message
 */
export const formatOpeningHoursDisplay = (openingHours) => {
    const todayHours = getTodayHours(openingHours);
    const isOpen = isRestaurantOpen(openingHours);

    if (isOpen && todayHours) {
        return `Open until ${todayHours.close}`;
    }

    if (todayHours) {
        return `Opens at ${todayHours.open}`;
    }

    // Find next open day
    const now = new Date();
    for (let i = 1; i <= 7; i++) {
        const nextDay = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
        const dayOfWeek = DAYS_OF_WEEK[nextDay.getDay()];
        const hours = openingHours[dayOfWeek];

        if (hours && hours.open && hours.close) {
            const dayName = dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1);
            return `Closed today. Open ${dayName} at ${hours.open}`;
        }
    }

    return "Hours not available";
};

/**
 * Get restaurant status badge
 * @param {Object} openingHours - Opening hours object
 * @returns {Object} - {text: string, color: string}
 */
export const getStatusBadge = (openingHours) => {
    if (isRestaurantOpen(openingHours)) {
        return { text: "Open Now", color: "#4CAF50" };
    }
    return { text: "Closed", color: "#f44336" };
};
