import React from "react";

const AccountInfo = ({
    user,
    editing,
    formData,
    loading,
    onInputChange,
    onSaveClick,
    onEditClick,
    onCancelClick,
}) => {
    const validateDOB = (dateString) => {
        const dob = new Date(dateString);
        const today = new Date();
        return dob <= today;
    };

    const handleDOBChange = (value) => {
        if (validateDOB(value)) {
            onInputChange("dob", value);
        } else {
            alert("Date of birth cannot be greater than the current date");
        }
    };

    return (
        <div className="profile-container">
            {/* Sidebar */}
            <div className="profile-sidebar">
                <div className="sidebar-avatar">
                    {user?.avatar ? (
                        <img src={user.avatar} alt="Avatar" />
                    ) : (
                        <div className="avatar-placeholder">
                            {formData.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                    )}
                </div>
                <div className="sidebar-name">{formData.name}</div>
                <button className="sidebar-btn active">
                    Account information
                </button>
                <button className="sidebar-btn">
                    Address
                </button>
            </div>

            {/* Main Content */}
            <div className="profile-content">
                <h2>Account information</h2>
                <div className="profile-form">
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            value={formData.email}
                            disabled
                            className="readonly"
                        />
                    </div>

                    <div className="form-group">
                        <label>Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => onInputChange("name", e.target.value)}
                            disabled={!editing}
                            placeholder="Enter name"
                        />
                        {editing && <div className="checkmark">✓</div>}
                    </div>

                    <div className="form-group">
                        <label>Phone number</label>
                        <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => onInputChange("phone", e.target.value)}
                            disabled={!editing}
                            placeholder="Enter phone number"
                        />
                        {editing && <div className="checkmark">✓</div>}
                    </div>

                    <div className="form-group">
                        <label>Gender</label>
                        <div className="radio-group">
                            <label>
                                <input
                                    type="radio"
                                    value="Male"
                                    checked={formData.gender === "Male"}
                                    onChange={(e) => onInputChange("gender", e.target.value)}
                                    disabled={!editing}
                                />
                                Male
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    value="Female"
                                    checked={formData.gender === "Female"}
                                    onChange={(e) => onInputChange("gender", e.target.value)}
                                    disabled={!editing}
                                />
                                Female
                            </label>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Date of birth</label>
                        <input
                            type="date"
                            value={formData.dob}
                            onChange={(e) => handleDOBChange(e.target.value)}
                            disabled={!editing}
                        />
                        {editing && <div className="checkmark">✓</div>}
                    </div>

                    <div className="profile-actions">
                        {editing ? (
                            <>
                                <button onClick={onSaveClick} disabled={loading} className="btn-primary">
                                    {loading ? "Saving..." : "Update"}
                                </button>
                                <button onClick={onCancelClick} className="btn-secondary">
                                    Cancel
                                </button>
                            </>
                        ) : (
                            <button onClick={onEditClick} className="btn-primary">
                                Edit
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccountInfo;
