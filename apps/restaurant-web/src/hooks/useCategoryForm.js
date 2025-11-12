import { useState, useCallback, useContext } from "react";
import { CategoryContext } from "../Context/CategoryContext";
import { AuthContext } from "../Context/AuthContext";

export const useCategoryForm = () => {
    const { addCategory, updateCategory, deleteCategory, fetchCategories } =
        useContext(CategoryContext);
    const { currentUser } = useContext(AuthContext);

    const [showModal, setShowModal] = useState(false);
    const [editModal, setEditModal] = useState(false);
    const [currentCategory, setCurrentCategory] = useState({
        name: "",
        description: "",
        status: "active",
    });
    const [loading, setLoading] = useState(false);

    const resetForm = useCallback(() => {
        setCurrentCategory({ name: "", description: "", status: "active" });
    }, []);

    const handleOpenModal = useCallback(() => {
        resetForm();
        setShowModal(true);
    }, [resetForm]);

    const handleCloseModal = useCallback(() => {
        setShowModal(false);
        resetForm();
    }, [resetForm]);

    const handleOpenEditModal = useCallback((category) => {
        setCurrentCategory(category);
        setEditModal(true);
    }, []);

    const handleCloseEditModal = useCallback(() => {
        setEditModal(false);
        resetForm();
    }, [resetForm]);

    const handleAddCategory = useCallback(
        async (e) => {
            e.preventDefault();
            if (!currentUser?.restaurantId) return;

            const categoryData = {
                ...currentCategory,
                restaurantId: currentUser.restaurantId,
            };
            try {
                setLoading(true);
                const result = await addCategory(categoryData);
                if (result.success) {
                    handleCloseModal();
                    await fetchCategories(currentUser.restaurantId);
                }
            } finally {
                setLoading(false);
            }
        },
        [currentCategory, currentUser, addCategory, handleCloseModal, fetchCategories]
    );

    const handleEditCategory = useCallback(
        async (e) => {
            e.preventDefault();
            try {
                setLoading(true);
                const result = await updateCategory(
                    currentCategory.id,
                    currentCategory
                );
                if (result.success) {
                    handleCloseEditModal();
                    if (currentUser?.restaurantId) {
                        await fetchCategories(currentUser.restaurantId);
                    }
                }
            } finally {
                setLoading(false);
            }
        },
        [
            currentCategory,
            currentUser,
            updateCategory,
            handleCloseEditModal,
            fetchCategories,
        ]
    );

    const handleDelete = useCallback(
        async (id) => {
            if (window.confirm("Are you sure you want to delete this category?")) {
                try {
                    setLoading(true);
                    const result = await deleteCategory(id);
                    if (result.success && currentUser?.restaurantId) {
                        await fetchCategories(currentUser.restaurantId);
                    }
                } finally {
                    setLoading(false);
                }
            }
        },
        [currentUser, deleteCategory, fetchCategories]
    );

    const handleChange = useCallback((field, value) => {
        setCurrentCategory((prev) => ({ ...prev, [field]: value }));
    }, []);

    return {
        showModal,
        editModal,
        currentCategory,
        loading,
        handleOpenModal,
        handleCloseModal,
        handleOpenEditModal,
        handleCloseEditModal,
        handleAddCategory,
        handleEditCategory,
        handleDelete,
        handleChange,
    };
};
