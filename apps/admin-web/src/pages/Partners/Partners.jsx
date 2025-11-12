import React, { useState } from "react";
import { useRestaurantManagement } from "../../hooks/useRestaurantManagement";
import { useRestaurantApproval } from "../../hooks/useRestaurantApproval";
import PendingPartnerTable from "./PendingPartnerTable";
import ActivePartnerTable from "./ActivePartnerTable";
import BlockedPartnerTable from "./BlockedPartnerTable";
import PartnerDetailsModal from "./PartnerDetailsModal";
import "./Partners.css";
import { MdRefresh, MdNotifications, MdCheckCircle, MdBlock } from "react-icons/md";

const Partners = () => {
  const { restaurants, loading, refresh } = useRestaurantManagement();
  const { handleApprove, handleBlock, handleUnblock, handleDelete } =
    useRestaurantApproval(refresh);

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

  const handleApproveClick = async (id) => {
    if (
      window.confirm(
        "Approve this restaurant? It will be able to start operating."
      )
    ) {
      const restaurant = restaurants.find((r) => r.id === id);
      const result = await handleApprove(id, restaurant);
      if (result.success) {
        alert(
          "Restaurant approved successfully! They can now login and start accepting orders."
        );
      } else {
        alert("Error: " + result.message);
      }
    }
  };

  const handleBlockClick = async (id) => {
    if (
      window.confirm(
        "Block this restaurant? They won't be able to login or receive orders."
      )
    ) {
      const restaurant = restaurants.find((r) => r.id === id);
      const result = await handleBlock(id, restaurant);
      if (result.success) {
        alert("Restaurant blocked successfully!");
      } else {
        alert("Error: " + result.message);
      }
    }
  };

  const handleUnblockClick = async (id) => {
    if (
      window.confirm(
        "Unblock this restaurant? They will be able to login and receive orders again."
      )
    ) {
      const restaurant = restaurants.find((r) => r.id === id);
      const result = await handleUnblock(id, restaurant);
      if (result.success) {
        alert("Restaurant unblocked successfully!");
      } else {
        alert("Error: " + result.message);
      }
    }
  };

  const handleDeleteClick = async (id) => {
    if (
      window.confirm(
        "DELETE this restaurant permanently?\n\nThis will:\n- Delete the restaurant account\n- Remove all their menu items\n- Cancel any pending orders\n\nThis action CANNOT be undone!"
      )
    ) {
      const secondConfirm = window.prompt(
        'Type "DELETE" to confirm permanent deletion:'
      );
      if (secondConfirm === "DELETE") {
        const result = await handleDelete(id);
        if (result.success) {
          alert("Restaurant deleted permanently!");
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

      {/* PENDING RESTAURANTS */}
      <div className="section pending-section">
        <h3 className="section-title">
          <MdNotifications /> Pending Approvals ({pendingRestaurants.length})
        </h3>
        <PendingPartnerTable
          restaurants={pendingRestaurants}
          onViewDetails={handleViewDetails}
          onApprove={handleApproveClick}
        />
      </div>

      {/* ACTIVE RESTAURANTS */}
      <div className="section active-section">
        <h3 className="section-title">
          <MdCheckCircle /> Active Restaurants ({activeRestaurants.length})
        </h3>
        <ActivePartnerTable
          restaurants={activeRestaurants}
          onViewDetails={handleViewDetails}
          onBlock={handleBlockClick}
          onDelete={handleDeleteClick}
        />
      </div>

      {/* BLOCKED RESTAURANTS */}
      {blockedRestaurants.length > 0 && (
        <div className="section blocked-section">
          <h3 className="section-title">
            <MdBlock /> Blocked Restaurants ({blockedRestaurants.length})
          </h3>
          <BlockedPartnerTable
            restaurants={blockedRestaurants}
            onViewDetails={handleViewDetails}
            onUnblock={handleUnblockClick}
            onDelete={handleDeleteClick}
          />
        </div>
      )}

      {/* DETAILS MODAL */}
      <PartnerDetailsModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        restaurant={viewingPartner}
      />
    </div>
  );
};

export default Partners;
