import React, { useState } from "react";
import { useRestaurantManagement } from "../../hooks/useRestaurantManagement";
import { useRestaurantApproval } from "../../hooks/useRestaurantApproval";
import PendingPartnerTable from "./PendingPartnerTable";
import ActivePartnerTable from "./ActivePartnerTable";
import BlockedPartnerTable from "./BlockedPartnerTable";
import "./Partners.css";
import { MdRefresh, MdNotifications, MdCheckCircle, MdBlock } from "react-icons/md";

const Partners = () => {
  const { restaurants, loading, refresh } = useRestaurantManagement();
  const { handleApprove, handleBlock, handleUnblock, handleDelete } =
    useRestaurantApproval(refresh);

  // Split restaurants by status
  const pendingRestaurants = restaurants.filter((r) => r.status === "pending");
  const activeRestaurants = restaurants.filter((r) => r.status === "active");
  const blockedRestaurants = restaurants.filter((r) => r.status === "blocked");

  const handleApproveClick = async (id) => {
    if (
      window.confirm(
        "Phê duyệt nhà hàng này? Họ sẽ có thể bắt đầu hoạt động."
      )
    ) {
      const restaurant = restaurants.find((r) => r.id === id);
      const result = await handleApprove(id, restaurant);
      if (result.success) {
        alert(
          "Phê duyệt nhà hàng thành công! Họ có thể đăng nhập và bắt đầu nhận đơn hàng."
        );
      } else {
        alert("Lỗi: " + result.message);
      }
    }
  };

  const handleBlockClick = async (id) => {
    if (
      window.confirm(
        "Khóa nhà hàng này? Họ sẽ không thể đăng nhập hoặc nhận đơn hàng."
      )
    ) {
      const restaurant = restaurants.find((r) => r.id === id);
      const result = await handleBlock(id, restaurant);
      if (result.success) {
        alert("Đã khóa nhà hàng thành công!");
      } else {
        alert("Lỗi: " + result.message);
      }
    }
  };

  const handleUnblockClick = async (id) => {
    if (
      window.confirm(
        "Mở khóa nhà hàng này? Họ sẽ có thể đăng nhập và nhận đơn hàng lại."
      )
    ) {
      const restaurant = restaurants.find((r) => r.id === id);
      const result = await handleUnblock(id, restaurant);
      if (result.success) {
        alert("Đã mở khóa nhà hàng thành công!");
      } else {
        alert("Lỗi: " + result.message);
      }
    }
  };

  const handleDeleteClick = async (id) => {
    if (
      window.confirm(
        "XÓA VĨNH VIỄN nhà hàng này?\n\nHành động này sẽ:\n- Xóa tài khoản nhà hàng\n- Xóa tất cả món ăn\n- Hủy các đơn hàng đang chờ\n\nHành động này KHÔNG THỂ hoàn tác!"
      )
    ) {
      const secondConfirm = window.prompt(
        'Nhập "DELETE" để xác nhận xóa vĩnh viễn:'
      );
      if (secondConfirm === "DELETE") {
        const result = await handleDelete(id);
        if (result.success) {
          alert("Đã xóa vĩnh viễn nhà hàng!");
        } else {
          alert("Lỗi: " + result.message);
        }
      }
    }
  };

  return (
    <div className="partners-page">
      <div className="partners-header">
        <h2>Quản lý Nhà hàng</h2>
        <button onClick={refresh} disabled={loading} className="btn-refresh">
          <MdRefresh /> {loading ? "Đang tải..." : "Làm mới"}
        </button>
      </div>

      {/* PENDING RESTAURANTS */}
      <div className="section pending-section">
        <h3 className="section-title">
          <MdNotifications /> Chờ duyệt ({pendingRestaurants.length})
        </h3>
        <PendingPartnerTable
          restaurants={pendingRestaurants}
          onApprove={handleApproveClick}
        />
      </div>

      {/* ACTIVE RESTAURANTS */}
      <div className="section active-section">
        <h3 className="section-title">
          <MdCheckCircle /> Nhà hàng hoạt động ({activeRestaurants.length})
        </h3>
        <ActivePartnerTable
          restaurants={activeRestaurants}
          onBlock={handleBlockClick}
          onDelete={handleDeleteClick}
        />
      </div>

      {/* BLOCKED RESTAURANTS */}
      {blockedRestaurants.length > 0 && (
        <div className="section blocked-section">
          <h3 className="section-title">
            <MdBlock /> Nhà hàng bị khóa ({blockedRestaurants.length})
          </h3>
          <BlockedPartnerTable
            restaurants={blockedRestaurants}
            onUnblock={handleUnblockClick}
            onDelete={handleDeleteClick}
          />
        </div>
      )}
    </div>
  );
};

export default Partners;
