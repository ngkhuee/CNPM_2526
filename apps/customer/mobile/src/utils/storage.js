/**
 * Storage Adapter for React Native
 * Provides localStorage-compatible API using AsyncStorage directly
 * No async/await to avoid Babel helper requirements
 */
import AsyncStorageLib from '@react-native-async-storage/async-storage';

const AsyncStorage = AsyncStorageLib;

// Direct pass-through to AsyncStorage
const storage = {
    setItem: function (key, value) {
        const jsonValue = JSON.stringify(value);
        return AsyncStorage.setItem(key, jsonValue);
    },

    getItem: function (key) {
        return AsyncStorage.getItem(key).then(function (jsonValue) {
            return jsonValue != null ? JSON.parse(jsonValue) : null;
        }).catch(function (error) {
            console.error('Error getting ' + key + ':', error);
            return null;
        });
    },

    removeItem: function (key) {
        return AsyncStorage.removeItem(key);
    },

    clear: function () {
        return AsyncStorage.clear();
    },

    multiGet: function (keys) {
        return AsyncStorage.multiGet(keys).then(function (items) {
            const result = [];
            let i = 0;
            while (i < items.length) {
                const item = items[i];
                const key = item[0];
                const value = item[1];
                result.push([key, value ? JSON.parse(value) : null]);
                i = i + 1;
            }
            return result;
        }).catch(function (error) {
            console.error('Error getting multiple items:', error);
            return [];
        });
    },

    multiSet: function (keyValuePairs) {
        const pairs = [];
        let i = 0;
        while (i < keyValuePairs.length) {
            const item = keyValuePairs[i];
            const key = item[0];
            const value = item[1];
            pairs.push([key, JSON.stringify(value)]);
            i = i + 1;
        }
        return AsyncStorage.multiSet(pairs);
    },

    getAllKeys: function () {
        return AsyncStorage.getAllKeys();
    },
};

export default storage;
