import React from "react";
import { Link } from "react-router-dom";
import { getImageUrl } from "shared-utils";
import { MdVisibility, MdCheckCircle } from "react-icons/md";

const PendingPartnerTable = ({ restaurants, onApprove }) => {
    if (restaurants.length === 0) {
        return <div className="empty-state">Không có nhà hàng chờ duyệt</div>;
    }

    return (
        <table className="partners-table">
            <thead>
                <tr>
                    <th>Nhà hàng</th>
                    <th>Email</th>
                    <th>Điện thoại</th>
                    <th>Địa chỉ</th>
                    <th>Ngày đăng ký</th>
                    <th>Thao tác</th>
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
                                    title="Xem chi tiết"
                                >
                                    <MdVisibility /> Xem
                                </Link>
                                <button
                                    className="btn-approve"
                                    onClick={() => onApprove(r.id)}
                                    title="Phê duyệt nhà hàng"
                                >
                                    <MdCheckCircle /> Duyệt
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
