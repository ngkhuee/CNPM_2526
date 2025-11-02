import React, { useState, useEffect } from "react";
import { restaurantService } from "@api/services";
import { getImageUrl } from "@utils/imageHelper";
import "./Partners.css";

const Partners = () => {
  const [partners, setPartners] = useState([]);
  const [editingPartner, setEditingPartner] = useState(null); // partner đang edit
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", category: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const restaurants = await restaurantService.getAll();
      const data = restaurants.map((r) => ({
        id: r.id,
        name: r.name,
        email: r.ownerEmail || "example@email.com",
        category: r.category,
        openedAt: r.openedAt,
        image: r.image,
      }));
      setPartners(data);
    } catch (error) {
      console.error("Error fetching partners:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("Bạn có chắc muốn xóa đối tác này?")) {
      setPartners((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const handleEdit = (partner) => {
    setEditingPartner(partner);
    setFormData({ name: partner.name, category: partner.category });
    setModalOpen(true);
  };

  const handleSave = () => {
    setPartners((prev) =>
      prev.map((p) => (p.id === editingPartner.id ? { ...p, ...formData } : p))
    );
    setModalOpen(false);
    setEditingPartner(null);
  };

  return (
    <div className="partners-page">
      <h2>Partners Management</h2>
      <table className="partners-table">
        <thead>
          <tr>
            <th>Image</th>
            <th>Name</th>
            <th>Category</th>
            <th>Opened At</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {partners.map((p) => (
            <tr key={p.id}>
              <td>
                <img
                  src={getImageUrl(p.image)}
                  alt={p.name}
                  className="partner-img"
                />
              </td>
              <td>{p.name}</td>
              <td>{p.category}</td>
              <td>{p.openedAt}</td>
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
