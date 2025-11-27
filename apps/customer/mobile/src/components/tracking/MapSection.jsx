// components/tracking/MapSection.jsx - Enhanced with arrival detection using WebView with real-time drone updates
import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Linking, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { DroneIcon } from './DroneIcon';

// Debug logging
console.log('[MapSection] Component loaded');

export const MapSection = ({ order }) => {
    const [pulseAnim] = useState(new Animated.Value(1));
    const [mapLoading, setMapLoading] = useState(true);
    const webViewRef = useRef(null);
    const hasArrivedRef = useRef(false);
    const lastDroneGPSRef = useRef(null);

    // Check if order is in active delivery states
    const isActiveDelivery = ['confirmed', 'preparing', 'ready', 'delivering', 'arrived'].includes(order?.status);
    const isDelivering = order?.status === 'delivering';

    // Check if drone has GPS position
    const hasDroneGPS = order?.current_gps && (order.current_gps.lat || order.current_gps.latitude);

    // Normalize GPS format - handle both lat/lng and latitude/longitude
    const normalizeGPS = (gps) => {
        if (!gps) return { lat: 10.776, lng: 106.7 };
        return {
            lat: gps.lat || gps.latitude || 10.776,
            lng: gps.lng || gps.longitude || 106.7,
        };
    };

    // Calculate distance between two GPS points
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // Earth's radius in km
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLon = ((lon2 - lon1) * Math.PI) / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    // Pulse animation for active delivery status
    useEffect(() => {
        if (isActiveDelivery && hasDroneGPS) {
            const pulseAnimation = Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.2,
                        duration: 1000,
                        useNativeDriver: false,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 1000,
                        useNativeDriver: false,
                    }),
                ])
            );
            pulseAnimation.start();
            return () => pulseAnimation.stop();
        }
    }, [isActiveDelivery, hasDroneGPS]);

    // Fit map to show pickup and dropoff locations
    useEffect(() => {
        // Map will be updated through WebView whenever currentGPS changes
    }, [order.pickup_gps, order.dropoff_gps, order.current_gps]);

    // Update drone position in map when current_gps changes
    useEffect(() => {
        if (!webViewRef.current) return;
        if (!hasDroneGPS) return;

        const droneGPS = normalizeGPS(order.current_gps);

        // Check if position actually changed - use tolerance for floating point comparison
        const hasPositionChanged = !lastDroneGPSRef.current ||
            Math.abs(lastDroneGPSRef.current.lat - droneGPS.lat) > 0.00001 ||
            Math.abs(lastDroneGPSRef.current.lng - droneGPS.lng) > 0.00001;

        if (!hasPositionChanged) {
            return;
        }

        lastDroneGPSRef.current = { ...droneGPS };

        // Send update command to WebView
        const jsCode = `
            if (window.updateDronePosition) {
                window.updateDronePosition(${droneGPS.lat}, ${droneGPS.lng});
            }
            true;
        `;

        webViewRef.current.injectJavaScript(jsCode);
        console.log('[MapSection] Updated drone position:', droneGPS);
    }, [order.current_gps, isDelivering, order.current_gps?.lat, order.current_gps?.lng, order.current_gps?.latitude, order.current_gps?.longitude]);

    // Reset arrival flag when order status changes
    useEffect(() => {
        if (order?.status !== 'delivering') {
            hasArrivedRef.current = false;
        }
    }, [order?.status]);

    // Generate Leaflet map HTML with DroneIcon SVG and updateDronePosition function
    const generateMapHTML = () => {
        const pickupGPS = normalizeGPS(order.pickup_gps);
        const dropoffGPS = normalizeGPS(order.dropoff_gps);
        // Show drone when has current_gps (drone is assigned and moving)
        const droneGPS = hasDroneGPS ? normalizeGPS(order.current_gps) : null;

        // Material Icon SVGs as escaped HTML
        const restaurantMarkerHtml = '<div style="background: #FF6B35; color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.4);"><svg xmlns=\\"http://www.w3.org/2000/svg\\" viewBox=\\"0 0 24 24\\" width=\\"24\\" height=\\"24\\" fill=\\"white\\"><path d=\\"M11 9H9v2h2V9zm4 0h-2v2h2V9zm4-7H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 16h-2v2h-2v-2h-2v2h-2v-2H5v-5h14v5zm0-7H5V5h14v7z\\"/></svg></div>';

        const homeMarkerHtml = '<div style="background: #4caf50; color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.4);"><svg xmlns=\\"http://www.w3.org/2000/svg\\" viewBox=\\"0 0 24 24\\" width=\\"24\\" height=\\"24\\" fill=\\"white\\"><path d=\\"M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z\\"/></svg></div>';

        // DroneIcon SVG (custom drone design)
        const droneMarkerHtml = '<div style="background: #1976d2; color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.4);"><svg xmlns=\\"http://www.w3.org/2000/svg\\" viewBox=\\"0 0 40 40\\" width=\\"24\\" height=\\"24\\" fill=\\"none\\" stroke-width=\\"1.5\\" stroke=\\"white\\" stroke-linecap=\\"round\\" stroke-linejoin=\\"round\\"><circle cx=\\"20\\" cy=\\"20\\" r=\\"6\\" fill=\\"white\\"/><line x1=\\"20\\" y1=\\"5\\" x2=\"20\\" y2=\\"1\\" stroke=\\"white\\" stroke-width=\\"1.5\\"/><line x1=\\"20\\" y1=\\"39\\" x2=\\"20\\" y2=\\"35\\" stroke=\\"white\\" stroke-width=\\"1.5\\"/><line x1=\\"5\\" y1=\\"20\\" x2=\\"1\\" y2=\\"20\\" stroke=\\"white\\" stroke-width=\\"1.5\\"/><line x1=\\"35\\" y1=\\"20\\" x2=\\"39\\" y2=\\"20\\" stroke=\\"white\\" stroke-width=\\"1.5\\"/><circle cx=\\"20\\" cy=\\"4\\" r=\\"2.5\\" fill=\\"white\\"/><circle cx=\\"20\\" cy=\\"36\\" r=\\"2.5\\" fill=\\"white\\"/><circle cx=\\"4\\" cy=\\"20\\" r=\\"2.5\\" fill=\\"white\\"/><circle cx=\\"36\\" cy=\\"20\\" r=\\"2.5\\" fill=\\"white\\"/><line x1=\\"20\\" y1=\\"20\\" x2=\\"28\\" y2=\\"12\\" stroke=\\"white\\" stroke-width=\\"1.5\\" opacity=\\"0.6\\"/><line x1=\\"20\\" y1=\\"20\\" x2=\\"12\\" y2=\\"28\\" stroke=\\"white\\" stroke-width=\\"1.5\\" opacity=\\"0.6\\"/><line x1=\\"20\\" y1=\\"20\\" x2=\\"28\\" y2=\\"28\\" stroke=\\"white\\" stroke-width=\\"1.5\\" opacity=\\"0.6\\"/><line x1=\\"20\\" y1=\\"20\\" x2=\\"12\\" y2=\\"12\\" stroke=\\"white\\" stroke-width=\\"1.5\\" opacity=\\"0.6\\"/><circle cx=\\"20\\" cy=\\"20\\" r=\\"2\\" fill=\\"white\\" opacity=\\"0.5\\"/></svg></div>';

        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
                <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossorigin="" />
                <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" crossorigin=""><\/script>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    html, body { width: 100%; height: 100%; overflow: hidden; }
                    #map { width: 100%; height: 100%; background: #e8e8e8; }
                    .custom-marker { font-size: 24px; }
                    @keyframes pulse {
                        0%, 100% { transform: scale(1); opacity: 1; }
                        50% { transform: scale(1.2); opacity: 0.8; }
                    }
                    .pulse-drone { animation: pulse 1.5s infinite; }
                </style>
            </head>
            <body>
                <div id="map"></div>
                <script>
                    var map, droneMarker, dronePolyline, pickupGPS, dropoffGPS;

                    function initMap() {
                        try {
                            pickupGPS = { lat: ${pickupGPS.lat}, lng: ${pickupGPS.lng} };
                            dropoffGPS = { lat: ${dropoffGPS.lat}, lng: ${dropoffGPS.lng} };
                            ${droneGPS ? `var initialDroneGPS = { lat: ${droneGPS.lat}, lng: ${droneGPS.lng} };` : `var initialDroneGPS = null;`}

                            // Initialize map
                            map = L.map('map', {
                                center: [pickupGPS.lat, pickupGPS.lng],
                                zoom: 14,
                                zoomControl: true,
                                attributionControl: false
                            });
                            
                            // Use multiple tile sources as fallback
                            var tileLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                                maxZoom: 19,
                                crossOrigin: 'anonymous'
                            });
                            
                            tileLayer.on('tileerror', function(error) {
                                console.log('Tile error, trying fallback...');
                            });
                            
                            tileLayer.addTo(map);

                            // Restaurant marker
                            L.marker([pickupGPS.lat, pickupGPS.lng], {
                                icon: L.divIcon({
                                    html: '${restaurantMarkerHtml}',
                                    iconSize: [40, 40],
                                    iconAnchor: [20, 20],
                                    className: 'custom-marker'
                                })
                            }).addTo(map);

                            // Delivery marker
                            L.marker([dropoffGPS.lat, dropoffGPS.lng], {
                                icon: L.divIcon({
                                    html: '${homeMarkerHtml}',
                                    iconSize: [40, 40],
                                    iconAnchor: [20, 20],
                                    className: 'custom-marker'
                                })
                            }).addTo(map);

                            // Route line
                            L.polyline(
                                [[pickupGPS.lat, pickupGPS.lng], [dropoffGPS.lat, dropoffGPS.lng]],
                                { color: '#FF6B35', weight: 3, dashArray: '8, 8', opacity: 0.8 }
                            ).addTo(map);

                            // Initial drone marker
                            if (initialDroneGPS) {
                                droneMarker = L.marker([initialDroneGPS.lat, initialDroneGPS.lng], {
                                    icon: L.divIcon({
                                        html: '<div class="pulse-drone">${droneMarkerHtml}</div>',
                                        iconSize: [40, 40],
                                        iconAnchor: [20, 20],
                                        className: 'custom-marker'
                                    })
                                }).addTo(map);

                                dronePolyline = L.polyline(
                                    [[initialDroneGPS.lat, initialDroneGPS.lng], [dropoffGPS.lat, dropoffGPS.lng]],
                                    { color: '#1976d2', weight: 2, opacity: 0.8 }
                                ).addTo(map);
                                
                                window.currentDroneLat = initialDroneGPS.lat;
                                window.currentDroneLng = initialDroneGPS.lng;
                            }

                            // Fit bounds to show all markers
                            var bounds = L.latLngBounds([
                                [pickupGPS.lat, pickupGPS.lng],
                                [dropoffGPS.lat, dropoffGPS.lng]
                            ]);
                            if (initialDroneGPS) {
                                bounds.extend([initialDroneGPS.lat, initialDroneGPS.lng]);
                            }
                            map.fitBounds(bounds, { padding: [40, 40] });
                            
                            console.log('Map initialized successfully');
                            
                            // Force a redraw after a short delay
                            setTimeout(function() {
                                map.invalidateSize();
                            }, 100);
                            
                        } catch (error) {
                            console.error('Map init error:', error.message);
                            document.body.innerHTML = '<div style="padding:20px;color:red;text-align:center;">Map Error: ' + error.message + '</div>';
                        }
                    }

                    // Update drone position function
                    window.updateDronePosition = function(lat, lng) {
                        if (!map) return;
                        
                        if (!droneMarker) {
                            droneMarker = L.marker([lat, lng], {
                                icon: L.divIcon({
                                    html: '<div class="pulse-drone">${droneMarkerHtml}</div>',
                                    iconSize: [40, 40],
                                    iconAnchor: [20, 20],
                                    className: 'custom-marker'
                                })
                            }).addTo(map);
                            
                            dronePolyline = L.polyline(
                                [[lat, lng], [dropoffGPS.lat, dropoffGPS.lng]],
                                { color: '#1976d2', weight: 2, opacity: 0.8 }
                            ).addTo(map);
                            
                            window.currentDroneLat = lat;
                            window.currentDroneLng = lng;
                        } else {
                            animateDroneTo(lat, lng, 400);
                        }
                    };
                    
                    function animateDroneTo(targetLat, targetLng, duration) {
                        if (!droneMarker) return;
                        
                        if (window.droneAnimationId) {
                            cancelAnimationFrame(window.droneAnimationId);
                        }
                        
                        var startLat = window.currentDroneLat || droneMarker.getLatLng().lat;
                        var startLng = window.currentDroneLng || droneMarker.getLatLng().lng;
                        
                        if (Math.abs(startLat - targetLat) < 0.000001 && Math.abs(startLng - targetLng) < 0.000001) {
                            return;
                        }
                        
                        var startTime = performance.now();
                        
                        function animate(currentTime) {
                            var elapsed = currentTime - startTime;
                            var progress = Math.min(elapsed / duration, 1);
                            var easeProgress = 1 - Math.pow(1 - progress, 3);
                            
                            var newLat = startLat + (targetLat - startLat) * easeProgress;
                            var newLng = startLng + (targetLng - startLng) * easeProgress;
                            
                            droneMarker.setLatLng([newLat, newLng]);
                            
                            if (dronePolyline) {
                                dronePolyline.setLatLngs([[newLat, newLng], [dropoffGPS.lat, dropoffGPS.lng]]);
                            }
                            
                            if (progress < 1) {
                                window.droneAnimationId = requestAnimationFrame(animate);
                            } else {
                                window.currentDroneLat = targetLat;
                                window.currentDroneLng = targetLng;
                                window.droneAnimationId = null;
                            }
                        }
                        
                        window.droneAnimationId = requestAnimationFrame(animate);
                    }

                    // Initialize map when DOM ready
                    if (document.readyState === 'complete') {
                        initMap();
                    } else {
                        document.addEventListener('DOMContentLoaded', initMap);
                    }
                </script>
            </body>
            </html>
        `;
    };    // Calculate distances
    const pickupGPS = normalizeGPS(order.pickup_gps);
    const dropoffGPS = normalizeGPS(order.dropoff_gps);

    console.log('[MapSection] Render:', {
        orderId: order?.id,
        status: order?.status,
        isDelivering,
        pickupGPS,
        dropoffGPS,
        currentGPS: order?.current_gps,
    });

    let deliveryDistance = 0;
    let currentDistance = 0;

    if (dropoffGPS && pickupGPS) {
        deliveryDistance = calculateDistance(
            pickupGPS.lat,
            pickupGPS.lng,
            dropoffGPS.lat,
            dropoffGPS.lng
        );

        if (hasDroneGPS) {
            currentDistance = calculateDistance(
                order.current_gps.lat || order.current_gps.latitude || 10.776,
                order.current_gps.lng || order.current_gps.longitude || 106.7,
                dropoffGPS.lat,
                dropoffGPS.lng
            );
        }
    }

    return (
        <>
            {/* Map Legend */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Lộ trình giao hàng</Text>
                <View style={styles.legendContainer}>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendIcon, { backgroundColor: '#FF6B35' }]}>
                            <MaterialIcons name="restaurant" size={14} color="#fff" />
                        </View>
                        <View style={styles.legendText}>
                            <Text style={styles.legendLabel}>Nhà hàng</Text>
                            <Text style={styles.legendValue} numberOfLines={1}>
                                {order.restaurant_name || 'Restaurant'}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendIcon, { backgroundColor: '#4caf50' }]}>
                            <MaterialIcons name="home" size={14} color="#fff" />
                        </View>
                        <View style={styles.legendText}>
                            <Text style={styles.legendLabel}>Giao hàng</Text>
                            <Text style={styles.legendValue} numberOfLines={1}>
                                {order.customer?.address || 'Vị trí của bạn'}
                            </Text>
                        </View>
                    </View>
                    {order.drone_id && (
                        <View style={styles.legendItem}>
                            <View style={[styles.legendIcon, { backgroundColor: '#1976d2' }]}>
                                <DroneIcon size={20} color="#fff" />
                            </View>
                            <View style={styles.legendText}>
                                <Text style={styles.legendLabel}>Drone</Text>
                                <Text style={styles.legendValue}>{order.drone_id}</Text>
                            </View>
                        </View>
                    )}
                </View>
            </View>

            {/* Map Container */}
            <View style={styles.section}>
                <View style={styles.mapContainer}>
                    <WebView
                        ref={webViewRef}
                        source={{ html: generateMapHTML() }}
                        style={styles.map}
                        scrollEnabled={false}
                        onLoadEnd={() => {
                            console.log('[MapSection] WebView loaded');
                            setMapLoading(false);
                        }}
                        onError={(syntheticEvent) => {
                            const { nativeEvent } = syntheticEvent;
                            console.error('[MapSection] WebView Error:', nativeEvent);
                            setMapLoading(false);
                        }}
                        onHttpError={(syntheticEvent) => {
                            const { nativeEvent } = syntheticEvent;
                            console.warn('[MapSection] HTTP Error:', nativeEvent.statusCode);
                        }}
                        onMessage={(event) => {
                            console.log('[MapSection] WebView Message:', event.nativeEvent.data);
                        }}
                        javaScriptEnabled={true}
                        domStorageEnabled={true}
                        startInLoadingState={true}
                        mixedContentMode="always"
                        allowUniversalAccessFromFileURLs={true}
                        allowFileAccess={true}
                        originWhitelist={['*']}
                        androidLayerType="hardware"
                        cacheEnabled={true}
                        cacheMode="LOAD_DEFAULT"
                        setSupportMultipleWindows={false}
                        onContentProcessDidTerminate={() => {
                            console.log('[MapSection] Content process terminated, reloading...');
                            webViewRef.current?.reload();
                        }}
                    />
                    {mapLoading && (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#FF6B35" />
                            <Text style={styles.loadingText}>Đang tải bản đồ...</Text>
                        </View>
                    )}
                    {/* View on Map Button */}
                    {dropoffGPS && (
                        <TouchableOpacity
                            style={styles.viewMapButton}
                            onPress={() => {
                                const url = `https://www.openstreetmap.org/?mlat=${dropoffGPS.lat}&mlon=${dropoffGPS.lng}#map=15/${dropoffGPS.lat}/${dropoffGPS.lng}`;
                                Linking.openURL(url);
                            }}
                        >
                            <MaterialIcons name="open-in-new" size={16} color="#fff" />
                            <Text style={styles.viewMapButtonText}>Xem bản đồ</Text>
                        </TouchableOpacity>
                    )}
                </View>
                <Text style={styles.mapNote}>
                    {isDelivering
                        ? 'Theo dõi thời gian thực trong quá trình giao hàng'
                        : order?.status === 'arrived'
                            ? 'Drone giao hàng đã đến điểm đích'
                            : order?.status === 'delivered'
                                ? 'Đơn hàng đã được giao'
                                : hasDroneGPS
                                    ? 'Drone đang di chuyển đến nhà hàng'
                                    : 'Bản đồ sẽ hiển thị khi bắt đầu giao hàng'}
                </Text>
            </View>

            {/* Distance Information - Show when drone has GPS */}
            {hasDroneGPS && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Tiến độ giao hàng</Text>
                    <View style={styles.progressCard}>
                        <View style={styles.progressRow}>
                            <Text style={styles.progressLabel}>Tổng quãng đường</Text>
                            <Text style={styles.progressValue}>
                                {deliveryDistance.toFixed(2)} km
                            </Text>
                        </View>
                        <View style={styles.progressRow}>
                            <Text style={styles.progressLabel}>Quãng đường còn lại</Text>
                            <Text style={styles.progressValue}>
                                {currentDistance.toFixed(2)} km
                            </Text>
                        </View>
                        <View style={styles.progressBar}>
                            <View
                                style={[
                                    styles.progressFill,
                                    {
                                        width: `${deliveryDistance > 0
                                            ? Math.max(
                                                0,
                                                Math.min(100, ((deliveryDistance - currentDistance) / deliveryDistance) * 100)
                                            )
                                            : 0
                                            }%`,
                                    },
                                ]}
                            />
                        </View>
                    </View>
                </View>
            )}
        </>
    );
};

