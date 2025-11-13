import React from "react";
import { MdAttachMoney, MdShoppingCart } from "react-icons/md";
import { formatCurrency } from "@utils/formatters";

/**
 * ProductRevenueTable - Displays top products by revenue
 * Pure UI component - receives data only
 */
const ProductRevenueTable = ({ data = [], loading = false }) => {
    if (loading) {
        return (
            <div className="product-table-container">
                <div className="table-skeleton">Loading products...</div>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="product-table-container">
                <div className="table-empty">No product data available</div>
            </div>
        );
    }

    return (
        <div className="product-table-container">
            <div className="table-header">
                <div className="table-title">
                    <MdShoppingCart /> Top 10 Products by Revenue
                </div>
            </div>

            <div className="table-wrapper">
                <table className="product-table">
                    <thead>
                        <tr>
                            <th>Rank</th>
                            <th>Product Name</th>
                            <th>Orders</th>
                            <th>Revenue</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item, index) => (
                            <tr key={item.id || index} className="table-row">
                                <td className="rank-cell">
                                    <span className="rank-badge">{index + 1}</span>
                                </td>
                                <td className="product-name">{item.name}</td>
                                <td className="center-cell">{item.count || 0}</td>
                                <td className="revenue-cell">
                                    <MdAttachMoney className="icon" />
                                    {formatCurrency(item.revenue || 0)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="table-summary">
                <div className="summary-stat">
                    <span className="stat-label">Total Products:</span>
                    <span className="stat-value">{data.length}</span>
                </div>
                <div className="summary-stat">
                    <div className="stat-label">Total Revenue:</div>
                    <span className="stat-value">
                        {formatCurrency(data.reduce((sum, item) => sum + (item.revenue || 0), 0))}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default ProductRevenueTable;
