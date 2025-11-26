import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    SafeAreaView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRestaurantRegistration } from '../../hooks/useRestaurantRegistration';

/**
 * RegisterRestaurantScreen - Restaurant registration form for mobile
 * Allows customer to become a restaurant partner
 */
export default function RegisterRestaurantScreen({ onNavigate }) {
    const { formData, loading, error, handleChange, handleSubmit, resetForm } =
        useRestaurantRegistration();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleRegistration = async () => {
        const result = await handleSubmit();

        if (result.success) {
            Alert.alert(
                'Đăng ký thành công',
                'Nhà hàng của bạn đã được gửi để xét duyệt. Bạn sẽ được thông báo khi được chấp thuận.',
                [
                    {
                        text: 'Đồng ý',
                        onPress: () => {
                            resetForm();
                            onNavigate('home');
                        },
                    },
                ]
            );
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => onNavigate('home')}>
                    <MaterialIcons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Trở thành đối tác</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 30 }}
            >
                {/* Error Message */}
                {error && (
                    <View style={styles.errorContainer}>
                        <MaterialIcons name="warning" size={20} color="#e74c3c" />
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                )}

                {/* Hero Section */}
                <View style={styles.heroSection}>
                    <MaterialIcons name="store" size={48} color="#ff6b35" />
                    <Text style={styles.heroTitle}>Tham gia nền tảng</Text>
                    <Text style={styles.heroSubtitle}>
                        Tiếp cận hàng ngàn khách hàng và phát triển kinh doanh
                    </Text>
                </View>

                {/* Restaurant Information Section */}
                <View style={styles.formSection}>
                    <Text style={styles.sectionTitle}>Thông tin nhà hàng</Text>

                    {/* Restaurant Name */}
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>
                            Tên nhà hàng <Text style={styles.required}>*</Text>
                        </Text>
                        <View style={styles.inputContainer}>
                            <MaterialIcons
                                name="store"
                                size={18}
                                color="#ff6b35"
                                style={styles.inputIcon}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="VD: Pizza Hut"
                                placeholderTextColor="#ccc"
                                value={formData.restaurantName}
                                onChangeText={(value) => handleChange('restaurantName', value)}
                            />
                        </View>
                    </View>

                    {/* Address */}
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>
                            Địa chỉ <Text style={styles.required}>*</Text>
                        </Text>
                        <View style={styles.inputContainer}>
                            <MaterialIcons
                                name="location-on"
                                size={18}
                                color="#ff6b35"
                                style={styles.inputIcon}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Địa chỉ đầy đủ của nhà hàng"
                                placeholderTextColor="#ccc"
                                value={formData.address}
                                onChangeText={(value) => handleChange('address', value)}
                            />
                        </View>
                    </View>

                    {/* Description */}
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Mô tả (Tùy chọn)</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Giới thiệu về nhà hàng của bạn..."
                            placeholderTextColor="#ccc"
                            multiline
                            numberOfLines={3}
                            value={formData.description}
                            onChangeText={(value) => handleChange('description', value)}
                        />
                    </View>
                </View>

                {/* Owner Information Section */}
                <View style={styles.formSection}>
                    <Text style={styles.sectionTitle}>Thông tin chủ sở hữu</Text>

                    {/* Full Name */}
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>
                            Họ tên <Text style={styles.required}>*</Text>
                        </Text>
                        <View style={styles.inputContainer}>
                            <MaterialIcons
                                name="person"
                                size={18}
                                color="#ff6b35"
                                style={styles.inputIcon}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Họ tên của bạn"
                                placeholderTextColor="#ccc"
                                value={formData.ownerName}
                                onChangeText={(value) => handleChange('ownerName', value)}
                            />
                        </View>
                    </View>

                    {/* Email */}
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>
                            Email <Text style={styles.required}>*</Text>
                        </Text>
                        <View style={styles.inputContainer}>
                            <MaterialIcons
                                name="email"
                                size={18}
                                color="#ff6b35"
                                style={styles.inputIcon}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="your@email.com"
                                placeholderTextColor="#ccc"
                                keyboardType="email-address"
                                value={formData.email}
                                onChangeText={(value) => handleChange('email', value)}
                            />
                        </View>
                    </View>

                    {/* Phone */}
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>
                            Số điện thoại <Text style={styles.required}>*</Text>
                        </Text>
                        <View style={styles.inputContainer}>
                            <MaterialIcons
                                name="phone"
                                size={18}
                                color="#ff6b35"
                                style={styles.inputIcon}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="0901234567"
                                placeholderTextColor="#ccc"
                                keyboardType="phone-pad"
                                value={formData.phone}
                                onChangeText={(value) => handleChange('phone', value)}
                            />
                        </View>
                    </View>

                    {/* Password */}
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>
                            Mật khẩu <Text style={styles.required}>*</Text>
                        </Text>
                        <View style={styles.inputContainer}>
                            <MaterialIcons
                                name="lock"
                                size={18}
                                color="#ff6b35"
                                style={styles.inputIcon}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Ít nhất 6 ký tự"
                                placeholderTextColor="#ccc"
                                secureTextEntry={!showPassword}
                                value={formData.password}
                                onChangeText={(value) => handleChange('password', value)}
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                <MaterialIcons
                                    name={showPassword ? 'visibility' : 'visibility-off'}
                                    size={18}
                                    color="#999"
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Confirm Password */}
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>
                            Xác nhận mật khẩu <Text style={styles.required}>*</Text>
                        </Text>
                        <View style={styles.inputContainer}>
                            <MaterialIcons
                                name="lock"
                                size={18}
                                color="#ff6b35"
                                style={styles.inputIcon}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Nhập lại mật khẩu"
                                placeholderTextColor="#ccc"
                                secureTextEntry={!showConfirmPassword}
                                value={formData.confirmPassword}
                                onChangeText={(value) => handleChange('confirmPassword', value)}
                            />
                            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                                <MaterialIcons
                                    name={showConfirmPassword ? 'visibility' : 'visibility-off'}
                                    size={18}
                                    color="#999"
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Buttons */}
                <View style={styles.formActions}>
                    <TouchableOpacity
                        style={[styles.button, styles.cancelBtn]}
                        onPress={() => onNavigate('home')}
                        disabled={loading}
                    >
                        <Text style={styles.cancelBtnText}>Hủy</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.button, styles.submitBtn, loading && styles.submitBtnDisabled]}
                        onPress={handleRegistration}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Text style={styles.submitBtnText}>Gửi đơn đăng ký</Text>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Info Note */}
                <View style={styles.infoNote}>
                    <MaterialIcons name="info" size={16} color="#666" />
                    <Text style={styles.infoText}>
                        Sau khi gửi, đơn đăng ký của bạn sẽ được xét duyệt bởi đội ngũ quản trị.
                        Bạn sẽ được thông báo khi nhà hàng được chấp thuận.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 40,
        backgroundColor: '#fff',
    },

    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },

    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },

    content: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 20,
    },

    // Error Container
    errorContainer: {
        backgroundColor: '#fce4ec',
        borderLeftWidth: 4,
        borderLeftColor: '#e74c3c',
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderRadius: 6,
        marginBottom: 20,
        flexDirection: 'row',
        alignItems: 'flex-start',
    },

    errorText: {
        color: '#c33',
        fontSize: 13,
        marginLeft: 8,
        flex: 1,
    },

    // Hero Section
    heroSection: {
        alignItems: 'center',
        marginBottom: 30,
        paddingVertical: 20,
    },

    heroTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#333',
        marginTop: 12,
    },

    heroSubtitle: {
        fontSize: 14,
        color: '#666',
        marginTop: 6,
        textAlign: 'center',
    },

    // Form Section
    formSection: {
        marginBottom: 25,
    },

    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 14,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },

    // Form Group
    formGroup: {
        marginBottom: 16,
    },

    label: {
        fontSize: 13,
        fontWeight: '500',
        color: '#555',
        marginBottom: 6,
    },

    required: {
        color: '#e74c3c',
    },

    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        paddingHorizontal: 12,
        backgroundColor: '#fafafa',
    },

    inputIcon: {
        marginRight: 8,
    },

    input: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 14,
        color: '#333',
    },

    textArea: {
        height: 80,
        paddingTop: 12,
        textAlignVertical: 'top',
    },

    // Form Actions
    formActions: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 20,
    },

    button: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },

    cancelBtn: {
        backgroundColor: '#f5f5f5',
        borderWidth: 1,
        borderColor: '#ddd',
    },

    cancelBtnText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },

    submitBtn: {
        backgroundColor: '#ff6b35',
    },

    submitBtnDisabled: {
        opacity: 0.6,
    },

    submitBtnText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#fff',
    },

    // Info Note
    infoNote: {
        backgroundColor: '#f0f0f0',
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 10,
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 20,
    },

    infoText: {
        fontSize: 12,
        color: '#666',
        marginLeft: 8,
        flex: 1,
    },
});
