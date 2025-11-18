// hooks/useProfile.js
import { useState, useEffect, useContext } from 'react';
import { Alert } from 'react-native';
import { AuthContext } from '../contexts/AuthContext';
import { profileService } from '../services/profileService';

export const useProfile = () => {
    const { user: authUser, logout } = useContext(AuthContext);
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
            } else {
                // Fallback to mock for testing
                const storedUser = profileService.getMockUser();
                if (storedUser) {
                    setUser(storedUser);
                    setFormData({
                        name: storedUser.name || '',
                        email: storedUser.email || '',
                        phone: storedUser.phone || '',
                        gender: storedUser.gender || 'Male',
                        dob: storedUser.dob || '',
                        avatar: storedUser.avatar || '',
                    });
                }
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
                await profileService.updateUserProfile(user.id, formData);
            }
            setUser(prev => ({ ...prev, ...formData }));
            setEditing(false);
            Alert.alert('Success', 'Profile updated successfully');
        } catch (error) {
            console.error('Error saving profile:', error);
            Alert.alert('Error', 'Failed to save profile');
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
    };
};
