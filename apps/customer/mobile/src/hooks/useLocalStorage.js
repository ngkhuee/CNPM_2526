import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Mobile version of useLocalStorage using AsyncStorage
 * Provides similar API to web localStorage hook but with async operations
 */
export const useLocalStorage = (key, initialValue) => {
    const [storedValue, setStoredValue] = useState(initialValue);
    const [isLoading, setIsLoading] = useState(true);

    // Load from AsyncStorage on mount
    useEffect(() => {
        loadValue();
    }, [key]);

    const loadValue = async () => {
        try {
            setIsLoading(true);
            const item = await AsyncStorage.getItem(key);
            if (item) {
                setStoredValue(JSON.parse(item));
            } else {
                setStoredValue(initialValue);
            }
        } catch (error) {
            console.error(`Error reading from AsyncStorage (${key}):`, error);
            setStoredValue(initialValue);
        } finally {
            setIsLoading(false);
        }
    };

    // Set value to AsyncStorage
    const setValue = async (value) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            await AsyncStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            console.error(`Error writing to AsyncStorage (${key}):`, error);
        }
    };

    // Remove from AsyncStorage
    const removeValue = async () => {
        try {
            await AsyncStorage.removeItem(key);
            setStoredValue(initialValue);
        } catch (error) {
            console.error(`Error removing from AsyncStorage (${key}):`, error);
        }
    };

    return [storedValue, setValue, removeValue, isLoading];
};

export default useLocalStorage;
