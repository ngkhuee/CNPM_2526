// components/tracking/MapSection.jsx - Enhanced with arrival detection using WebView with real-time drone updates
import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Linking, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';

// Debug logging
console.log('[MapSection] Component loaded');

export const MapSection = ({ order }) => {
    const [pulseAnim] = useState(new Animated.Value(1));
    const [mapLoading, setMapLoading] = useState(true);
    const webViewRef = useRef(null);
    const hasArrivedRef = useRef(false);
    const lastDroneGPSRef = useRef(null);
    const isDelivering = order?.status === 'delivering';

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

    // Pulse animation for delivering status
    useEffect(() => {
        if (isDelivering) {
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
    }, [isDelivering]);

    // Fit map to show pickup and dropoff locations
    useEffect(() => {
        // Map will be updated through WebView whenever currentGPS changes
    }, [order.pickup_gps, order.dropoff_gps, order.current_gps]);

    // Update drone position in map when current_gps changes
    useEffect(() => {
        if (!webViewRef.current) return;
        if (!isDelivering || !order.current_gps) return;

        const droneGPS = normalizeGPS(order.current_gps);

        // Check if position actually changed
        if (lastDroneGPSRef.current &&
            lastDroneGPSRef.current.lat === droneGPS.lat &&
            lastDroneGPSRef.current.lng === droneGPS.lng) {
            return;
        }

        lastDroneGPSRef.current = droneGPS;

        // Send update command to WebView
        const jsCode = `
            if (window.updateDronePosition) {
                window.updateDronePosition(${droneGPS.lat}, ${droneGPS.lng});
            }
            true;
        `;

        webViewRef.current.injectJavaScript(jsCode);
        console.log('[MapSection] Updated drone position:', droneGPS);
    }, [order.current_gps, isDelivering]);

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
        const droneGPS = isDelivering && order.current_gps ? normalizeGPS(order.current_gps) : null;

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
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <meta http-equiv="Content-Security-Policy" content="default-src *; script-src * 'unsafe-inline' 'unsafe-eval'; style-src * 'unsafe-inline'; img-src * data: blob:; font-src * data:; connect-src *;">
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css" />
                <script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js"><\/script>
                <style>
                    body { margin: 0; padding: 0; background: #f0f0f0; }
                    #map { position: absolute; top: 0; bottom: 0; width: 100%; background: #f0f0f0; }
                    .custom-marker { font-size: 24px; }
                    .leaflet-tile { background: #f0f0f0; }
                    .leaflet-tile-pane { background: #f0f0f0; }
                    @keyframes pulse {
                        0%, 100% { transform: scale(1); opacity: 1; }
                        50% { transform: scale(1.2); opacity: 0.8; }
                    }
                    .pulse-drone {
                        animation: pulse 1.5s infinite;
                    }
                </style>
            </head>
            <body>
                <div id="map"><\/div>
                <script>
                    let map, droneMarker, dronePolyline, pickupGPS, dropoffGPS;

                    function initMap() {
                        try {
                            pickupGPS = { lat: ${pickupGPS.lat}, lng: ${pickupGPS.lng} };
                            dropoffGPS = { lat: ${dropoffGPS.lat}, lng: ${dropoffGPS.lng} };
                            ${droneGPS ? `const initialDroneGPS = { lat: ${droneGPS.lat}, lng: ${droneGPS.lng} };` : `const initialDroneGPS = null;`}

                            // Initialize map
                            map = L.map('map').setView([pickupGPS.lat, pickupGPS.lng], 13);
                            
                            // Add tile layer - try OpenStreetMap first
                            const osmTileLayer = L.tileLayer('https:\/\/{s}.tile.openstreetmap.org\/{z}\/{x}\/{y}.png', {
                                attribution: '© OpenStreetMap contributors',
                                maxZoom: 19,
                                errorTileUrl: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPHN2ZyB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgZmlsbD0iI2VhZWFlYSIvPgo8L3N2Zz4=',
                                crossOrigin: true
                            });
                            osmTileLayer.addTo(map);

                            // Add drag background
                            map.on('tileerror', function(error) {
                                console.warn('[MAP] Tile loading error, continuing anyway');
                            });

                            // Restaurant marker
                            L.marker([pickupGPS.lat, pickupGPS.lng], {
                                icon: L.divIcon({
                                    html: '${restaurantMarkerHtml}',
                                    iconSize: [40, 40],
                                    className: 'custom-marker'
                                })
                            }).bindPopup('${order.restaurant_name || 'Restaurant'}<br\/><small>Pickup Location<\/small>').addTo(map);

                            // Delivery marker
                            L.marker([dropoffGPS.lat, dropoffGPS.lng], {
                                icon: L.divIcon({
                                    html: '${homeMarkerHtml}',
                                    iconSize: [40, 40],
                                    className: 'custom-marker'
                                })
                            }).bindPopup('${order.customer?.address || 'Delivery Location'}<br\/><small>Your Location<\/small>').addTo(map);

                            // Route line
                            L.polyline(
                                [[pickupGPS.lat, pickupGPS.lng], [dropoffGPS.lat, dropoffGPS.lng]],
                                { color: '#FF6B35', weight: 3, dashArray: '5, 5', opacity: 0.8 }
                            ).addTo(map);

                            // Initial drone marker and route
                            if (initialDroneGPS) {
                                droneMarker = L.marker([initialDroneGPS.lat, initialDroneGPS.lng], {
                                    icon: L.divIcon({
                                        html: '<div class="pulse-drone">${droneMarkerHtml}<\/div>',
                                        iconSize: [40, 40],
                                        className: 'custom-marker'
                                    })
                                }).bindPopup('${order.drone_id || 'Drone'}<br\/><small>Current Position<\/small>').addTo(map);

                                dronePolyline = L.polyline(
                                    [[initialDroneGPS.lat, initialDroneGPS.lng], [dropoffGPS.lat, dropoffGPS.lng]],
                                    { color: '#1976d2', weight: 2, opacity: 0.8 }
                                ).addTo(map);
                            }

                            // Fit bounds
                            const bounds = L.latLngBounds([
                                [pickupGPS.lat, pickupGPS.lng],
                                [dropoffGPS.lat, dropoffGPS.lng]
                                ${droneGPS ? `, [initialDroneGPS.lat, initialDroneGPS.lng]` : ''}
                            ]);
                            map.fitBounds(bounds, { padding: [50, 50] });
                            
                            console.log('[MAP] Map initialized successfully');
                        } catch (error) {
                            console.error('[MAP] Error initializing map:', error);
                            document.body.innerHTML = '<div style="padding:20px;color:red;">Map Error: ' + error.message + '</div>';
                        }
                    }

                    // Exposed function to update drone position in real-time
                    window.updateDronePosition = function(lat, lng) {
                        if (!droneMarker || !map) return;
                        
                        const newLatLng = L.latLng(lat, lng);
                        droneMarker.setLatLng(newLatLng);
                        
                        if (dronePolyline) {
                            dronePolyline.setLatLngs([[lat, lng], [dropoffGPS.lat, dropoffGPS.lng]]);
                        }

                        console.log('Drone position updated to:', lat, lng);
                    };

                    initMap();
                <\/script>
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

        if (order.current_gps && isDelivering) {
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
                <Text style={styles.sectionTitle}>Delivery Route</Text>
                <View style={styles.legendContainer}>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendIcon, { backgroundColor: '#FF6B35' }]}>
                            <MaterialIcons name="restaurant" size={14} color="#fff" />
                        </View>
                        <View style={styles.legendText}>
                            <Text style={styles.legendLabel}>Restaurant</Text>
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
                            <Text style={styles.legendLabel}>Delivery</Text>
                            <Text style={styles.legendValue} numberOfLines={1}>
                                {order.customer?.address || 'Your Location'}
                            </Text>
                        </View>
                    </View>
                    {order.drone_id && (
                        <View style={styles.legendItem}>
                            <View style={[styles.legendIcon, { backgroundColor: '#1976d2' }]}>
                                <MaterialIcons name="local-shipping" size={14} color="#fff" />
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
                        onLoadEnd={() => setMapLoading(false)}
                        onError={(error) => {
                            console.error('[MapSection] WebView Error:', error);
                            setMapLoading(false);
                        }}
                        onMessage={(event) => {
                            console.log('[MapSection] WebView Message:', event.nativeEvent.data);
                        }}
                        javaScriptEnabled={true}
                        domStorageEnabled={true}
                        useWebKit={true}
                        startInLoadingState={true}
                        mixedContentMode="always"
                        allowUniversalAccessFromFileURLs={true}
                        allowFileAccess={true}
                    />
                    {mapLoading && (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#FF6B35" />
                            <Text style={styles.loadingText}>Loading map...</Text>
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
                            <Text style={styles.viewMapButtonText}>View on Map</Text>
                        </TouchableOpacity>
                    )}
                </View>
                <Text style={styles.mapNote}>
                    {isDelivering
                        ? 'Real-time tracking during delivery'
                        : order?.status === 'arrived'
                            ? 'Delivery drone has arrived at destination'
                            : order?.status === 'delivered'
                                ? 'Order has been delivered'
                                : 'Map view available when delivery starts'}
                </Text>
            </View>

            {/* Distance Information */}
            {isDelivering && order.current_gps && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Delivery Progress</Text>
                    <View style={styles.progressCard}>
                        <View style={styles.progressRow}>
                            <Text style={styles.progressLabel}>Total Distance</Text>
                            <Text style={styles.progressValue}>
                                {deliveryDistance.toFixed(2)} km
                            </Text>
                        </View>
                        <View style={styles.progressRow}>
                            <Text style={styles.progressLabel}>Remaining Distance</Text>
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
