import React from "react";
import { getImageUrl } from "shared-utils";
import { MdVisibility, MdBlock, MdDelete } from "react-icons/md";

const ActivePartnerTable = ({ restaurants, onViewDetails, onBlock, onDelete }) => {
    if (restaurants.length === 0) {
        return <div className="empty-state">No active restaurants</div>;
    }

    return (
        <table className="partners-table">
            <thead>
                <tr>
                    <th>Restaurant</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Rating</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {restaurants.map((r) => (
                    <tr key={r.id}>
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
                        <td>
                            <span className="rating">
                                Rating: {r.rating?.toFixed(1) || "N/A"}
                            </span>
                        </td>
                        <td>
                            <span className="status-badge status-active">
                                {r.isOpen ? "Open" : "Closed"}
                            </span>
                        </td>
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
                                    className="btn-block"
                                    onClick={() => onBlock(r.id)}
                                    title="Block Restaurant"
                                >
                                    <MdBlock />
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

export default ActivePartnerTable;
