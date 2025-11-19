import React, { useState } from "react";
import { OrderDetailModal } from "shared-ui";
import { useOrderManagement } from "../../hooks/useOrderManagement";
import OrderFilter from "./OrderFilter";
import OrderTable from "./OrderTable";
import "./Orders.css";

const Orders = () => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [searchId, setSearchId] = useState("");

  const {
    orders,
    loading,
    filter,
    setFilter,
    refreshing,
    handleManualRefresh,
    getStatusBadgeClass,
    getFilteredOrders,
    getStatusCount,
  } = useOrderManagement();

  const handleOrderSelect = (order) => {
    setSelectedOrder(order);
    setDetailOpen(true);
  };

  if (loading) {
    return <div className="orders-page">Loading...</div>;
  }

  const filteredOrders = getFilteredOrders().filter((order) => {
    if (!searchId) return true;
    return order.id.toString().includes(searchId);
  });

  return (
    <div className="orders-page">
      <OrderFilter
        filter={filter}
        onFilterChange={setFilter}
        getStatusCount={getStatusCount}
        onRefresh={handleManualRefresh}
        refreshing={refreshing}
        searchId={searchId}
        onSearchChange={setSearchId}
      />

      <OrderTable
        orders={filteredOrders}
        onOrderSelect={handleOrderSelect}
        getStatusBadgeClass={getStatusBadgeClass}
      />

      {filteredOrders.length === 0 && (
        <div className="no-data">No orders found</div>
      )}

      <OrderDetailModal
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
        order={selectedOrder}
      />
    </div>
  );
};

export default Orders;
