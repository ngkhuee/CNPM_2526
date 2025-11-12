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
                        value={formData.identifier}
                        onChange={(e) =>
                            onFormChange("identifier", e.target.value)
                        }
                    />
                </div>

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
