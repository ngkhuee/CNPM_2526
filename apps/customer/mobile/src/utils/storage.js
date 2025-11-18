/**
 * Storage Abstraction Layer - Mobile App
 * Uses AsyncStorage for React Native
 * Avoids importing from shared-services (which contains import.meta incompatible code)
 */

let storageAdapter = null;

/**
 * Initialize storage adapter for mobile
 * @param {Object} adapter - AsyncStorage instance
 */
export const initStorage = (adapter) => {
    storageAdapter = adapter;
    console.log('[Storage] Adapter initialized:', adapter ? 'Mobile AsyncStorage' : 'Default');
};

/**
 * Get storage implementation
 * @returns {Object} Storage interface
 */
const getStorage = () => {
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

    console.warn('[Storage] No storage adapter available');
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
    async getItem(key) {
        try {
            const s = getStorage();
            return await s.getItem(key);
        } catch (error) {
            console.error(`[Storage] Error getting ${key}:`, error);
            return null;
        }
    },

    async setItem(key, value) {
        try {
            const s = getStorage();
            await s.setItem(key, value);
        } catch (error) {
            console.error(`[Storage] Error setting ${key}:`, error);
            throw error;
        }
    },

    async removeItem(key) {
        try {
            const s = getStorage();
            await s.removeItem(key);
        } catch (error) {
            console.error(`[Storage] Error removing ${key}:`, error);
            throw error;
        }
    },

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
