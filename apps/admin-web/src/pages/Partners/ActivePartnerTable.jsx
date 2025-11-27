import React from "react";
import { Link } from "react-router-dom";
import { getImageUrl } from "shared-utils";
import { MdVisibility, MdBlock, MdDelete } from "react-icons/md";

const ActivePartnerTable = ({ restaurants, onViewDetails, onBlock, onDelete }) => {
    if (restaurants.length === 0) {
        return <div className="empty-state">Không có nhà hàng hoạt động</div>;
    }

    return (
        <table className="partners-table">
            <thead>
                <tr>
                    <th>STT</th>
                    <th>Nhà hàng</th>
                    <th>Email</th>
                    <th>Điện thoại</th>
                    <th>Đánh giá</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                </tr>
            </thead>
            <tbody>
                {restaurants.map((r, index) => (
                    <tr key={r.id}>
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
                            <span className="rating">
                                Đánh giá: {r.rating?.toFixed(1) || "N/A"}
                            </span>
                        </td>
                        <td>
                            <span className="status-badge status-active">
                                {r.isOpen ? "Mở cửa" : "Đóng cửa"}
                            </span>
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
                                    className="btn-block"
                                    onClick={() => onBlock(r.id)}
                                    title="Khóa nhà hàng"
                                >
                                    <MdBlock />
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

export default ActivePartnerTable;
