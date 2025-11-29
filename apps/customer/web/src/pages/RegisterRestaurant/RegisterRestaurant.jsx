import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./RegisterRestaurant.css";
import {
  MdStore,
  MdEmail,
  MdLock,
  MdPhone,
  MdLocationOn,
  MdWarning,
} from "react-icons/md";

const RegisterRestaurant = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    restaurantName: "",
    ownerName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(""); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Get API base URL (dùng chung cho toàn bộ function)
    const API_BASE_URL =
      import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

    // Validation
    if (
      !formData.restaurantName ||
      !formData.ownerName ||
      !formData.email ||
      !formData.password ||
      !formData.phone ||
      !formData.address
    ) {
      setError("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu không khớp");
      return;
    }

    if (formData.password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    // Phone validation
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(formData.phone)) {
      setError("Vui lòng nhập số điện thoại hợp lệ (10-11 chữ số)");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Vui lòng nhập email hợp lệ");
      return;
    }

    try {
      setLoading(true);

      // Check if email already exists using fetch (không cần auth)
      const [usersResponse, restaurantsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/users`),
        fetch(`${API_BASE_URL}/restaurants`),
      ]);

      const users = await usersResponse.json();
      const restaurants = await restaurantsResponse.json();

      // Check email in users
      const existingUser = users.find((u) => u.email === formData.email);
      if (existingUser) {
        setError(
          "Email này đã được đăng ký là tài khoản khách hàng. Vui lòng sử dụng email khác."
        );
        setLoading(false);
        return;
      }

      // Check email in restaurants
      const existingRestaurant = restaurants.find(
        (r) => r.email === formData.email || r.ownerEmail === formData.email
      );
      if (existingRestaurant) {
        setError(
          "Email này đã được đăng ký. Vui lòng sử dụng email khác."
        );
        setLoading(false);
        return;
      }

      // Create restaurant and user IDs
      const restaurantId = `r_${Date.now()}`;
      const userId = `u_${Date.now()}`;

      // Prepare restaurant data (backend expects snake_case)
      const restaurantData = {
        id: restaurantId,
        name: formData.restaurantName,
        owner_id: userId,
        owner_name: formData.ownerName,
        description: formData.description || "Chưa có mô tả",
        address: formData.address,
        latitude: 10.762622, // Default coords - should be updated later
        longitude: 106.660172,
        phone: formData.phone,
        email: formData.email,
        image: "/images/restaurants/default.png",
        banner_image: "/images/restaurants/default.png",
        rating: 0,
        total_reviews: 0,
        is_open: false,
        opening_hours: {
          monday: "09:00-22:00",
          tuesday: "09:00-22:00",
          wednesday: "09:00-22:00",
          thursday: "09:00-22:00",
          friday: "09:00-23:00",
          saturday: "09:00-23:00",
          sunday: "09:00-22:00",
        },
        delivery_time_minutes: 30,
        min_order_amount: 50000,
        status: "pending", // Waiting for admin approval
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Prepare user data (backend expects snake_case)
      const userData = {
        id: userId,
        email: formData.email,
        password: formData.password,
        full_name: formData.ownerName,
        phone: formData.phone,
        avatar: "/images/avatars/restaurant_owner.png",
        roles: ["restaurant_owner"],
        restaurant_id: restaurantId,
        status: "pending",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Create restaurant using PUBLIC endpoint (không cần auth)
      const restaurantResponse = await fetch(
        `${API_BASE_URL}/restaurants/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(restaurantData),
        }
      );

      if (!restaurantResponse.ok) {
        const errorData = await restaurantResponse.json();
        throw new Error(errorData.message || "Failed to create restaurant");
      }

      // Create user account using PUBLIC endpoint (không cần auth)
      const response = await fetch(`${API_BASE_URL}/users/register-owner`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create user account");
      }

      // Show success message
      alert(
        "Đăng ký thành công!\n\nNhà hàng của bạn đã được gửi để xét duyệt. Bạn sẽ nhận được thông báo khi quản trị viên phê duyệt đăng ký của bạn.\n\nCảm ơn bạn đã hợp tác với chúng tôi!"
      );

      // Redirect to home
      navigate("/");
    } catch (error) {
      console.error("Registration error:", error);
      setError("Đăng ký thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-restaurant-page">
      <div className="register-restaurant-container">
        <div className="register-restaurant-header">
          <MdStore size={48} />
          <h1>Trở thành đối tác nhà hàng</h1>
          <p>Tham gia nền tảng và tiếp cận hàng nghìn khách hàng</p>
        </div>

        <form onSubmit={handleSubmit} className="register-restaurant-form">
          {error && (
            <div className="error-message">
              <MdWarning size={20} /> {error}
            </div>
          )}

          <div className="form-section">
            <h3>Thông tin nhà hàng</h3>

            <div className="form-group">
              <label>
                <MdStore /> Tên nhà hàng <span className="required">*</span>
              </label>
              <input
                type="text"
                name="restaurantName"
                value={formData.restaurantName}
                onChange={handleChange}
                placeholder="Ví dụ: Pizza Ngon"
                required
              />
            </div>

            <div className="form-group">
              <label>
                <MdLocationOn /> Địa chỉ <span className="required">*</span>
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Địa chỉ đầy đủ của nhà hàng"
                required
              />
            </div>

            <div className="form-group">
              <label>Mô tả (Tùy chọn)</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Giới thiệu về nhà hàng của bạn..."
                rows={3}
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Thông tin chủ sở hữu</h3>

            <div className="form-group">
              <label>
                Họ và tên chủ sở hữu <span className="required">*</span>
              </label>
              <input
                type="text"
                name="ownerName"
                value={formData.ownerName}
                onChange={handleChange}
                placeholder="Họ tên đầy đủ của bạn"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>
                  <MdEmail /> Email <span className="required">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  <MdPhone /> Số điện thoại <span className="required">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="0901234567"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>
                  <MdLock /> Mật khẩu <span className="required">*</span>
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Ít nhất 6 ký tự"
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  <MdLock /> Xác nhận mật khẩu{" "}
                  <span className="required">*</span>
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Xác nhận mật khẩu của bạn"
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="btn-cancel"
              disabled={loading}
            >
              Hủy
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? "Đang gửi..." : "Gửi đăng ký"}
            </button>
          </div>

          {/* <div className="form-note">
            <p>
              <strong>Note:</strong> After submission, your application will be
              reviewed by our admin team. You will be notified once your
              restaurant is approved and ready to start accepting orders.
            </p>
          </div> */}
        </form>
      </div>
    </div>
  );
};

export default RegisterRestaurant;
