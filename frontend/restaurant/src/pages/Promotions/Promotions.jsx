import React, { useState } from "react";
import "./Promotions.css";
import { promotionsData } from "../../shared/promotionsData";

const Promotions = () => {
    const [promotions, setPromotions] = useState(promotionsData);
    const [showModal, setShowModal] = useState(false);
    const [newPromo, setNewPromo] = useState({ name: "", description: "", status: "Active" });
    const [showEditModal, setShowEditModal] = useState(false);
    const [editPromo, setEditPromo] = useState({ id: null, name: "", description: "", status: "Active" });

    // Mở modal
    const handleOpenModal = () => setShowModal(true);
    const handleCloseModal = () => {
        setShowModal(false);
        setNewPromo({ name: "", description: "", status: "Active" });
    };
    // Thêm promotion
    const handleAddPromotion = (e) => {
        e.preventDefault();
        const nextId = promotions.length ? promotions[promotions.length - 1].id + 1 : 1;
        setPromotions([...promotions, { ...newPromo, id: nextId }]);
        handleCloseModal();
    };
    const handleStatusChange = (id, newStatus) => {
        setPromotions(prev =>
            prev.map(p =>
            p.id === id ? { ...p, status: newStatus } : p
            )
        );
    };
    // Chỉnh sửa promotion
    const handleEdit = (id) => {
        const promoToEdit = promotions.find(p => p.id === id);
        const newName = prompt("Edit promotion name", promoToEdit.name);
        const newDesc = prompt("Edit description", promoToEdit.description);

        if (newName && newDesc) {
            setPromotions(prev =>
            prev.map(p => p.id === id ? { ...p, name: newName, description: newDesc } : p)
            );
        }
    };
    const handleOpenEditModal = (promo) => {
        setEditPromo(promo); // điền sẵn dữ liệu
        setShowEditModal(true);
        };

        const handleCloseEditModal = () => {
        setShowEditModal(false);
        setEditPromo({ id: null, name: "", description: "", status: "Active" });
    };
    const handleEditSubmit = (e) => {
        e.preventDefault();
        setPromotions(prev =>
            prev.map(p => p.id === editPromo.id ? { ...editPromo } : p)
        );
        handleCloseEditModal();
    };

    // Xóa promotion
    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this promotion?")) {
            setPromotions(prev => prev.filter(p => p.id !== id));
        }
    };

    return (
        <div className="main-content">
            <div className="promotions-page">
            <div className="promotions-header">
                <h2>Admin Promotions</h2>
                <button className="add-btn" onClick={handleOpenModal}>➕ Add Promotion</button>
            </div>

            <table className="promotions-table">
                <thead>
                <tr>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {promotions.map(promo => (
                    <tr key={promo.id}>
                    <td>{promo.name}</td>
                    <td>{promo.description}</td>
                    <td>
                        <select
                        value={promo.status}
                        onChange={(e) => handleStatusChange(promo.id, e.target.value)}
                        className={`status-select ${promo.status.toLowerCase()}`}
                        >
                        <option value="Active">Active</option>
                        <option value="Upcoming">Upcoming</option>
                        <option value="Expired">Expired</option>
                        </select>
                    </td>
                    <td>
                        <button className="edit-btn" onClick={() => handleOpenEditModal(promo)}>✏️</button>
                        <button className="delete-btn" onClick={() => handleDelete(promo.id)}>🗑️</button>
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>

            {/* Modal Add */}
            {showModal && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                <div className="modal-content" onClick={e => e.stopPropagation()}>
                    <h3>Add New Promotion</h3>
                    <form onSubmit={handleAddPromotion}>
                    <label>
                        Name:
                        <input
                        type="text"
                        value={newPromo.name}
                        onChange={e => setNewPromo({ ...newPromo, name: e.target.value })}
                        required
                        />
                    </label>
                    <label>
                        Description:
                        <textarea
                        value={newPromo.description}
                        onChange={e => setNewPromo({ ...newPromo, description: e.target.value })}
                        required
                        />
                    </label>
                    <label>
                        Status:
                        <select
                        value={newPromo.status}
                        onChange={e => setNewPromo({ ...newPromo, status: e.target.value })}
                        >
                        <option value="Active">Active</option>
                        <option value="Upcoming">Upcoming</option>
                        <option value="Expired">Expired</option>
                        </select>
                    </label>
                    <div className="modal-buttons">
                        <button type="submit" className="submit-btn">Add</button>
                        <button type="button" className="cancel-btn" onClick={handleCloseModal}>Cancel</button>
                    </div>
                    </form>
                </div>
                </div>
            )}

            {/* Modal Edit */}
            {showEditModal && (
                <div className="modal-overlay" onClick={handleCloseEditModal}>
                <div className="modal-content" onClick={e => e.stopPropagation()}>
                    <h3>Edit Promotion</h3>
                    <form onSubmit={handleEditSubmit}>
                    <label>
                        Name:
                        <input
                        type="text"
                        value={editPromo.name}
                        onChange={e => setEditPromo({ ...editPromo, name: e.target.value })}
                        required
                        />
                    </label>
                    <label>
                        Description:
                        <textarea
                        value={editPromo.description}
                        onChange={e => setEditPromo({ ...editPromo, description: e.target.value })}
                        required
                        />
                    </label>
                    <label>
                        Status:
                        <select
                        value={editPromo.status}
                        onChange={e => setEditPromo({ ...editPromo, status: e.target.value })}
                        >
                        <option value="Active">Active</option>
                        <option value="Upcoming">Upcoming</option>
                        <option value="Expired">Expired</option>
                        </select>
                    </label>
                    <div className="modal-buttons">
                        <button type="submit" className="submit-btn">Save</button>
                        <button type="button" className="cancel-btn" onClick={handleCloseEditModal}>Cancel</button>
                    </div>
                    </form>
                </div>
                </div>
            )}
            </div>
        </div>
    );

};

export default Promotions;
