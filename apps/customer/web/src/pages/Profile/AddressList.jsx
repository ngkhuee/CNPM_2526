import React from "react";
import { MdDelete } from "react-icons/md";

const AddressList = ({
    addresses,
    loading,
    onSetDefault,
    onDeleteAddress,
}) => {
    if (addresses.length === 0) {
        return (
            <div className="addresses-list">
                <p className="no-data">No addresses yet</p>
            </div>
        );
    }

    return (
        <div className="addresses-table-container">
            <table className="addresses-table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Address</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {addresses.map((addr, index) => (
                        <tr key={addr.id} className={addr.is_default ? "default-row" : ""}>
                            <td className="index-cell">{index + 1}</td>
                            <td className="address-cell">
                                <div className="address-info">
                                    <div className="address-line">{addr.address_line}</div>
                                    <div className="address-detail">
                                        {addr.district}, {addr.city}
                                    </div>
                                    {addr.lat && addr.lng && (
                                        <div className="address-gps">
                                            📍 {addr.lat.toFixed(4)}, {addr.lng.toFixed(4)}
                                        </div>
                                    )}
                                    {addr.is_default && (
                                        <span className="default-badge">Default</span>
                                    )}
                                </div>
                            </td>
                            <td className="action-cell">
                                <div className="action-buttons">
                                    {!addr.is_default && (
                                        <button
                                            onClick={() => onSetDefault(addr.id)}
                                            disabled={loading}
                                            className="btn-action btn-action-default"
                                        >
                                            Set as Default
                                        </button>
                                    )}
                                    <button
                                        onClick={() => onDeleteAddress(addr.id)}
                                        disabled={loading}
                                        className="btn-action btn-action-delete"
                                        title="Delete"
                                    >
                                        <MdDelete /> Delete
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AddressList;
