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
      toast.success("Đã thêm sản phẩm thành công!");
    });
    if (!result.success) {
      toast.error(result.message);
    }
  };

  return (
    <div className="main-content">
      <div className="add">
        <h2 className="add-title">Thêm sản phẩm mới</h2>
        <form className="add-form" onSubmit={onSubmitHandler}>
          <div className="add-left">
            <p className="label">Ảnh sản phẩm</p>
            <label htmlFor="image" className="upload-box">
              <img
                src={image ? URL.createObjectURL(image) : assets.upload_area}
                alt="upload"
              />
              <span>Nhấp để tải lên</span>
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
                <p className="label">Nhà hàng</p>
                <p className="restaurant-name">
                  <MdLocationOn /> {currentRestaurant.name}
                </p>
              </div>
            )}

            <p className="label">Tên sản phẩm</p>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Nhập tên sản phẩm"
              required
              disabled={loading}
            />

            <p className="label">Mô tả</p>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              placeholder="Viết mô tả sản phẩm"
              required
              disabled={loading}
            />

            <div className="add-bottom">
              <div className="category-box">
                <p className="label">
                  Danh mục <span style={{ color: "red" }}>*</span>
                </p>
                <select
                  name="categoryId"
                  onChange={handleInputChange}
                  value={formData.categoryId}
                  disabled={loading}
                  required
                >
                  <option value="">-- Chọn danh mục (Bắt buộc) --</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="price-box">
                <p className="label">Giá</p>
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
                  <MdHourglassEmpty /> Đang thêm...
                </>
              ) : (
                "Thêm sản phẩm"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Add;
