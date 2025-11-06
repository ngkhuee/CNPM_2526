import React, { useState, useEffect } from "react";
import { authService } from "shared-services";
import "./Users.css";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, active, blocked

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await authService.getAllUsers();
      // Map db.json fields and ONLY show customer accounts
      const mappedUsers = (response || [])
        .map((user) => {
          // Get role from roles array
          let role = Array.isArray(user.roles) ? user.roles[0] : user.role;

          return {
            ...user,
            name: user.full_name || user.name,
            role: role,
            createdAt: user.created_at || user.createdAt,
          };
        })
        .filter((user) => user.role === "customer"); // Only show customer users

      console.log("Fetched customer users:", mappedUsers); // Debug log
      setUsers(mappedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (userId, currentStatus) => {
    const newStatus = currentStatus === "active" ? "blocked" : "active";
    try {
      await authService.updateUserStatus(userId, newStatus);
      await fetchUsers(); // Refresh list
      alert(
        `User ${newStatus === "active" ? "activated" : "blocked"} successfully!`
      );
    } catch (error) {
      alert("Failed to update user status");
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await authService.deleteUser(userId);
        await fetchUsers(); // Refresh list
        alert("User deleted successfully!");
      } catch (error) {
        alert("Failed to delete user");
      }
    }
  };

  const filteredUsers = users.filter((user) => {
    if (filter === "all") return true;
    if (filter === "active") return user.status === "active" || !user.status;
    if (filter === "blocked") return user.status === "blocked";
    return true;
  });

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case "admin":
        return "badge-admin";
      case "restaurant":
        return "badge-restaurant";
      case "customer":
        return "badge-customer";
      default:
        return "badge-default";
    }
  };

  if (loading) {
    return <div className="users-page">Loading...</div>;
  }

  return (
    <div className="users-page">
      <div className="users-header">
        <h2>Customer Management</h2>
        <div className="users-filter">
          <button
            className={filter === "all" ? "active" : ""}
            onClick={() => setFilter("all")}
          >
            All ({users.length})
          </button>
          <button
            className={filter === "active" ? "active" : ""}
            onClick={() => setFilter("active")}
          >
            Active (
            {users.filter((u) => u.status === "active" || !u.status).length})
          </button>
          <button
            className={filter === "blocked" ? "active" : ""}
            onClick={() => setFilter("blocked")}
          >
            Blocked ({users.filter((u) => u.status === "blocked").length})
          </button>
        </div>
      </div>

      <table className="users-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Role</th>
            <th>Status</th>
            <th>Created At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.phone || "N/A"}</td>
              <td>
                <span className={`role-badge ${getRoleBadgeClass(user.role)}`}>
                  {user.role}
                </span>
              </td>
              <td>
                <span
                  className={`status-badge ${user.status === "active" ? "status-active" : "status-blocked"}`}
                >
                  {user.status || "active"}
                </span>
              </td>
              <td>
                {user.createdAt
                  ? new Date(user.createdAt).toLocaleDateString()
                  : "N/A"}
              </td>
              <td>
                <div className="action-buttons">
                  <button
                    className={
                      user.status === "active" ? "btn-block" : "btn-activate"
                    }
                    onClick={() =>
                      handleStatusToggle(user.id, user.status || "active")
                    }
                  >
                    {user.status === "active" ? "Block" : "Activate"}
                  </button>
                  {user.role !== "admin" && (
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(user.id)}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {filteredUsers.length === 0 && (
        <div className="no-data">No users found</div>
      )}
    </div>
  );
};

export default Users;
