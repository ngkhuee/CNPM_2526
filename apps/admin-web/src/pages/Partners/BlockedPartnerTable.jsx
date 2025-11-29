import React from "react";
import { Link } from "react-router-dom";
import { getImageUrl } from "shared-utils";
import { MdVisibility, MdCheckCircle, MdDelete } from "react-icons/md";

const BlockedPartnerTable = ({ restaurants, onUnblock, onDelete }) => {
    if (restaurants.length === 0) {
        return null;
    }

    return (
        <table className="partners-table">
            <thead>
                <tr>
                    <th>STT</th>
                    <th>Nhà hàng</th>
                    <th>Email</th>
                    <th>Điện thoại</th>
                    <th>Ngày khóa</th>
                    <th>Thao tác</th>
                </tr>
            </thead>
            <tbody>
                {restaurants.map((r, index) => (
                    <tr key={r.id} className="blocked-row">
                        <td>{r.stt || index + 1}</td>
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
                            {(() => {
                                const dateStr = r.updated_at || r.updatedAt || r.blocked_at || r.blockedAt;
                                if (!dateStr) return "N/A";
                                const date = new Date(dateStr);
                                return isNaN(date.getTime()) ? "N/A" : date.toLocaleDateString("vi-VN");
                            })()}
                        </td>
                        <td>
                            <div className="action-buttons">
                                <Link
                                    to={`/admin/partners/${r.id}`}
                                    className="btn-view"
                                    title="Xem chi tiết"
                                >
                                    <MdVisibility />
                                </Link>
                                <button
                                    className="btn-unblock"
                                    onClick={() => onUnblock(r.id)}
                                    title="Mở khóa nhà hàng"
                                >
                                    <MdCheckCircle /> Mở khóa
                                </button>
                                <button
                                    className="btn-delete"
                                    onClick={() => onDelete(r.id)}
                                    title="Xóa nhà hàng"
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
