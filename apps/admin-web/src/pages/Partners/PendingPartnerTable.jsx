import React from "react";
import { getImageUrl } from "shared-utils";
import { MdVisibility, MdCheckCircle } from "react-icons/md";

const PendingPartnerTable = ({ restaurants, onApprove, onViewDetails }) => {
    if (restaurants.length === 0) {
        return <div className="empty-state">Không có nhà hàng chờ duyệt</div>;
    }

    return (
        <table className="partners-table">
            <thead>
                <tr>
                    <th>STT</th>
                    <th>Nhà hàng</th>
                    <th>Email</th>
                    <th>Điện thoại</th>
                    <th>Địa chỉ</th>
                    <th>Ngày đăng ký</th>
                    <th>Thao tác</th>
                </tr>
            </thead>
            <tbody>
                {restaurants.map((r, index) => (
                    <tr key={r.id} className="pending-row">
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
                        <td className="address-cell">{r.address}</td>
                        <td>
                            {(() => {
                                const dateStr = r.created_at || r.createdAt;
                                if (!dateStr) return "N/A";
                                const date = new Date(dateStr);
                                return isNaN(date.getTime()) ? "N/A" : date.toLocaleDateString("vi-VN");
                            })()}
                        </td>
                        <td>
                            <div className="action-buttons">
                                <button
                                    className="btn-view"
                                    onClick={() => onViewDetails(r)}
                                    title="Xem thông tin đăng ký"
                                >
                                    <MdVisibility /> Xem
                                </button>
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
