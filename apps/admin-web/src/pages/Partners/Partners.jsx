import React, { useState } from "react";
import { useRestaurantManagement } from "../../hooks/useRestaurantManagement";
import { useRestaurantApproval } from "../../hooks/useRestaurantApproval";
import PendingPartnerTable from "./PendingPartnerTable";
import ActivePartnerTable from "./ActivePartnerTable";
import BlockedPartnerTable from "./BlockedPartnerTable";
import PendingRestaurantModal from "./PendingRestaurantModal";
import "./Partners.css";
import { MdRefresh, MdNotifications, MdCheckCircle, MdBlock } from "react-icons/md";

const Partners = () => {
  const { restaurants, loading, refresh } = useRestaurantManagement();
  const { handleApprove, handleBlock, handleUnblock, handleDelete } =
    useRestaurantApproval(refresh);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPendingRestaurant, setSelectedPendingRestaurant] = useState(null);  // Filter function by search term
  const filterBySearch = (restaurantList) => {
    if (!searchTerm.trim()) return restaurantList;

    const term = searchTerm.toLowerCase().trim();
    return restaurantList.filter((r) => {
      const id = (r.id || "").toString().toLowerCase();
      const name = (r.name || "").toLowerCase();
      const email = (r.email || r.ownerEmail || "").toLowerCase();
      return id.includes(term) || name.includes(term) || email.includes(term);
    });
  };

  // Split restaurants by status and apply search filter
  const pendingRestaurants = filterBySearch(restaurants.filter((r) => r.status === "pending"));
  const activeRestaurants = filterBySearch(restaurants.filter((r) => r.status === "active"));
  const blockedRestaurants = filterBySearch(restaurants.filter((r) => r.status === "blocked"));

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
    const restaurant = restaurants.find((r) => r.id === id);
    const result = await handleBlock(id, restaurant);

    if (result.success) {
      if (result.cancelledOrders > 0) {
        alert(
          `Da khoa nha hang thanh cong!\n\n` +
          `${result.cancelledOrders} don hang da bi huy va se duoc hoan tien.`
        );
      } else {
        alert("Da khoa nha hang thanh cong!");
      }
    } else if (result.code === 'CRITICAL_ORDERS_EXIST') {
      alert(result.message);
    } else if (!result.cancelled) {
      alert("Loi: " + result.message);
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
    const restaurant = restaurants.find((r) => r.id === id);

    // Step 1: Warning
    if (!window.confirm(
      `XOA NHA HANG: ${restaurant.name}\n\n` +
      `Hanh dong nay se:\n` +
      `- Danh dau nha hang la "da xoa" (soft delete)\n` +
      `- Vo hieu hoa tat ca mon an\n` +
      `- Chan tai khoan owner\n` +
      `- Luu lai lich su orders (khong xoa)\n\n` +
      `Luu y: Neu co don hang dang xu ly, KHONG THE xoa!\n\n` +
      `Tiep tuc?`
    )) {
      return;
    }

    // Step 2: Type DELETE confirmation
    const typed = window.prompt(`De xac nhan, hay nhap chinh xac: DELETE`);

    if (typed !== "DELETE") {
      alert("Da huy thao tac");
      return;
    }

    // Step 3: Execute delete
    const result = await handleDelete(id);

    if (result.success) {
      alert(
        `Da xoa nha hang thanh cong!\n\n` +
        `Mon an bi vo hieu: ${result.affected?.menus || 0}\n` +
        `Orders duoc giu lai: ${result.affected?.orders || 0}`
      );
    } else {
      if (result.message.includes('don hang dang xu ly') || result.code === 'ACTIVE_ORDERS_EXIST') {
        alert(
          `KHONG THE XOA\n\n` +
          `Nha hang co don hang dang xu ly.\n` +
          `Vui long:\n` +
          `1. Doi cac don hoan thanh\n` +
          `2. Hoac KHOA nha hang truoc (se tu dong huy don)\n` +
          `3. Sau do moi xoa\n\n` +
          `Chi tiet: ${result.message}`
        );
      } else {
        alert(`Loi: ${result.message}`);
      }
    }
  };

  return (
    <div className="partners-page">
      <div className="partners-header">
        <h2>Quản lý Nhà hàng</h2>
        <div className="header-actions">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Tìm kiếm theo ID, tên hoặc email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="clear-search"
                title="Xóa tìm kiếm"
              >
                ✕
              </button>
            )}
          </div>
          <button onClick={refresh} disabled={loading} className="btn-refresh">
            <MdRefresh /> {loading ? "Đang tải..." : "Làm mới"}
          </button>
        </div>
      </div>

      {/* PENDING RESTAURANTS - Only show if has results */}
      {pendingRestaurants.length > 0 && (
        <div className="section pending-section">
          <h3 className="section-title">
            <MdNotifications /> Chờ duyệt ({pendingRestaurants.length})
          </h3>
          <PendingPartnerTable
            restaurants={pendingRestaurants}
            onApprove={handleApproveClick}
            onViewDetails={setSelectedPendingRestaurant}
          />
        </div>
      )}

      {/* ACTIVE RESTAURANTS - Only show if has results */}
      {activeRestaurants.length > 0 && (
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
      )}

      {/* BLOCKED RESTAURANTS - Only show if has results */}
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

      {/* Show message when no results found */}
      {searchTerm && pendingRestaurants.length === 0 && activeRestaurants.length === 0 && blockedRestaurants.length === 0 && (
        <div className="no-results">
          <p>Không tìm thấy nhà hàng nào với từ khóa "{searchTerm}"</p>
        </div>
      )}

      {/* Pending Restaurant Details Modal */}
      {selectedPendingRestaurant && (
        <PendingRestaurantModal
          restaurant={selectedPendingRestaurant}
          onClose={() => setSelectedPendingRestaurant(null)}
        />
      )}
    </div>
  );
};

export default Partners;
