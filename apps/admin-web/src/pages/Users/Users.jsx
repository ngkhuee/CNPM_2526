import React from "react";
import { useUserManagement } from "../../hooks/useUserManagement";
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

  const handleToggle = async (userId, currentStatus) => {
    const result = await handleStatusToggle(userId, currentStatus);
    if (result.success) {
      alert(
        `User ${result.newStatus === "active" ? "activated" : "blocked"} successfully!`
      );
    } else {
      alert("Failed to update user status");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      const result = await handleDelete(userId);
      if (result.success) {
        alert("User deleted successfully!");
      } else {
        alert("Failed to delete user");
      }
    }
  };

  if (loading) {
    return <div className="users-page">Loading...</div>;
  }

  const filteredUsers = getFilteredUsers();

  return (
    <div className="users-page">
      <div className="users-header">
        <h2>Customer Management</h2>
        <UserFilter
          filter={filter}
          onFilterChange={setFilter}
          getFilteredCount={getFilteredCount}
        />
      </div>

      <UserTable
        users={filteredUsers}
        onStatusToggle={handleToggle}
        onDelete={handleDeleteUser}
        getRoleBadgeClass={getRoleBadgeClass}
      />

      {filteredUsers.length === 0 && (
        <div className="no-data">No users found</div>
      )}
    </div>
  );
};

export default Users;
