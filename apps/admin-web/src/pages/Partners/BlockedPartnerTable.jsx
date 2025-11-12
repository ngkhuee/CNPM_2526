import React from "react";
import { getImageUrl } from "shared-utils";
import { MdVisibility, MdCheckCircle, MdDelete } from "react-icons/md";

const BlockedPartnerTable = ({ restaurants, onViewDetails, onUnblock, onDelete }) => {
    if (restaurants.length === 0) {
        return null;
    }

    return (
        <table className="partners-table">
            <thead>
                <tr>
                    <th>Restaurant</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Blocked Date</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {restaurants.map((r) => (
                    <tr key={r.id} className="blocked-row">
                        <td>
                            <div className="restaurant-info">
                                <img
                                    src={getImageUrl(r.image)}
                                    alt={r.name}
                                    className="partner-img"
                                />
                                <span className="restaurant-name">{r.name}</span>
                            </div>
                        </td>
                        <td>{r.email}</td>
                        <td>{r.phone}</td>
                        <td>{new Date(r.updated_at).toLocaleDateString("vi-VN")}</td>
                        <td>
                            <div className="action-buttons">
                                <button
                                    className="btn-view"
                                    onClick={() => onViewDetails(r)}
                                    title="View Details"
                                >
                                    <MdVisibility />
                                </button>
                                <button
                                    className="btn-unblock"
                                    onClick={() => onUnblock(r.id)}
                                    title="Unblock Restaurant"
                                >
                                    <MdCheckCircle /> Unblock
                                </button>
                                <button
                                    className="btn-delete"
                                    onClick={() => onDelete(r.id)}
                                    title="Delete Restaurant"
                                >
                                    <MdDelete />
                                </button>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default BlockedPartnerTable;
