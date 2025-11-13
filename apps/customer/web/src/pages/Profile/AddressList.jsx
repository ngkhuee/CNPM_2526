import React from "react";
import { MdDelete, MdLocationOn, MdCheckCircle } from "react-icons/md";
import "./AddressList.css";

const AddressList = ({
    addresses,
    loading,
    onSetDefault,
    onDeleteAddress,
}) => {
    if (addresses.length === 0) {
        return (
            <div className="addresses-empty">
                <MdLocationOn size={48} />
                <p>No addresses yet</p>
                <span>Add your first delivery address to get started</span>
            </div>
        );
    }

    return (
        <div className="addresses-table-container">
            <table className="addresses-table">
                <thead>
                    <tr>
                        <th className="col-number">#</th>
                        <th className="col-address">Address</th>
                        <th className="col-actions">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {addresses.map((addr, index) => (
                        <tr key={addr.id} className={addr.is_default ? "default-row" : ""}>
                            <td className="cell-number">
                                <span className="number-badge">{index + 1}</span>
                            </td>
                            <td className="cell-address">
                                <div className="address-info">
                                    <div className="address-main">
                                        <div className="address-line">{addr.address_line}</div>
                                        <div className="address-detail">
                                            <MdLocationOn size={14} />
                                            {addr.district}, {addr.city}
                                        </div>
                                    </div>
                                    {addr.note && (
                                        <div className="address-note">
                                            <strong>Note:</strong> {addr.note}
                                        </div>
                                    )}
                                    {addr.lat && addr.lng && (
                                        <div className="address-gps">
                                            <MdLocationOn size={12} />
                                            {addr.lat.toFixed(4)}, {addr.lng.toFixed(4)}
                                        </div>
                                    )}
                                    {addr.is_default && (
                                        <span className="default-badge">
                                            <MdCheckCircle size={12} /> Default
                                        </span>
                                    )}
                                </div>
                            </td>
                            <td className="cell-actions">
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
                                        <MdDelete size={16} /> Delete
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
