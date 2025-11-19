import apiClient from "../config/apiClient";
import { ENDPOINTS } from "../config/endpoints";

export const addressService = {
  async getByUser(userId) {
    try {
      return await apiClient.get(ENDPOINTS.ADDRESSES.BY_USER(userId));
    } catch (error) {
      throw error;
    }
  },

  async getById(id) {
    try {
      return await apiClient.get(ENDPOINTS.ADDRESSES.BY_ID(id));
    } catch (error) {
      throw error;
    }
  },

  async create(addressData) {
    try {
      const newAddress = {
        user_id: addressData.userId,
        address_line: addressData.addressLine || addressData.address_line,
        district: addressData.district || "",
        city: addressData.city || "",
        phone: addressData.phone || "",
        lat: addressData.lat || null,
        lng: addressData.lng || null,
        is_default: addressData.isDefault || false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      return await apiClient.post(ENDPOINTS.ADDRESSES.BASE, newAddress);
    } catch (error) {
      throw error;
    }
  },

  async update(id, addressData) {
    try {
      const updatePayload = {
        updated_at: new Date().toISOString(),
      };

      // Map all possible field names to snake_case
      if (addressData.addressLine || addressData.address_line) {
        updatePayload.address_line = addressData.addressLine || addressData.address_line;
      }
      if (addressData.district) {
        updatePayload.district = addressData.district;
      }
      if (addressData.city) {
        updatePayload.city = addressData.city;
      }
      if (addressData.phone) {
        updatePayload.phone = addressData.phone;
      }
      if (addressData.lat !== undefined) {
        updatePayload.lat = addressData.lat;
      }
      if (addressData.lng !== undefined) {
        updatePayload.lng = addressData.lng;
      }
      if (addressData.isDefault !== undefined || addressData.is_default !== undefined) {
        updatePayload.is_default = addressData.isDefault !== undefined ? addressData.isDefault : addressData.is_default;
      }

      return await apiClient.patch(ENDPOINTS.ADDRESSES.BY_ID(id), updatePayload);
    } catch (error) {
      throw error;
    }
  },

  async delete(id) {
    try {
      return await apiClient.delete(ENDPOINTS.ADDRESSES.BY_ID(id));
    } catch (error) {
      throw error;
    }
  },

  async setDefault(userId, addressId) {
    try {
      // Unset all default addresses for user
      const addresses = await this.getByUser(userId);
      for (const addr of addresses) {
        if (addr.is_default && addr.id !== addressId) {
          await this.update(addr.id, { is_default: false });
        }
      }

      // Set new default
      return await this.update(addressId, { is_default: true });
    } catch (error) {
      throw error;
    }
  },
};
