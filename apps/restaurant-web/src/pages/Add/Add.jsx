import React, { useState, useEffect, useContext } from "react";
import "./Add.css";
import { assets } from "../../assets/assets";
import { toast } from "react-toastify";
import { FoodContext } from "../../Context/FoodContext";
import { RestaurantContext } from "../../Context/RestaurantContext";
import { CategoryContext } from "../../Context/CategoryContext";
import { AuthContext } from "../../Context/AuthContext";
import { MdLocationOn, MdHourglassEmpty } from "react-icons/md";

const Add = () => {
  const { addFood } = useContext(FoodContext);
  const { currentRestaurant } = useContext(RestaurantContext);
  const { categories } = useContext(CategoryContext);
  const { currentUser } = useContext(AuthContext);
  const [data, setData] = useState({
    name: "",
    description: "",
    price: "",
    categoryId: "",
  });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    if (!image) {
      toast.error("Please upload an image");
      return;
    }

    if (!data.categoryId) {
      toast.error("Please select a category!");
      return;
    }

    if (!currentUser || !currentUser.restaurantId) {
      toast.error("Restaurant ID not found!");
      return;
    }

    setLoading(true);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const newFoodData = {
        name: data.name,
        description: data.description,
        price: Number(data.price),
        categoryId: data.categoryId,
        restaurantId: currentUser.restaurantId,
        image: reader.result, // base64 image
        isAvailable: true,
        isFeatured: false,
        preparationTime: 20, // default value
        rating: 0, // default rating for new food
        total_reviews: 0, // default review count
      };

      const result = await addFood(newFoodData);

      if (result.success) {
        toast.success("✅ Product added successfully!");
        // Reset form
        setData({
          name: "",
          description: "",
          price: "",
          categoryId: categories.length > 0 ? categories[0].id : "",
        });
        setImage(null);
      } else {
        toast.error(` Failed to add: ${result.message}`);
      }

      setLoading(false);
    };

    reader.readAsDataURL(image);
  };

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const formatVND = (value) => {
    if (!value) return "";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
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
            onChange={(e) => setImage(e.target.files[0])}
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
            value={data.name}
            onChange={onChangeHandler}
            placeholder="Enter product name"
            required
            disabled={loading}
          />

          <p className="label">Description</p>
          <textarea
            name="description"
            value={data.description}
            onChange={onChangeHandler}
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
                onChange={onChangeHandler}
                value={data.categoryId}
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
                value={data.price}
                onChange={onChangeHandler}
                placeholder="20000"
                disabled={loading}
              />
              {data.price && (
                <p className="price-preview">{formatVND(data.price)}</p>
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
