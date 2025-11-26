import React from "react";

const FoodFilterBar = ({
    search,
    setSearch,
    categoryFilter,
    setCategoryFilter,
    categories,
    restaurantFoods,
}) => {
    return (
        <div className="list-filters">
            <input
                type="text"
                placeholder="Tìm theo tên..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
            <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
            >
                <option value="All">Tất cả danh mục</option>
                {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                        {cat.name}
                    </option>
                ))}
                {[...new Set(restaurantFoods.map((f) => f.category).filter(Boolean))].map((cat) => {
                    if (!categories.find((rc) => rc.name === cat || rc.id === cat)) {
                        return (
                            <option key={cat} value={cat}>
                                {cat}
                            </option>
                        );
                    }
                    return null;
                })}
                {restaurantFoods.some((f) => !f.category && !f.categoryId) && (
                    <option value="Uncategorized">Chưa phân loại</option>
                )}
            </select>
        </div>
    );
};

export default FoodFilterBar;
