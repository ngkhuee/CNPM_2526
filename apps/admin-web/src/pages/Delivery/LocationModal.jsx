import React from "react";
import { Modal } from "shared-ui";

const LocationModal = ({ isOpen, onClose, locationCoords }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Drone Location"
      width="700px"
    >
      <div className="location-modal">
        {locationCoords ? (
          <>
            <div className="location-info-card">
              <div className="info-row">
                <span className="info-label">Latitude:</span>
                <span className="info-value">{locationCoords.lat}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Longitude:</span>
                <span className="info-value">{locationCoords.lng}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Last Updated:</span>
                <span className="info-value">
                  {new Date().toLocaleString()}
                </span>
              </div>
            </div>

            <div className="map-container">
              <iframe
                title="Drone Location Map"
                width="100%"
                height="400"
                frameBorder="0"
                scrolling="no"
                marginHeight="0"
                marginWidth="0"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${locationCoords.lng - 0.01},${locationCoords.lat - 0.01},${locationCoords.lng + 0.01},${locationCoords.lat + 0.01}&layer=mapnik&marker=${locationCoords.lat},${locationCoords.lng}`}
                style={{ border: "1px solid #ccc", borderRadius: 8 }}
              />
              <div style={{ marginTop: 8, textAlign: "center" }}>
                <a
                  href={`https://www.openstreetmap.org/?mlat=${locationCoords.lat}&mlon=${locationCoords.lng}#map=15/${locationCoords.lat}/${locationCoords.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: "#ff6b35",
                    textDecoration: "none",
                    fontSize: 14,
                  }}
                >
                  View on OpenStreetMap →
                </a>
              </div>
            </div>
          </>
        ) : (
          <p>No location data available</p>
        )}
      </div>
    </Modal>
  );
};

export default LocationModal;
