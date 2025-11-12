import React, { useContext } from "react";
import "./Add.css";
import { assets } from "../../assets/assets";
import { toast } from "react-toastify";
import { CategoryContext } from "../../Context/CategoryContext";
import { RestaurantContext } from "../../Context/RestaurantContext";
import { MdLocationOn, MdHourglassEmpty } from "react-icons/md";
import { useAddFood } from "../../hooks/useAddFood";

const Add = () => {
  const { currentRestaurant } = useContext(RestaurantContext);
  const { categories } = useContext(CategoryContext);
  const {
    formData,
    image,
    loading,
    handleImageChange,
    handleInputChange,
    handleSubmit,
    formatVND,
  } = useAddFood();

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    const result = await handleSubmit(() => {
      toast.success("Product added successfully!");
    });
    if (!result.success) {
      toast.error(result.message);
    }
  };

  return (
    <div className="add">
      <h2 className="add-title">Add New Product</h2>
      <form className="add-form" onSubmit={onSubmitHandler}>
        <div className="add-left">
          <p className="label">Product Image</p>
          <label htmlFor="image" className="upload-box">
            <img
              src={image ? URL.createObjectURL(image) : assets.upload_area}
              alt="upload"
            />
            <span>Click to upload</span>
          </label>
          <input
            type="file"
            id="image"
            hidden
            accept="image/*"
            onChange={(e) => handleImageChange(e.target.files[0])}
            required
          />
        </div>

        <div className="add-right">
          {currentRestaurant && (
            <div className="restaurant-info">
              <p className="label">Restaurant</p>
              <p className="restaurant-name">
                <MdLocationOn /> {currentRestaurant.name}
              </p>
            </div>
          )}

          <p className="label">Product Name</p>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Enter product name"
            required
            disabled={loading}
          />

          <p className="label">Description</p>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={4}
            placeholder="Write product description"
            required
            disabled={loading}
          />

          <div className="add-bottom">
            <div className="category-box">
              <p className="label">
                Category <span style={{ color: "red" }}>*</span>
              </p>
              <select
                name="categoryId"
                onChange={handleInputChange}
                value={formData.categoryId}
                disabled={loading}
                required
              >
                <option value="">-- Select a category (Required) --</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="price-box">
              <p className="label">Price</p>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="20000"
                disabled={loading}
              />
              {formData.price && (
                <p className="price-preview">{formatVND(formData.price)}</p>
              )}
            </div>
          </div>

          <button type="submit" className="add-btn" disabled={loading}>
            {loading ? (
              <>
                <MdHourglassEmpty /> Adding...
              </>
            ) : (
              "Add Product"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Add;
