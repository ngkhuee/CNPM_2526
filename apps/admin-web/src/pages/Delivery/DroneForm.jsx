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
            title={editingDrone ? "Sửa Drone" : "Thêm Drone"}
        >
            <div className="drone-form">
                <div className="form-group">
                    <label htmlFor="drone-name">Tên Drone *</label>
                    <input
                        id="drone-name"
                        className="form-input"
                        placeholder="Nhập mã drone (VD: DRONE-001)"
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
                    <div
                        style={{
                            background: "#e3f2fd",
                            border: "1px solid #2196f3",
                            borderRadius: "8px",
                            padding: "12px",
                            marginTop: "8px",
                            fontSize: "14px",
                            color: "#1565c0"
                        }}
                    >
                        <p style={{ margin: 0 }}>
                            <strong>ℹ️ Tự động cấu hình:</strong>
                        </p>
                        <ul style={{ margin: "8px 0 0 20px", padding: 0 }}>
                            <li>Vị trí căn cứ: 273 An Dương Vương, TP. HCM</li>
                            <li>Pin: 100%</li>
                            <li>Trạng thái: Sẵn sàng</li>
                            <li>Tải trọng tối đa: 5kg</li>
                        </ul>
                    </div>
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
                        Lưu
                    </button>
                    <button
                        onClick={onClose}
                        className="btn-default"
                    >
                        Hủy
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default DroneForm;
