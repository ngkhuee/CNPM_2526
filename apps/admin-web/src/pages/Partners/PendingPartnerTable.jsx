import React from "react";
import { Link } from "react-router-dom";
import { getImageUrl } from "shared-utils";
import { MdVisibility, MdCheckCircle } from "react-icons/md";

const PendingPartnerTable = ({ restaurants, onApprove }) => {
    if (restaurants.length === 0) {
        return <div className="empty-state">No pending restaurants</div>;
    }

    return (
        <table className="partners-table">
            <thead>
                <tr>
                    <th>Restaurant</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Address</th>
                    <th>Registered</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {restaurants.map((r) => (
                    <tr key={r.id} className="pending-row">
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
                        <td className="address-cell">{r.address}</td>
                        <td>{new Date(r.created_at).toLocaleDateString("vi-VN")}</td>
                        <td>
                            <div className="action-buttons">
                                <Link
                                    to={`/admin/partners/${r.id}`}
                                    className="btn-view"
                                    title="View Details"
                                >
                                    <MdVisibility /> View
                                </Link>
                                <button
                                    className="btn-approve"
                                    onClick={() => onApprove(r.id)}
                                    title="Approve Restaurant"
                                >
                                    <MdCheckCircle /> Approve
                                </button>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default PendingPartnerTable;
