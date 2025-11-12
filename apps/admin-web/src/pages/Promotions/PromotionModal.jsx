import React from "react";

const PromotionModal = ({
    isOpen,
    isEditing,
    formData,
    onSubmit,
    onChange,
    onClose,
}) => {
    if (!isOpen) return null;

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <h3>{isEditing ? "Edit Promotion" : "Create Promotion"}</h3>
                <form onSubmit={onSubmit}>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Code *</label>
                            <input
                                type="text"
                                value={formData.code}
                                onChange={(e) =>
                                    onChange("code", e.target.value.toUpperCase())
                                }
                                required
                                placeholder="SUMMER2024"
                            />
                        </div>
                        <div className="form-group">
                            <label>Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) => onChange("status", e.target.value)}
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Name *</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => onChange("name", e.target.value)}
                            required
                            placeholder="Summer Sale"
                        />
                    </div>

                    <div className="form-group">
                        <label>Description *</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => onChange("description", e.target.value)}
                            required
                            placeholder="Get discount on all orders"
                            rows={3}
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Type *</label>
                            <select
                                value={formData.type}
                                onChange={(e) => onChange("type", e.target.value)}
                            >
                                <option value="percentage">Percentage (%)</option>
                                <option value="fixed">Fixed Amount (₫)</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Value *</label>
                            <input
                                type="number"
                                value={formData.value}
                                onChange={(e) => onChange("value", e.target.value)}
                                required
                                placeholder={formData.type === "percentage" ? "20" : "50000"}
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Min Order Value</label>
                            <input
                                type="number"
                                value={formData.minOrderValue}
                                onChange={(e) => onChange("minOrderValue", e.target.value)}
                                placeholder="100000"
                            />
                        </div>
                        <div className="form-group">
                            <label>Max Discount</label>
                            <input
                                type="number"
                                value={formData.maxDiscount}
                                onChange={(e) => onChange("maxDiscount", e.target.value)}
                                placeholder="50000"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Start Date *</label>
                            <input
                                type="date"
                                value={formData.startDate}
                                onChange={(e) => onChange("startDate", e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>End Date *</label>
                            <input
                                type="date"
                                value={formData.endDate}
                                onChange={(e) => onChange("endDate", e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Usage Limit</label>
                        <input
                            type="number"
                            value={formData.usageLimit}
                            onChange={(e) => onChange("usageLimit", e.target.value)}
                            placeholder="100"
                        />
                    </div>

                    <div className="modal-actions">
                        <button type="submit" className="btn-save">
                            {isEditing ? "Update" : "Create"}
                        </button>
                        <button
                            type="button"
                            className="btn-cancel"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PromotionModal;
