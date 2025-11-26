import React, { useEffect, useRef, useState } from 'react';
import './DroneTrackingMap.css';

/**
 * DroneTrackingMap Component
 * Displays a map with 3 locations: base depot, restaurant (pickup), delivery (dropoff)
 * Shows drone current position and route between active waypoints
 * Uses Leaflet for map rendering
 */
export const DroneTrackingMap = ({
    restaurantLocation, // {lat, lng, name}
    deliveryLocation,   // {lat, lng, address}
    droneLocation,      // {lat, lng, id}
    droneId,            // Drone identifier
    isDelivering,       // Boolean - whether drone is actively delivering
    droneJourneyStage,  // Journey stage: going_to_restaurant, at_restaurant, going_to_customer, at_customer
    hideBaseLocation = false, // New prop: hide base location marker/route for customer view
}) => {
    const BASE_LOCATION = { lat: 10.7626, lng: 106.682, name: "Base Depot", address: "273 An Dương Vương, Phường Chợ Quán, TP. HCM" };
    const mapContainer = useRef(null);
    const map = useRef(null);
    const markers = useRef({ base: null, restaurant: null, delivery: null, drone: null });
    const polylines = useRef({ baseToRestaurant: null, restaurantToCustomer: null, activeRoute: null });
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
            map.current = window.L.map(mapContainer.current).setView([BASE_LOCATION.lat, BASE_LOCATION.lng], 13);

            // Add OpenStreetMap tile layer
            window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 19,
            }).addTo(map.current);

            // Add base depot marker (blue) - smaller icon with SVG
            // Conditionally add based on hideBaseLocation prop
            if (!hideBaseLocation) {
                const baseMarkerHtml = `
        <div class="map-marker base-marker">
          <div class="marker-icon" style="background: #2196f3; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.4);">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="white"><path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/></svg>
          </div>
        </div>
      `;

                markers.current.base = window.L.marker([BASE_LOCATION.lat, BASE_LOCATION.lng], {
                    icon: window.L.divIcon({
                        html: baseMarkerHtml,
                        iconSize: [24, 24],
                        className: 'custom-marker',
                        popupAnchor: [0, -12],
                    }),
                }).addTo(map.current)
                    .bindPopup(`<b>${BASE_LOCATION.name}</b><br/>${BASE_LOCATION.address}`);
            }

            // Add restaurant marker (orange - pickup) - SVG icon
            const restaurantMarkerHtml = `
        <div class="map-marker restaurant-marker">
          <div class="marker-icon" style="background: #ff9800; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.4);">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="white"><path d="M11 9H9v2h2V9zm4 0h-2v2h2V9zm4-7H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 16h-2v2h-2v-2h-2v2h-2v-2H5v-5h14v5zm0-7H5V5h14v7z"/></svg>
          </div>
        </div>
      `;

            markers.current.restaurant = window.L.marker([restaurant.lat, restaurant.lng], {
                icon: window.L.divIcon({
                    html: restaurantMarkerHtml,
                    iconSize: [28, 28],
                    className: 'custom-marker',
                    popupAnchor: [0, -14],
                }),
            }).addTo(map.current)
                .bindPopup(`<b>${restaurantLocation.name || 'Restaurant'}</b><br/>${restaurantLocation.address || 'Pickup Location'}`);

            // Add delivery marker (green - dropoff) - SVG icon
            const deliveryMarkerHtml = `
        <div class="map-marker delivery-marker">
          <div class="marker-icon" style="background: #4caf50; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.4);">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="white"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
          </div>
        </div>
      `;

            markers.current.delivery = window.L.marker([delivery.lat, delivery.lng], {
                icon: window.L.divIcon({
                    html: deliveryMarkerHtml,
                    iconSize: [28, 28],
                    className: 'custom-marker',
                    popupAnchor: [0, -14],
                }),
            }).addTo(map.current)
                .bindPopup(`<b>Delivery Location</b><br/>${deliveryLocation.address || 'Your address'}`);

            // Add all route lines (more visible)
            // Conditionally add base-to-restaurant route
            if (!hideBaseLocation) {
                polylines.current.baseToRestaurant = window.L.polyline(
                    [[BASE_LOCATION.lat, BASE_LOCATION.lng], [restaurant.lat, restaurant.lng]],
                    { color: '#999', weight: 3, opacity: 0.4, dashArray: '8, 4' }
                ).addTo(map.current);
            }

            polylines.current.restaurantToCustomer = window.L.polyline(
                [[restaurant.lat, restaurant.lng], [delivery.lat, delivery.lng]],
                { color: '#999', weight: 3, opacity: 0.4, dashArray: '8, 4' }
            ).addTo(map.current);

            // Fit map to show markers - include base only if not hidden
            const boundMarkers = hideBaseLocation
                ? [markers.current.restaurant, markers.current.delivery]
                : [markers.current.base, markers.current.restaurant, markers.current.delivery];
            const group = new window.L.featureGroup(boundMarkers.filter(m => m !== null));
            map.current.fitBounds(group.getBounds(), { padding: [50, 50] });

            setError(null);
        } catch (err) {
            console.error('Map initialization error:', err);
            setError('Error initializing map');
        }
    }, [mapLoaded, restaurantLocation, deliveryLocation]);

    // Update drone marker and active route based on journey stage
    useEffect(() => {
        if (!map.current || !window.L) return;

        const drone = normalizeGPS(droneLocation);
        const restaurant = normalizeGPS(restaurantLocation);
        const delivery = normalizeGPS(deliveryLocation);

        if (drone) {
            // Update or create drone marker - SVG custom drone icon with pulse animation
            if (markers.current.drone) {
                markers.current.drone.setLatLng([drone.lat, drone.lng]);
            } else {
                const droneMarkerHtml = `
          <div class="map-marker drone-marker" style="animation: pulse 1.5s infinite;">
            <div class="marker-icon" style="background: #1976d2; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 3px 10px rgba(25,118,210,0.6);">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="24" height="24" fill="none" stroke-width="1.5" stroke="white" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="20" cy="20" r="6" fill="white"/>
                <line x1="20" y1="5" x2="20" y2="1" stroke="white" stroke-width="1.5"/>
                <line x1="20" y1="39" x2="20" y2="35" stroke="white" stroke-width="1.5"/>
                <line x1="5" y1="20" x2="1" y2="20" stroke="white" stroke-width="1.5"/>
                <line x1="35" y1="20" x2="39" y2="20" stroke="white" stroke-width="1.5"/>
                <circle cx="20" cy="4" r="2.5" fill="white"/>
                <circle cx="20" cy="36" r="2.5" fill="white"/>
                <circle cx="4" cy="20" r="2.5" fill="white"/>
                <circle cx="36" cy="20" r="2.5" fill="white"/>
                <line x1="20" y1="20" x2="28" y2="12" stroke="white" stroke-width="1.5" opacity="0.6"/>
                <line x1="20" y1="20" x2="12" y2="28" stroke="white" stroke-width="1.5" opacity="0.6"/>
                <line x1="20" y1="20" x2="28" y2="28" stroke="white" stroke-width="1.5" opacity="0.6"/>
                <line x1="20" y1="20" x2="12" y2="12" stroke="white" stroke-width="1.5" opacity="0.6"/>
                <circle cx="20" cy="20" r="2" fill="white" opacity="0.5"/>
              </svg>
            </div>
          </div>
          <style>
            @keyframes pulse {
              0%, 100% { transform: scale(1); opacity: 1; }
              50% { transform: scale(1.15); opacity: 0.85; }
            }
          </style>
        `;

                markers.current.drone = window.L.marker([drone.lat, drone.lng], {
                    icon: window.L.divIcon({
                        html: droneMarkerHtml,
                        iconSize: [32, 32],
                        className: 'custom-marker',
                        popupAnchor: [0, -16],
                    }),
                }).addTo(map.current)
                    .bindPopup(`<b>${droneId || 'Drone'}</b><br/>Current Position`);
            }

            // Remove old active route if exists
            if (polylines.current.activeRoute) {
                map.current.removeLayer(polylines.current.activeRoute);
                polylines.current.activeRoute = null;
            }

            // Draw active route based on journey stage - thicker and more visible
            // Conditionally show base-related routes based on hideBaseLocation
            if ((droneJourneyStage === 'going_to_restaurant' || droneJourneyStage === 'searching') && !hideBaseLocation) {
                // Show route from base to restaurant through drone
                polylines.current.activeRoute = window.L.polyline(
                    [[BASE_LOCATION.lat, BASE_LOCATION.lng], [drone.lat, drone.lng], [restaurant.lat, restaurant.lng]],
                    { color: '#2196f3', weight: 4, opacity: 0.9 }
                ).addTo(map.current);
            } else if (droneJourneyStage === 'at_restaurant' && !hideBaseLocation) {
                // Drone at restaurant, show completed route from base
                polylines.current.activeRoute = window.L.polyline(
                    [[BASE_LOCATION.lat, BASE_LOCATION.lng], [restaurant.lat, restaurant.lng]],
                    { color: '#4caf50', weight: 4, opacity: 0.9 }
                ).addTo(map.current);
            } else if (droneJourneyStage === 'going_to_customer') {
                // Show route from restaurant to customer through drone
                polylines.current.activeRoute = window.L.polyline(
                    [[restaurant.lat, restaurant.lng], [drone.lat, drone.lng], [delivery.lat, delivery.lng]],
                    { color: '#2196f3', weight: 4, opacity: 0.9 }
                ).addTo(map.current);
            } else if (droneJourneyStage === 'at_customer') {
                // Drone at customer, show completed route from restaurant
                polylines.current.activeRoute = window.L.polyline(
                    [[restaurant.lat, restaurant.lng], [delivery.lat, delivery.lng]],
                    { color: '#4caf50', weight: 4, opacity: 0.9 }
                ).addTo(map.current);
            }
        } else if (markers.current.drone) {
            // Remove drone marker if no location
            map.current.removeLayer(markers.current.drone);
            markers.current.drone = null;

            if (polylines.current.activeRoute) {
                map.current.removeLayer(polylines.current.activeRoute);
                polylines.current.activeRoute = null;
            }
        }
    }, [droneLocation, droneJourneyStage, droneId, restaurantLocation, deliveryLocation]);

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
                {!hideBaseLocation && (
                    <div className="legend-item">
                        <span className="legend-icon" style={{ background: '#2196f3', width: '24px', height: '24px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: '1px solid white' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="white"><path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" /></svg>
                        </span>
                        <span>Base Depot</span>
                    </div>
                )}
                <div className="legend-item">
                    <span className="legend-icon" style={{ background: '#ff9800', width: '24px', height: '24px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: '1px solid white' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="white"><path d="M11 9H9v2h2V9zm4 0h-2v2h2V9zm4-7H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 16h-2v2h-2v-2h-2v2h-2v-2H5v-5h14v5zm0-7H5V5h14v7z" /></svg>
                    </span>
                    <span>Restaurant</span>
                </div>
                <div className="legend-item">
                    <span className="legend-icon" style={{ background: '#4caf50', width: '24px', height: '24px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: '1px solid white' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="white"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" /></svg>
                    </span>
                    <span>Customer</span>
                </div>
                {droneLocation && (
                    <div className="legend-item">
                        <span className="legend-icon" style={{ background: '#1976d2', width: '28px', height: '28px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: '1px solid white' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="16" height="16" fill="none" strokeWidth="1.5" stroke="white" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="20" cy="20" r="6" fill="white" />
                                <line x1="20" y1="5" x2="20" y2="1" stroke="white" strokeWidth="1.5" />
                                <line x1="20" y1="39" x2="20" y2="35" stroke="white" strokeWidth="1.5" />
                                <line x1="5" y1="20" x2="1" y2="20" stroke="white" strokeWidth="1.5" />
                                <line x1="35" y1="20" x2="39" y2="20" stroke="white" strokeWidth="1.5" />
                            </svg>
                        </span>
                        <span>Drone</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DroneTrackingMap;
