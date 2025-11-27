import React, { useState, useEffect, useMemo } from "react";
import { useUserManagement } from "../../hooks/useUserManagement";
import { Pagination } from "shared-ui";
import UserTable from "./UserTable";
import UserFilter from "./UserFilter";
import "./Users.css";

const Users = () => {
  const {
    users,
    loading,
    filter,
    setFilter,
    getFilteredUsers,
    getFilteredCount,
    handleStatusToggle,
    handleDelete,
    getRoleBadgeClass,
  } = useUserManagement();

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleToggle = async (userId, currentStatus) => {
    const result = await handleStatusToggle(userId, currentStatus);
    if (result.success) {
      alert(
        `${result.newStatus === "active" ? "Kích hoạt" : "Khóa"} người dùng thành công!`
      );
    } else {
      alert("Không thể cập nhật trạng thái người dùng");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa người dùng này?")) {
      const result = await handleDelete(userId);
      if (result.success) {
        alert("Đã xóa người dùng thành công!");
      } else {
        alert("Không thể xóa người dùng");
      }
    }
  };

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  if (loading) {
    return <div className="users-page">Đang tải...</div>;
  }

  const filteredUsers = getFilteredUsers();
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIdx, startIdx + itemsPerPage);

  return (
    <div className="users-page">
      <div className="users-header">
        <h2>Quản lý Khách hàng</h2>
        <UserFilter
          filter={filter}
          onFilterChange={setFilter}
          getFilteredCount={getFilteredCount}
        />
      </div>

      <UserTable
        users={paginatedUsers}
        onStatusToggle={handleToggle}
        onDelete={handleDeleteUser}
        getRoleBadgeClass={getRoleBadgeClass}
      />

      {filteredUsers.length === 0 && (
        <div className="no-data">Không tìm thấy người dùng</div>
      )}

      {filteredUsers.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
};

export default Users;
