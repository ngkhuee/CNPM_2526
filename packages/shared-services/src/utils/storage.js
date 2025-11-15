/**
 * Storage Abstraction Layer
 * Supports both Web (localStorage) and Mobile (AsyncStorage)
 * 
 * Usage:
 * Web: Automatically uses localStorage (no setup needed)
 * Mobile: Call initStorage(AsyncStorage) in app entry point
 */

let storageAdapter = null;

/**
 * Initialize storage adapter for mobile
 * Call this in mobile app's index.js before rendering
 * @param {Object} adapter - AsyncStorage instance
 */
export const initStorage = (adapter) => {
    storageAdapter = adapter;
    console.log('[Storage] Adapter initialized:', adapter ? 'Custom (Mobile)' : 'Default (Web)');
};

/**
 * Get storage implementation based on platform
 * @returns {Object} Storage interface
 */
const getStorage = () => {
    // Priority 1: Custom adapter (Mobile AsyncStorage)
    if (storageAdapter) {
        return {
            getItem: async (key) => {
                const value = await storageAdapter.getItem(key);
                return value;
            },
            setItem: async (key, value) => {
                await storageAdapter.setItem(key, value);
            },
            removeItem: async (key) => {
                await storageAdapter.removeItem(key);
            },
            clear: async () => {
                await storageAdapter.clear();
            },
        };
    }

    // Priority 2: Web localStorage (synchronous wrapped as async)
    if (typeof localStorage !== 'undefined') {
        return {
            getItem: async (key) => {
                return localStorage.getItem(key);
            },
            setItem: async (key, value) => {
                localStorage.setItem(key, value);
            },
            removeItem: async (key) => {
                localStorage.removeItem(key);
            },
            clear: async () => {
                localStorage.clear();
            },
        };
    }

    // Priority 3: Fallback (no storage available)
    console.warn('[Storage] No storage available, using no-op implementation');
    return {
        getItem: async () => null,
        setItem: async () => { },
        removeItem: async () => { },
        clear: async () => { },
    };
};

/**
 * Storage API
 * All methods return Promises for consistency
 */
export const storage = {
    /**
     * Get item from storage
     * @param {string} key 
     * @returns {Promise<string|null>}
     */
    async getItem(key) {
        try {
            const s = getStorage();
            return await s.getItem(key);
        } catch (error) {
            console.error(`[Storage] Error getting ${key}:`, error);
            return null;
        }
    },

    /**
     * Set item in storage
     * @param {string} key 
     * @param {string} value 
     * @returns {Promise<void>}
     */
    async setItem(key, value) {
        try {
            const s = getStorage();
            await s.setItem(key, value);
        } catch (error) {
            console.error(`[Storage] Error setting ${key}:`, error);
            throw error;
        }
    },

    /**
     * Remove item from storage
     * @param {string} key 
     * @returns {Promise<void>}
     */
    async removeItem(key) {
        try {
            const s = getStorage();
            await s.removeItem(key);
        } catch (error) {
            console.error(`[Storage] Error removing ${key}:`, error);
            throw error;
        }
    },

    /**
     * Clear all items from storage
     * @returns {Promise<void>}
     */
    async clear() {
        try {
            const s = getStorage();
            await s.clear();
        } catch (error) {
            console.error('[Storage] Error clearing storage:', error);
            throw error;
        }
    },
};

export default storage;
