import React from "react";

const CategoryModal = ({
    isOpen,
    isEditing,
    currentCategory,
    loading,
    onSubmit,
    onChange,
    onClose,
}) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h3>{isEditing ? "Edit Category" : "Add New Category"}</h3>
                <form onSubmit={onSubmit}>
                    <label>
                        Name:
                        <input
                            type="text"
                            value={currentCategory.name}
                            onChange={(e) => onChange("name", e.target.value)}
                            required
                        />
                    </label>
                    <label>
                        Description:
                        <textarea
                            value={currentCategory.description}
                            onChange={(e) => onChange("description", e.target.value)}
                        />
                    </label>
                    <label>
                        Status:
                        <select
                            value={currentCategory.status}
                            onChange={(e) => onChange("status", e.target.value)}
                        >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                    </label>
                    <div className="modal-buttons">
                        <button type="submit" className="submit-btn" disabled={loading}>
                            {loading ? (isEditing ? "Saving..." : "Adding...") : isEditing ? "Save" : "Add"}
                        </button>
                        <button
                            type="button"
                            className="cancel-btn"
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

export default CategoryModal;
