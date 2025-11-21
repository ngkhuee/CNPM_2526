import React, { useEffect, useRef, useState } from 'react';
import './DroneTrackingMap.css';

/**
 * DroneTrackingMap Component
 * Displays a map with restaurant location (pickup), delivery location (dropoff), 
 * and drone current position
 * Uses Leaflet for map rendering
 */
export const DroneTrackingMap = ({
    restaurantLocation, // {lat, lng, name}
    deliveryLocation,   // {lat, lng, address}
    droneLocation,      // {lat, lng, id}
    droneId,            // Drone identifier
    isDelivering,       // Boolean - whether drone is actively delivering
}) => {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const markers = useRef({ restaurant: null, delivery: null, drone: null });
    const polylines = useRef({ route: null, droneRoute: null });
    const [mapLoaded, setMapLoaded] = useState(false);
    const [error, setError] = useState(null);

    // Normalize GPS coordinates
    const normalizeGPS = (gps) => {
        if (!gps) return null;
        return {
            lat: gps.lat || gps.latitude || 10.776,
            lng: gps.lng || gps.longitude || 106.7,
        };
    };

    // Initialize Leaflet map
    useEffect(() => {
        // Check if Leaflet is available
        if (typeof window !== 'undefined' && !window.L) {
            // Load Leaflet CSS
            const leafletCss = document.createElement('link');
            leafletCss.rel = 'stylesheet';
            leafletCss.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
            document.head.appendChild(leafletCss);

            // Load Leaflet JS
            const leafletScript = document.createElement('script');
            leafletScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
            leafletScript.onload = () => {
                setMapLoaded(true);
            };
            leafletScript.onerror = () => {
                setError('Failed to load map library');
            };
            document.body.appendChild(leafletScript);
        } else if (window.L) {
            setMapLoaded(true);
        }
    }, []);

    // Initialize map once Leaflet is ready
    useEffect(() => {
        if (!mapLoaded || !mapContainer.current) return;
        if (map.current) return; // Already initialized

        try {
            const restaurant = normalizeGPS(restaurantLocation);
            const delivery = normalizeGPS(deliveryLocation);

            if (!restaurant || !delivery) {
                setError('Missing location data');
                return;
            }

            // Create map
            map.current = window.L.map(mapContainer.current).setView([restaurant.lat, restaurant.lng], 13);

            // Add OpenStreetMap tile layer
            window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 19,
            }).addTo(map.current);

            // Add restaurant marker (orange/red - pickup)
            const restaurantMarkerHtml = `
        <div class="map-marker restaurant-marker">
          <div class="marker-icon">[REST]</div>
          <div class="marker-popup">
            <strong>${restaurantLocation.name || 'Restaurant'}</strong>
            <small>Pickup Location</small>
          </div>
        </div>
      `;

            markers.current.restaurant = window.L.marker([restaurant.lat, restaurant.lng], {
                icon: window.L.divIcon({
                    html: restaurantMarkerHtml,
                    iconSize: [40, 40],
                    className: 'custom-marker',
                    popupAnchor: [0, -10],
                }),
            }).addTo(map.current)
                .bindPopup(`<b>${restaurantLocation.name || 'Restaurant'}</b><br/>Pickup Location`);

            // Add delivery marker (green - dropoff)
            const deliveryMarkerHtml = `
        <div class="map-marker delivery-marker">
          <div class="marker-icon">[DEST]</div>
          <div class="marker-popup">
            <strong>Delivery</strong>
            <small>${deliveryLocation.address || 'Delivery Location'}</small>
          </div>
        </div>
      `;

            markers.current.delivery = window.L.marker([delivery.lat, delivery.lng], {
                icon: window.L.divIcon({
                    html: deliveryMarkerHtml,
                    iconSize: [40, 40],
                    className: 'custom-marker',
                    popupAnchor: [0, -10],
                }),
            }).addTo(map.current)
                .bindPopup(`<b>Delivery Location</b><br/>${deliveryLocation.address || 'Your address'}`);

            // Add route line (restaurant to delivery)
            polylines.current.route = window.L.polyline(
                [[restaurant.lat, restaurant.lng], [delivery.lat, delivery.lng]],
                { color: '#ff6b35', weight: 3, opacity: 0.5, dashArray: '5, 5' }
            ).addTo(map.current);

            // Fit map to show both markers
            const group = new window.L.featureGroup([markers.current.restaurant, markers.current.delivery]);
            map.current.fitBounds(group.getBounds(), { padding: [50, 50] });

            setError(null);
        } catch (err) {
            console.error('Map initialization error:', err);
            setError('Error initializing map');
        }
    }, [mapLoaded, restaurantLocation, deliveryLocation]);

    // Update drone marker when drone location changes
    useEffect(() => {
        if (!map.current || !window.L) return;

        const drone = normalizeGPS(droneLocation);

        if (drone && isDelivering) {
            if (markers.current.drone) {
                markers.current.drone.setLatLng([drone.lat, drone.lng]);
            } else {
                // Create drone marker for the first time
                const droneMarkerHtml = `
          <div class="map-marker drone-marker pulse">
            <div class="marker-icon">✈</div>
            <div class="marker-popup">
              <strong>${droneId || 'Drone'}</strong>
              <small>In Transit</small>
            </div>
          </div>
        `;

                markers.current.drone = window.L.marker([drone.lat, drone.lng], {
                    icon: window.L.divIcon({
                        html: droneMarkerHtml,
                        iconSize: [40, 40],
                        className: 'custom-marker',
                        popupAnchor: [0, -10],
                    }),
                }).addTo(map.current)
                    .bindPopup(`<b>${droneId || 'Drone'}</b><br/>Current Position`);
            }

            // Update drone route line
            const restaurant = normalizeGPS(restaurantLocation);
            const delivery = normalizeGPS(deliveryLocation);

            if (polylines.current.droneRoute) {
                polylines.current.droneRoute.setLatLngs([[drone.lat, drone.lng], [delivery.lat, delivery.lng]]);
            } else {
                polylines.current.droneRoute = window.L.polyline(
                    [[drone.lat, drone.lng], [delivery.lat, delivery.lng]],
                    { color: '#2196f3', weight: 2, opacity: 0.8 }
                ).addTo(map.current);
            }
        } else if (markers.current.drone) {
            // Remove drone marker if not delivering
            map.current.removeLayer(markers.current.drone);
            markers.current.drone = null;

            if (polylines.current.droneRoute) {
                map.current.removeLayer(polylines.current.droneRoute);
                polylines.current.droneRoute = null;
            }
        }
    }, [droneLocation, isDelivering, droneId, restaurantLocation, deliveryLocation]);

    if (error) {
        return (
            <div className="drone-tracking-map-error">
                <p>[ERROR] {error}</p>
            </div>
        );
    }

    return (
        <div className="drone-tracking-map-container">
            <div ref={mapContainer} className="drone-tracking-map" />
            <div className="map-legend">
                <div className="legend-item">
                    <span className="legend-icon">[REST]</span>
                    <span>Restaurant (Pickup)</span>
                </div>
                <div className="legend-item">
                    <span className="legend-icon">[DEST]</span>
                    <span>Delivery Location</span>
                </div>
                {isDelivering && (
                    <div className="legend-item">
                        <span className="legend-icon pulse-icon">[DRONE]</span>
                        <span>Drone in Transit</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DroneTrackingMap;
