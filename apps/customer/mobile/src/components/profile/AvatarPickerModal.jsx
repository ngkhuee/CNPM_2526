// components/profile/AvatarPickerModal.jsx
import React, { useState } from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
    Image,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { uploadService } from '../../services/uploadService';

export default function AvatarPickerModal({
    visible,
    onClose,
    onSelectAvatar,
    userName = '',
    currentAvatar = '',
}) {
    const [loading, setLoading] = useState(false);

    const requestPermission = async (type) => {
        if (type === 'camera') {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            return status === 'granted';
        } else {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            return status === 'granted';
        }
    };

    const handlePickImage = async (source) => {
        try {
            // Request permission
            const hasPermission = await requestPermission(source);
            if (!hasPermission) {
                Alert.alert(
                    'Cần quyền truy cập',
                    `Vui lòng cấp quyền ${source === 'camera' ? 'camera' : 'thư viện ảnh'} để chọn ảnh.`
                );
                return;
            }

            setLoading(true);

            // Launch image picker
            const result = source === 'camera'
                ? await ImagePicker.launchCameraAsync({
                    mediaTypes: 'images',
                    allowsEditing: true,
                    aspect: [1, 1],
                    quality: 0.8,
                })
                : await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: 'images',
                    allowsEditing: true,
                    aspect: [1, 1],
                    quality: 0.8,
                });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const image = result.assets[0];

                // Upload to backend
                console.log('[AvatarPickerModal] Uploading image...');
                const uploadResult = await uploadService.uploadImage(image, 'avatars');

                if (uploadResult.success) {
                    console.log('[AvatarPickerModal] Upload success:', uploadResult.url);
                    // Return full URL to parent
                    onSelectAvatar(uploadResult.url);
                    onClose();
                    Alert.alert('Thành công', 'Đã cập nhật ảnh đại diện!');
                } else {
                    console.error('[AvatarPickerModal] Upload failed:', uploadResult.message);
                    Alert.alert('Lỗi', uploadResult.message || 'Không thể tải ảnh lên');
                }
            }
        } catch (error) {
            console.error('[AvatarPickerModal] Error picking image:', error);
            Alert.alert('Lỗi', 'Không thể chọn ảnh. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const renderCurrentAvatar = () => {
        if (currentAvatar) {
            return (
                <Image
                    source={{ uri: currentAvatar }}
                    style={styles.currentAvatarImage}
                    resizeMode="cover"
                />
            );
        }

        const initial = userName ? userName.charAt(0).toUpperCase() : 'U';
        return (
            <View style={styles.defaultAvatarContainer}>
                <Text style={styles.defaultAvatarText}>{initial}</Text>
            </View>
        );
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Thay đổi ảnh đại diện</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Text style={styles.closeButtonText}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Current Avatar Preview */}
                    <View style={styles.previewSection}>
                        {renderCurrentAvatar()}
                        <Text style={styles.previewText}>Ảnh hiện tại</Text>
                    </View>

                    {/* Options */}
                    <View style={styles.optionsContainer}>
                        <TouchableOpacity
                            style={styles.optionButton}
                            onPress={() => handlePickImage('camera')}
                            disabled={loading}
                        >
                            <MaterialIcons name="camera-alt" size={32} color="#ff6347" />
                            <Text style={styles.optionText}>Chụp ảnh</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.optionButton}
                            onPress={() => handlePickImage('library')}
                            disabled={loading}
                        >
                            <MaterialIcons name="photo-library" size={32} color="#ff6347" />
                            <Text style={styles.optionText}>Chọn từ thư viện</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Loading indicator */}
                    {loading && (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#ff6347" />
                            <Text style={styles.loadingText}>Đang tải lên...</Text>
                        </View>
                    )}

                    {/* Cancel Button */}
                    <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={onClose}
                        disabled={loading}
                    >
                        <Text style={styles.cancelButtonText}>Hủy</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'flex-end',
    },
    container: {
        width: '100%',
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: 40,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButtonText: {
        fontSize: 18,
        color: '#666',
        fontWeight: 'bold',
    },
    previewSection: {
        alignItems: 'center',
        marginBottom: 24,
        paddingVertical: 16,
        backgroundColor: '#f9f9f9',
        borderRadius: 12,
    },
    defaultAvatarContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#ff6347',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    currentAvatarImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 8,
        borderWidth: 3,
        borderColor: '#ff6347',
    },
    defaultAvatarText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
    },
    previewText: {
        fontSize: 14,
        color: '#666',
    },
    optionsContainer: {
        gap: 12,
        marginBottom: 20,
    },
    optionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        gap: 16,
    },
    optionText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
        flex: 1,
    },
    loadingContainer: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: '#666',
    },
    cancelButton: {
        padding: 14,
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#666',
    },
});
