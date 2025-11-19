import { useState, useEffect } from "react";
import { storage, authService } from "shared-services";
import { useAutoRefreshProfile } from "./useAutoRefreshProfile";

/**
 * Custom hook for profile form management (web + mobile)
 * @param {object} user - User object from AuthContext
 * @param {function} setUser - setUser function from AuthContext
 * @returns {object} Profile form state and handlers
 */
export const useProfileForm = (user, setUser) => {
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        gender: "",
        dob: "",
        avatar: "",
    });
    const [loading, setLoading] = useState(false);

    // Auto-refresh profile từ backend khi app focus
    useAutoRefreshProfile(user?.id, (updatedUser) => {
        setUser(updatedUser);
        setFormData({
            name: updatedUser.name || updatedUser.fullName || "",
            email: updatedUser.email || "",
            phone: updatedUser.phone || "",
            gender: updatedUser.gender || "",
            dob: updatedUser.dob || "",
            avatar: updatedUser.avatar || "",
        });
    });

    // Initialize form with user data
    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || user.fullName || "",
                email: user.email || "",
                phone: user.phone || "",
                gender: user.gender || "",
                dob: user.dob || "",
                avatar: user.avatar || "",
            });
        }
    }, [user]);

    const handleInputChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSaveProfile = async () => {
        try {
            setLoading(true);
            // Map frontend field names to backend format
            const profileUpdateData = {
                full_name: formData.name,
                email: formData.email,
                phone: formData.phone,
                gender: formData.gender,
                dob: formData.dob,
                avatar: formData.avatar,
            };

            // Call API to update profile using shared authService
            const response = await authService.updateProfile(user.id, profileUpdateData);
            if (response.success && response.user) {
                // Update AuthContext with response from server
                setUser(response.user);
                setEditing(false);
                return { success: true, message: "Cập nhật thông tin thành công!" };
            } else {
                return { success: false, message: response.message || "Lỗi cập nhật thông tin" };
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            return { success: false, message: "Lỗi cập nhật thông tin" };
        } finally {
            setLoading(false);
        }
    };

    return {
        editing,
        setEditing,
        formData,
        loading,
        handleInputChange,
        handleSaveProfile,
    };
};

