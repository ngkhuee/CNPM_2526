/**
 * Restaurant Hours Hook
 * Handles restaurant opening hours checking
 * Shared between web and mobile customer apps
 */

import { useCallback, useMemo } from "react";

/**
 * Get today's opening hours
 * @param {Array} openingHours - Opening hours array
 * @returns {Object|null} - {open, close} or null
 */
const getTodayHours = (openingHours) => {
    if (!Array.isArray(openingHours) || openingHours.length === 0) {
        return null;
    }

    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.

    // Map day number to day name
    const dayNames = [
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
    ];
    const todayName = dayNames[dayOfWeek];

    const todayHours = openingHours.find(
        (h) => h.day.toLowerCase() === todayName
    );

    if (todayHours && todayHours.open && todayHours.close) {
        return {
            open: todayHours.open,
            close: todayHours.close,
            isClosed: todayHours.closed === true,
        };
    }

    return null;
};

/**
 * Check if restaurant is currently open
 * @param {Array} openingHours - Opening hours array
 * @returns {boolean}
 */
const isRestaurantOpen = (openingHours) => {
    const todayHours = getTodayHours(openingHours);

    if (!todayHours || todayHours.isClosed) {
        return false;
    }

    const now = new Date();
    const currentTime = now.getHours() * 100 + now.getMinutes(); // Convert to HHMM format

    const openTime = parseInt(todayHours.open.replace(":", ""));
    const closeTime = parseInt(todayHours.close.replace(":", ""));

    return currentTime >= openTime && currentTime < closeTime;
};

/**
 * Calculate time until restaurant opens/closes
 * @param {Array} openingHours - Opening hours array
 * @returns {Object} - {status, timeUntil, message}
 */
const getTimeUntilStatusChange = (openingHours) => {
    const todayHours = getTodayHours(openingHours);

    if (!todayHours) {
        return {
            status: "unknown",
            timeUntil: null,
            message: "Hours not available",
        };
    }

    const now = new Date();
    const currentTime = now.getHours() * 100 + now.getMinutes();

    const openTime = parseInt(todayHours.open.replace(":", ""));
    const closeTime = parseInt(todayHours.close.replace(":", ""));

    if (currentTime < openTime) {
        // Restaurant not yet open
        const timeDiff = openTime - currentTime;
        const hours = Math.floor(timeDiff / 100);
        const minutes = timeDiff % 100;

        return {
            status: "closed",
            timeUntil: { hours, minutes },
            message: `Opens in ${hours}h ${minutes}m`,
        };
    } else if (currentTime < closeTime) {
        // Restaurant is open
        const timeDiff = closeTime - currentTime;
        const hours = Math.floor(timeDiff / 100);
        const minutes = timeDiff % 100;

        return {
            status: "open",
            timeUntil: { hours, minutes },
            message: `Closes in ${hours}h ${minutes}m`,
        };
    } else {
        // Restaurant closed
        return {
            status: "closed",
            timeUntil: null,
            message: "Closed for today",
        };
    }
};

export const useRestaurantHours = (openingHours) => {
    /**
     * Get today's hours
     */
    const todayHours = useMemo(() => {
        return getTodayHours(openingHours);
    }, [openingHours]);

    /**
     * Check if open
     */
    const isOpen = useMemo(() => {
        return isRestaurantOpen(openingHours);
    }, [openingHours]);

    /**
     * Get time until status change
     */
    const timeUntilChange = useMemo(() => {
        return getTimeUntilStatusChange(openingHours);
    }, [openingHours]);

    /**
     * Get formatted hours string
     */
    const formattedHours = useCallback(() => {
        if (!todayHours) return "Hours not available";
        if (todayHours.isClosed) return "Closed today";
        return `${todayHours.open} - ${todayHours.close}`;
    }, [todayHours]);

    /**
     * Get hours for specific day
     */
    const getHoursForDay = useCallback(
        (dayName) => {
            if (!Array.isArray(openingHours)) return null;

            const day = openingHours.find(
                (h) => h.day.toLowerCase() === dayName.toLowerCase()
            );

            if (day && day.open && day.close) {
                return {
                    open: day.open,
                    close: day.close,
                    isClosed: day.closed === true,
                };
            }

            return null;
        },
        [openingHours]
    );

    /**
     * Get all week hours
     */
    const getWeekHours = useCallback(() => {
        if (!Array.isArray(openingHours)) return [];

        return openingHours.map((day) => ({
            day: day.day,
            open: day.open,
            close: day.close,
            isClosed: day.closed === true,
        }));
    }, [openingHours]);

    return {
        todayHours,
        isOpen,
        timeUntilChange,
        formattedHours,
        getHoursForDay,
        getWeekHours,
    };
};

// Export utility functions for use outside of hook
export { getTodayHours, isRestaurantOpen, getTimeUntilStatusChange };
