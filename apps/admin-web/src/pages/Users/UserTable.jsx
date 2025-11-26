import React from "react";

const UserTable = ({ users, onStatusToggle, onDelete, getRoleBadgeClass }) => {
    const getStatusBadgeClass = (status) => {
        return status === "active" ? "status-active" : "status-blocked";
    };

    return (
        <table className="users-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Tên</th>
                    <th>Email</th>
                    <th>Điện thoại</th>
                    <th>Vai trò</th>
                    <th>Trạng thái</th>
                    <th>Ngày tạo</th>
                    <th>Thao tác</th>
                </tr>
            </thead>
            <tbody>
                {users.map((user) => (
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
                                className={`status-badge ${getStatusBadgeClass(user.status || "active")}`}
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
                                        onStatusToggle(user.id, user.status || "active")
                                    }
                                >
                                    {user.status === "active" ? "Khóa" : "Kích hoạt"}
                                </button>
                                {user.role !== "admin" && (
                                    <button
                                        className="btn-delete"
                                        onClick={() => onDelete(user.id)}
                                    >
                                        Xóa
                                    </button>
                                )}
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default UserTable;
