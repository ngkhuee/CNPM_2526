import React from "react";
import { MdEdit, MdDelete } from "react-icons/md";

const CategoryTable = ({
    categories,
    restaurantFoods,
    onEdit,
    onDelete,
    onViewFoods,
}) => {
    return (
        <table className="category-table">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Foods</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {categories.length > 0 ? (
                    categories.map((cat) => (
                        <tr key={cat.id}>
                            <td>{cat.name}</td>
                            <td>{cat.description}</td>
                            <td>
                                <button
                                    className="view-foods-btn"
                                    onClick={() => onViewFoods(cat.id, cat.name)}
                                >
                                    {
                                        restaurantFoods.filter(
                                            (f) => f.categoryId === cat.id || f.category === cat.name
                                        ).length
                                    }{" "}
                                    món
                                </button>
                            </td>
                            <td>
                                <span className={`status ${cat.status.toLowerCase()}`}>
                                    {cat.status}
                                </span>
                            </td>
                            <td className="action-btn">
                                <button
                                    className="edit-btn"
                                    onClick={() => onEdit(cat)}
                                >
                                    <MdEdit size={18} />
                                </button>
                                <button
                                    className="delete-btn"
                                    onClick={() => onDelete(cat.id)}
                                >
                                    <MdDelete />
                                </button>
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="5" style={{ textAlign: "center" }}>
                            Không tìm thấy danh mục nào
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
    );
};

export default CategoryTable;
