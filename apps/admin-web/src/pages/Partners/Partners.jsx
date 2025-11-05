import React, { useState } from "react";
import { useRestaurantManagement } from "../../hooks/useRestaurantManagement";
import { getImageUrl } from "@utils/imageHelper";
import "./Partners.css";

const Partners = () => {
  const { restaurants, loading, updateRestaurant, deleteRestaurant, refresh } =
    useRestaurantManagement();
  const [editingPartner, setEditingPartner] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", category: "" });

  // Map restaurants to partners format
  const partners = restaurants.map((r) => ({
    id: r.id,
    name: r.name,
    email: r.ownerEmail || r.owner_email || "example@email.com",
    image: r.image || r.images?.[0] || "/default-restaurant.png",
  }));

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa đối tác này?")) {
      const result = await deleteRestaurant(id);
      if (result.success) {
        alert("Đã xóa đối tác thành công!");
      } else {
        alert("Lỗi: " + result.message);
      }
    }
  };

  const handleEdit = (partner) => {
    setEditingPartner(partner);
    setFormData({ name: partner.name, category: partner.category });
    setModalOpen(true);
  };

  const handleSave = async () => {
    const result = await updateRestaurant(editingPartner.id, formData);
    if (result.success) {
      alert("Cập nhật thành công!");
      setModalOpen(false);
      setEditingPartner(null);
    } else {
      alert("Lỗi: " + result.message);
    }
  };

  return (
    <div className="partners-page">
      <h2>Partners Management</h2>
      <table className="partners-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {partners.map((p) => (
            <tr key={p.id}>
              <td>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "12px" }}
                >
                  <img
                    src={getImageUrl(p.image)}
                    alt={p.name}
                    className="partner-img"
                  />
                  <span style={{ fontWeight: "500" }}>{p.name}</span>
                </div>
              </td>
              <td>{p.email}</td>
              <td>
                <button className="btn-edit" onClick={() => handleEdit(p)}>
                  Edit
                </button>
                <button
                  className="btn-delete"
                  onClick={() => handleDelete(p.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {modalOpen && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>Edit Partner</h3>
            <label>
              Name:
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </label>
            <label>
              Category:
              <input
                type="text"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
              />
            </label>
            <div className="modal-actions">
              <button onClick={handleSave}>Save</button>
              <button onClick={() => setModalOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Partners;
