import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { formatRating } from '../../shared/formatters';
import { isRestaurantOpen, getTodayHours } from '../../utils/hoursHelper';
import { getRestaurantImageUrl, getRestaurantBannerUrl } from '../../shared/imageHelper';
import { DroneIcon } from '../tracking/DroneIcon';

export const RestaurantHeaderCompact = ({ restaurant }) => {
    const imageUrl = getRestaurantImageUrl(restaurant);
    const bannerUrl = getRestaurantBannerUrl(restaurant);
    const rating = formatRating(restaurant.rating);
    const isOpen = isRestaurantOpen(restaurant.openingHours);
    const todayHours = getTodayHours(restaurant.openingHours);

    const distance = restaurant.distance || 0;

    // Calculate delivery time based on distance (drone speed ~50 km/h)
    // Base time: 10 minutes (preparation) + travel time
    const travelTimeMinutes = distance > 0 ? Math.ceil((distance / 50) * 60) : 0;
    const deliveryTime = String(10 + travelTimeMinutes);

    return (
        <>
            {/* Banner */}
            <Image source={{ uri: bannerUrl }} style={styles.banner} />

            <View style={styles.restaurantInfo}>
                {/* Restaurant Info Header */}
                <View style={styles.infoHeader}>
                    <Image source={{ uri: imageUrl }} style={styles.restaurantImage} />
                    <View style={styles.infoContent}>
                        <Text style={styles.restaurantName}>{restaurant.name}</Text>
                        <View style={styles.ratingRow}>
                            <MaterialIcons name="star" size={14} color="#ffc107" />
                            <Text style={styles.ratingText}>{rating}</Text>
                            <Text style={styles.reviewCount}>
                                ({restaurant.totalReviews})
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Quick Info */}
                <View style={styles.quickInfo}>
                    <View style={styles.quickInfoItem}>
                        <DroneIcon size={16} color="#ff6b35" />
                        <Text style={styles.quickInfoText}>
                            {deliveryTime} phút
                        </Text>
                    </View>
                    <View style={styles.quickInfoItem}>
                        <MaterialIcons name="location-on" size={16} color="#ff6b35" />
                        <Text style={styles.quickInfoText} numberOfLines={1}>
                            {restaurant.address}
                        </Text>
                    </View>
                </View>

                {/* Opening Hours & Status */}
                <View style={styles.statusSection}>
                    <View style={[styles.statusBadge, isOpen ? styles.statusOpen : styles.statusClosed]}>
                        <MaterialIcons
                            name={isOpen ? "check-circle" : "cancel"}
                            size={16}
                            color="#fff"
                        />
                        <Text style={styles.statusText}>
                            {isOpen ? 'Đang mở cửa' : 'Đã đóng cửa'}
                        </Text>
                    </View>
                    {todayHours && (
                        <Text style={styles.hoursText}>
                            {todayHours.open} - {todayHours.close}
                        </Text>
                    )}
                </View>

                {/* Description */}
                {restaurant.description && (
                    <Text style={styles.description}>{restaurant.description}</Text>
                )}

                {/* Closed Notice Banner */}
                {!isOpen && (
                    <View style={styles.closedBanner}>
                        <MaterialIcons name="info" size={20} color="#ff9800" />
                        <View style={styles.closedBannerText}>
                            <Text style={styles.closedBannerTitle}>Hiện đang đóng cửa</Text>
                            {todayHours && (
                                <Text style={styles.closedBannerSubtitle}>
                                    Mở cửa lúc {todayHours.open}
                                </Text>
                            )}
                        </View>
                    </View>
                )}

                {/* Blocked Restaurant Banner */}
                {restaurant.status === 'blocked' && (
                    <View style={styles.blockedBanner}>
                        <MaterialIcons name="lock" size={20} color="#d32f2f" />
                        <Text style={styles.blockedText}>Nhà hàng đã ngừng hoạt động</Text>
                    </View>
                )}
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    banner: {
        width: '100%',
        height: 200,
        backgroundColor: '#eee',
    },
    restaurantInfo: {
        backgroundColor: '#fff',
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    infoHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    restaurantImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
        marginRight: 12,
        backgroundColor: '#eee',
    },
    infoContent: {
        flex: 1,
    },
    restaurantName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#333',
        marginBottom: 4,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    ratingText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#333',
        marginLeft: 4,
    },
    reviewCount: {
        fontSize: 12,
        color: '#999',
        marginLeft: 4,
    },
    category: {
        fontSize: 12,
        color: '#999',
    },
    quickInfo: {
        gap: 8,
    },
    quickInfoItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    quickInfoText: {
        fontSize: 12,
        color: '#666',
        marginLeft: 8,
        flex: 1,
    },
    statusSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginHorizontal: 12,
        marginTop: 12,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 6,
    },
    statusOpen: { backgroundColor: '#4CAF50' },
    statusClosed: { backgroundColor: '#f44336' },
    statusText: {
        fontSize: 12,
        color: '#fff',
        fontWeight: '600',
    },
    hoursText: {
        fontSize: 12,
        color: '#666',
        fontWeight: '500',
    },
    description: {
        fontSize: 13,
        color: '#666',
        lineHeight: 18,
        marginHorizontal: 12,
        marginTop: 12,
    },
    closedBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff3e0',
        borderWidth: 1,
        borderColor: '#ffb74d',
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginHorizontal: 12,
        marginTop: 12,
        gap: 10,
    },
    closedBannerText: { flex: 1 },
    closedBannerTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#e65100',
    },
    closedBannerSubtitle: {
        fontSize: 12,
        color: '#ef6c00',
        marginTop: 2,
    },
    blockedBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffebee',
        borderWidth: 1,
        borderColor: '#ef5350',
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginHorizontal: 12,
        marginTop: 12,
        gap: 8,
    },
    blockedText: {
        fontSize: 13,
        color: '#d32f2f',
        fontWeight: '600',
    },
});
