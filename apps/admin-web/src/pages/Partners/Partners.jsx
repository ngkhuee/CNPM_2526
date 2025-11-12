import React, { useState, useEffect } from "react";
import { useRestaurantManagement } from "../../hooks/useRestaurantManagement";
import { authService } from "shared-services";
import { getImageUrl } from "@utils/imageHelper";
import "./Partners.css";
import {
  MdCheckCircle,
  MdBlock,
  MdDelete,
  MdVisibility,
  MdRefresh,
  MdNotifications,
  MdWarning,
} from "react-icons/md";

const Partners = () => {
  const { restaurants, loading, updateRestaurant, deleteRestaurant, refresh } =
    useRestaurantManagement();
  const [viewingPartner, setViewingPartner] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Split restaurants by status
  const pendingRestaurants = restaurants.filter((r) => r.status === "pending");
  const activeRestaurants = restaurants.filter((r) => r.status === "active");
  const blockedRestaurants = restaurants.filter((r) => r.status === "blocked");

  const handleViewDetails = (restaurant) => {
    setViewingPartner(restaurant);
    setModalOpen(true);
  };

  const handleApprove = async (id) => {
    if (
      window.confirm(
        "Approve this restaurant? It will be able to start operating."
      )
    ) {
      // Find restaurant to get owner_id
      const restaurant = restaurants.find((r) => r.id === id);

      // Update restaurant status
      const result = await updateRestaurant(id, {
        status: "active",
        isOpen: true,
      });

      if (result.success) {
        // Also update user status if owner_id exists
        if (restaurant?.owner_id) {
          try {
            await authService.updateUserStatus(restaurant.owner_id, "active");
          } catch (err) {
            console.error("Error updating user status:", err);
          }
        }

        alert(
          "Restaurant approved successfully! They can now login and start accepting orders."
        );
        refresh();
      } else {
        alert("Error: " + result.message);
      }
    }
  };

  const handleBlock = async (id) => {
    if (
      window.confirm(
        "Block this restaurant? They won't be able to login or receive orders."
      )
    ) {
      // Find restaurant to get owner_id
      const restaurant = restaurants.find((r) => r.id === id);

      // Update restaurant status
      const result = await updateRestaurant(id, {
        status: "blocked",
        isOpen: false,
      });

      if (result.success) {
        // Also update user status if owner_id exists
        if (restaurant?.owner_id) {
          try {
            await authService.updateUserStatus(restaurant.owner_id, "blocked");
          } catch (err) {
            console.error("Error updating user status:", err);
          }
        }

        alert("Restaurant blocked successfully!");
        refresh();
      } else {
        alert("Error: " + result.message);
      }
    }
  };

  const handleUnblock = async (id) => {
    if (
      window.confirm(
        "Unblock this restaurant? They will be able to login and receive orders again."
      )
    ) {
      // Find restaurant to get owner_id
      const restaurant = restaurants.find((r) => r.id === id);

      // Update restaurant status
      const result = await updateRestaurant(id, {
        status: "active",
        isOpen: true,
      });

      if (result.success) {
        // Also update user status if owner_id exists
        if (restaurant?.owner_id) {
          try {
            await authService.updateUserStatus(restaurant.owner_id, "active");
          } catch (err) {
            console.error("Error updating user status:", err);
          }
        }

        alert("Restaurant unblocked successfully!");
        refresh();
      } else {
        alert("Error: " + result.message);
      }
    }
  };

  const handleDelete = async (id) => {
    if (
      window.confirm(
        "DELETE this restaurant permanently?\n\nThis will:\n- Delete the restaurant account\n- Remove all their menu items\n- Cancel any pending orders\n\nThis action CANNOT be undone!"
      )
    ) {
      const secondConfirm = window.prompt(
        'Type "DELETE" to confirm permanent deletion:'
      );
      if (secondConfirm === "DELETE") {
        const result = await deleteRestaurant(id);
        if (result.success) {
          alert("Restaurant deleted permanently!");
          refresh();
        } else {
          alert("Error: " + result.message);
        }
      }
    }
  };

  return (
    <div className="partners-page">
      <div className="partners-header">
        <h2>Restaurant Management</h2>
        <button onClick={refresh} disabled={loading} className="btn-refresh">
          <MdRefresh /> {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {/* PENDING RESTAURANTS - Need Approval */}
      <div className="section pending-section">
        <h3 className="section-title">
          <MdNotifications /> Pending Approvals ({pendingRestaurants.length})
        </h3>
        {pendingRestaurants.length === 0 ? (
          <div className="empty-state">No pending restaurants</div>
        ) : (
          <table className="partners-table">
            <thead>
              <tr>
                <th>Restaurant</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Registered</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingRestaurants.map((r) => (
                <tr key={r.id} className="pending-row">
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
                  <td>{new Date(r.created_at).toLocaleDateString("vi-VN")}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-view"
                        onClick={() => handleViewDetails(r)}
                        title="View Details"
                      >
                        <MdVisibility /> View
                      </button>
                      <button
                        className="btn-approve"
                        onClick={() => handleApprove(r.id)}
                        title="Approve Restaurant"
                      >
                        <MdCheckCircle /> Approve
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ACTIVE RESTAURANTS */}
      <div className="section active-section">
        <h3 className="section-title">
          <MdCheckCircle /> Active Restaurants ({activeRestaurants.length})
        </h3>
        {activeRestaurants.length === 0 ? (
          <div className="empty-state">No active restaurants</div>
        ) : (
          <table className="partners-table">
            <thead>
              <tr>
                <th>Restaurant</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Rating</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {activeRestaurants.map((r) => (
                <tr key={r.id}>
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
                  <td>
                    <span className="rating">
                      Rating: {r.rating?.toFixed(1) || "N/A"}
                    </span>
                  </td>
                  <td>
                    <span className="status-badge status-active">
                      {r.isOpen ? "Open" : "Closed"}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-view"
                        onClick={() => handleViewDetails(r)}
                        title="View Details"
                      >
                        <MdVisibility />
                      </button>
                      <button
                        className="btn-block"
                        onClick={() => handleBlock(r.id)}
                        title="Block Restaurant"
                      >
                        <MdBlock />
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(r.id)}
                        title="Delete Restaurant"
                      >
                        <MdDelete />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* BLOCKED RESTAURANTS */}
      {blockedRestaurants.length > 0 && (
        <div className="section blocked-section">
          <h3 className="section-title">
            <MdBlock /> Blocked Restaurants ({blockedRestaurants.length})
          </h3>
          <table className="partners-table">
            <thead>
              <tr>
                <th>Restaurant</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Blocked Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {blockedRestaurants.map((r) => (
                <tr key={r.id} className="blocked-row">
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
                  <td>{new Date(r.updated_at).toLocaleDateString("vi-VN")}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-view"
                        onClick={() => handleViewDetails(r)}
                        title="View Details"
                      >
                        <MdVisibility />
                      </button>
                      <button
                        className="btn-unblock"
                        onClick={() => handleUnblock(r.id)}
                        title="Unblock Restaurant"
                      >
                        <MdCheckCircle /> Unblock
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(r.id)}
                        title="Delete Restaurant"
                      >
                        <MdDelete />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* VIEW DETAILS MODAL */}
      {modalOpen && viewingPartner && (
        <div className="modal-backdrop" onClick={() => setModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Restaurant Details</h3>
              <button className="close-btn" onClick={() => setModalOpen(false)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-row">
                <img
                  src={getImageUrl(viewingPartner.image)}
                  alt={viewingPartner.name}
                  className="modal-image"
                />
              </div>
              <div className="detail-row">
                <strong>Restaurant Name:</strong>
                <span>{viewingPartner.name}</span>
              </div>
              <div className="detail-row">
                <strong>Email:</strong>
                <span>{viewingPartner.email}</span>
              </div>
              <div className="detail-row">
                <strong>Phone:</strong>
                <span>{viewingPartner.phone}</span>
              </div>
              <div className="detail-row">
                <strong>Address:</strong>
                <span>{viewingPartner.address}</span>
              </div>
              <div className="detail-row">
                <strong>Description:</strong>
                <span>{viewingPartner.description || "N/A"}</span>
              </div>
              <div className="detail-row">
                <strong>Category:</strong>
                <span>{viewingPartner.primary_category || "N/A"}</span>
              </div>
              <div className="detail-row">
                <strong>Status:</strong>
                <span
                  className={`status-badge status-${viewingPartner.status}`}
                >
                  {viewingPartner.status}
                </span>
              </div>
              <div className="detail-row">
                <strong>Rating:</strong>
                <span>
                  Rating: {viewingPartner.rating?.toFixed(1) || "0.0"} (
                  {viewingPartner.total_reviews || 0} reviews)
                </span>
              </div>
              <div className="detail-row">
                <strong>Registered:</strong>
                <span>
                  {new Date(viewingPartner.created_at).toLocaleString("vi-VN")}
                </span>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setModalOpen(false)} className="btn-close">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Partners;