const styles = StyleSheet.create({
    section: {
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 16,
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 12,
    },
    legendContainer: {
        gap: 10,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        padding: 10,
        backgroundColor: '#f8f8f8',
        borderRadius: 8,
    },
    legendIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    legendText: {
        flex: 1,
    },
    legendLabel: {
        fontSize: 12,
        color: '#999',
        fontWeight: '500',
    },
    legendValue: {
        fontSize: 13,
        color: '#1a1a1a',
        fontWeight: '600',
        marginTop: 2,
    },
    mapContainer: {
        height: 300,
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        overflow: 'hidden',
        marginBottom: 10,
        position: 'relative',
    },
    map: {
        flex: 1,
        width: '100%',
    },
    loadingContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(240, 240, 240, 0.9)',
        zIndex: 100,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 14,
        color: '#FF6B35',
        fontWeight: '600',
    },
    mapNote: {
        fontSize: 12,
        color: '#999',
        fontStyle: 'italic',
    },
    progressCard: {
        backgroundColor: '#f8f8f8',
        borderRadius: 8,
        padding: 12,
        gap: 10,
    },
    progressRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    progressLabel: {
        fontSize: 13,
        color: '#666',
        fontWeight: '500',
    },
    progressValue: {
        fontSize: 13,
        color: '#1a1a1a',
        fontWeight: '600',
    },
    progressBar: {
        height: 6,
        backgroundColor: '#e0e0e0',
        borderRadius: 3,
        overflow: 'hidden',
        marginTop: 4,
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#FF6B35',
        borderRadius: 3,
    },
    viewMapButton: {
        position: 'absolute',
        bottom: 10,
        right: 10,
        backgroundColor: '#FF6B35',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 6,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    viewMapButtonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
});
