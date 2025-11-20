import React from "react";
import { Modal } from "shared-ui";

const DroneForm = ({
    isOpen,
    onClose,
    editingDrone,
    formData,
    onFormChange,
    onGeocodeAddress,
    geocoding,
    onSave,
}) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={editingDrone ? "Edit Drone" : "Add Drone"}
        >
            <div className="drone-form">
                <div className="form-group">
                    <label htmlFor="drone-name">Drone Name *</label>
                    <input
                        id="drone-name"
                        className="form-input"
                        placeholder="Enter drone identifier (e.g., DRONE-001)"
                        value={formData?.identifier || ""}
                        onChange={(e) =>
                            onFormChange({
                                ...formData,
                                identifier: e.target.value,
                            })
                        }
                    />
                </div>

                {!editingDrone && (
                    <>
                        <div className="form-group">
                            <label htmlFor="drone-address">Location Address</label>
                            <div style={{ display: "flex", gap: "8px" }}>
                                <input
                                    id="drone-address"
                                    className="form-input"
                                    placeholder="Enter address (e.g., Warehouse HCM)"
                                    value={formData?.address || ""}
                                    onChange={(e) =>
                                        onFormChange({
                                            ...formData,
                                            address: e.target.value,
                                        })
                                    }
                                />
                                <button
                                    onClick={onGeocodeAddress}
                                    disabled={geocoding}
                                    className="btn-secondary"
                                    style={{ minWidth: "120px" }}
                                >
                                    {geocoding ? "Geocoding..." : "Search"}
                                </button>
                            </div>
                        </div>

                        <div style={{ display: "flex", gap: "16px" }}>
                            <div className="form-group" style={{ flex: 1 }}>
                                <label htmlFor="drone-lat">Latitude</label>
                                <input
                                    id="drone-lat"
                                    className="form-input"
                                    placeholder="Latitude"
                                    value={formData?.latitude || ""}
                                    onChange={(e) =>
                                        onFormChange({
                                            ...formData,
                                            latitude: e.target.value,
                                        })
                                    }
                                    disabled={geocoding}
                                />
                            </div>
                            <div className="form-group" style={{ flex: 1 }}>
                                <label htmlFor="drone-lng">Longitude</label>
                                <input
                                    id="drone-lng"
                                    className="form-input"
                                    placeholder="Longitude"
                                    value={formData?.longitude || ""}
                                    onChange={(e) =>
                                        onFormChange({
                                            ...formData,
                                            longitude: e.target.value,
                                        })
                                    }
                                    disabled={geocoding}
                                />
                            </div>
                        </div>
                    </>
                )}

                <div className="form-actions">
                    <button onClick={onSave} className="btn-primary">
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                            <polyline points="17 21 17 13 7 13 7 21" />
                            <polyline points="7 3 7 8 15 8" />
                        </svg>
                        Save
                    </button>
                    <button
                        onClick={onClose}
                        className="btn-default"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default DroneForm;
