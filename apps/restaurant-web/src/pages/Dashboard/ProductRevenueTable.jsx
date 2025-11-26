import React from "react";
import { MdShoppingCart } from "react-icons/md";
import { formatCurrency } from "@utils/formatters";

/**
 * ProductRevenueTable - Displays top products by revenue
 * Pure UI component - receives data only
 */
const ProductRevenueTable = ({ data = [], loading = false }) => {
    if (loading) {
        return (
            <div className="product-table-container">
                <div className="table-skeleton">Đang tải sản phẩm...</div>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="product-table-container">
                <div className="table-empty">Chưa có dữ liệu sản phẩm</div>
            </div>
        );
    }

    return (
        <div className="product-table-container">
            <div className="table-header">
                <div className="table-title">
                    <MdShoppingCart /> Top 10 Sản phẩm theo Doanh thu
                </div>
            </div>

            <div className="table-wrapper">
                <table className="product-table">
                    <thead>
                        <tr>
                            <th>Hạng</th>
                            <th>Tên sản phẩm</th>
                            <th>Số lượng bán</th>
                            <th>Doanh thu</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item, index) => (
                            <tr key={item.id || index} className="table-row">
                                <td className="rank-cell">
                                    <span className="rank-badge">{index + 1}</span>
                                </td>
                                <td className="product-name">{item.name}</td>
                                <td className="center-cell">{item.quantity || 0}</td>
                                <td className="revenue-cell">
                                    {formatCurrency(item.revenue || 0)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="table-summary">
                <div className="summary-stat">
                    <span className="stat-label">Tổng sản phẩm:</span>
                    <span className="stat-value">{data.length}</span>
                </div>
                <div className="summary-stat">
                    <div className="stat-label">Tổng doanh thu:</div>
                    <span className="stat-value">
                        {formatCurrency(data.reduce((sum, item) => sum + (item.revenue || 0), 0))}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default ProductRevenueTable;
