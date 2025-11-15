import { useState, useEffect } from "react";
import { storage } from "shared-services";

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

    // Initialize form with user data
    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || "",
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
            // Update user info via API (you'd need to implement this endpoint)
            // For now, just update storage
            const updatedUser = { ...user, ...formData };
            setUser(updatedUser);
            await storage.setItem("user", JSON.stringify(updatedUser));
            setEditing(false);
            return { success: true, message: "Cập nhật thông tin thành công!" };
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
