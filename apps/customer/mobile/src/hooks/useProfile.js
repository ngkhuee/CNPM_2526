// hooks/useProfile.js
import { useState, useEffect, useContext } from 'react';
import { Alert } from 'react-native';
import { AuthContext } from '../contexts/AuthContext';
import { authService } from '../services/authService';

export const useProfile = () => {
    const { user: authUser, setUser: setAuthUser, logout } = useContext(AuthContext);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [saveLoading, setSaveLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        gender: 'Male',
        dob: '',
        avatar: '',
    });

    useEffect(() => {
        fetchUserData();
    }, [authUser]);

    const fetchUserData = async () => {
        try {
            setLoading(true);
            // Get user from auth context
            if (authUser) {
                setUser(authUser);
                setFormData({
                    name: authUser.name || '',
                    email: authUser.email || '',
                    phone: authUser.phone || '',
                    gender: authUser.gender || 'Male',
                    dob: authUser.dob || '',
                    avatar: authUser.avatar || '',
                });
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
            Alert.alert('Error', 'Failed to load profile data');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSaveProfile = async () => {
        try {
            setSaveLoading(true);
            if (user?.id) {
                // Call shared authService to update profile via API
                const response = await authService.updateProfile(user.id, formData);
                if (response.success && response.user) {
                    // Update both local state and AuthContext from API response
                    setUser(response.user);
                    setAuthUser(response.user);
                    setEditing(false);
                    Alert.alert('Success', 'Profile updated successfully');
                } else {
                    Alert.alert('Error', response.message || 'Failed to save profile');
                }
            }
        } catch (error) {
            console.error('Error saving profile:', error);
            Alert.alert('Error', 'Failed to save profile');
        } finally {
            setSaveLoading(false);
        }
    };

    const handleAvatarChange = async (avatarUrl) => {
        try {
            setSaveLoading(true);
            if (user?.id) {
                // Update avatar via API
                const response = await authService.updateProfile(user.id, { avatar: avatarUrl });
                if (response.success && response.user) {
                    // Update both local state and AuthContext
                    setUser(response.user);
                    setAuthUser(response.user);
                    setFormData(prev => ({
                        ...prev,
                        avatar: response.user.avatar || avatarUrl,
                    }));
                    Alert.alert('Success', 'Avatar updated successfully');
                } else {
                    Alert.alert('Error', response.message || 'Failed to update avatar');
                }
            }
        } catch (error) {
            console.error('Error updating avatar:', error);
            Alert.alert('Error', 'Failed to update avatar');
        } finally {
            setSaveLoading(false);
        }
    };

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: () => {
                        logout();
                        Alert.alert('Logged out', 'You have been logged out successfully');
                    },
                },
            ]
        );
    };

    return {
        user,
        loading,
        editing,
        saveLoading,
        formData,
        setEditing,
        handleInputChange,
        handleSaveProfile,
        handleLogout,
        handleAvatarChange,
    };
};
