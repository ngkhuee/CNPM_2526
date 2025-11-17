/**
 * Address Management Hook
 * Handles address selection, geocoding, and storage
 * Shared between web and mobile customer apps
 */

import { useCallback } from "react";
import { addressService } from "shared-services";

export const useAddressManagement = (user) => {
    /**
     * Save address to database
     * @param {Object} addressData - {address, phone, district, city, lat, lng}
     * @param {boolean} shouldSave - Whether to save as default
     * @returns {Promise<Object|null>} - Saved address or null
     */
    const saveAddressToDatabase = useCallback(
        async (addressData, shouldSave = false) => {
            if (!user || !user.id) {
                console.warn("⚠️ No user ID for saving address");
                return null;
            }

            try {
                console.log(
                    shouldSave
                        ? "💾 Saving new address..."
                        : "📍 Creating temporary address for order..."
                );

                const savedAddress = await addressService.create({
                    userId: user.id,
                    addressLine: addressData.address,
                    phone: addressData.phone,
                    district: addressData.district || "",
                    city: addressData.city || "",
                    lat: addressData.lat || null,
                    lng: addressData.lng || null,
                    isDefault: shouldSave && addressData.isDefault,
                });

                console.log("Address created successfully:", savedAddress);
                return savedAddress;
            } catch (error) {
                console.error("Error creating address:", error);
                return null;
            }
        },
        [user]
    );

    /**
     * Update address
     * @param {string} addressId - Address ID
     * @param {Object} addressData - Updated address data
     * @returns {Promise<Object|null>}
     */
    const updateAddress = useCallback(async (addressId, addressData) => {
        try {
            const updated = await addressService.update(addressId, addressData);
            console.log("Address updated successfully:", updated);
            return updated;
        } catch (error) {
            console.error("Error updating address:", error);
            return null;
        }
    }, []);

    /**
     * Delete address
     * @param {string} addressId - Address ID
     * @returns {Promise<boolean>}
     */
    const deleteAddress = useCallback(async (addressId) => {
        try {
            await addressService.delete(addressId);
            console.log("Address deleted successfully");
            return true;
        } catch (error) {
            console.error("Error deleting address:", error);
            return false;
        }
    }, []);

    return {
        saveAddressToDatabase,
        updateAddress,
        deleteAddress,
    };
};
