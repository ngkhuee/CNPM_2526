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

    // Validation
    if (
      !formData.restaurantName ||
      !formData.ownerName ||
      !formData.email ||
      !formData.password ||
      !formData.phone ||
      !formData.address
    ) {
      setError("Please fill in all required fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    // Phone validation
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(formData.phone)) {
      setError("Please enter a valid phone number (10-11 digits)");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      setLoading(true);

      // Check if email already exists (for both users and restaurants)
      const usersResponse = await fetch("http://localhost:3000/users");
      const users = await usersResponse.json();

      const restaurantsResponse = await fetch(
        "http://localhost:3000/restaurants"
      );
      const restaurants = await restaurantsResponse.json();

      // Check email in users
      const existingUser = users.find((u) => u.email === formData.email);
      if (existingUser) {
        setError(
          "This email is already registered as a customer account. Please use a different email."
        );
        setLoading(false);
        return;
      }

      // Check email in restaurants (through owner_id)
      const existingRestaurant = restaurants.find(
        (r) => r.email === formData.email
      );
      if (existingRestaurant) {
        setError(
          "This email is already registered. Please use a different email."
        );
        setLoading(false);
        return;
      }

      // Create restaurant (status = pending)
      const restaurantId = `r_${Date.now()}`;
      const userId = `u_${Date.now()}`;

      const newRestaurant = {
        id: restaurantId,
        name: formData.restaurantName,
        owner_id: userId,
        description: formData.description || "No description provided",
        address: formData.address,
        phone: formData.phone,
        email: formData.email,
        image: "/images/restaurants/default.png",
        banner_image: "/images/restaurants/default.png",
        primary_category: "Other",
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

      const newUser = {
        id: userId,
        email: formData.email,
        password: formData.password, // In production, this should be hashed
        full_name: formData.ownerName,
        phone: formData.phone,
        avatar: "/images/avatars/restaurant_owner.png",
        roles: ["restaurant_owner"],
        restaurant_id: restaurantId,
        status: "pending", // Same as restaurant status
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Create both restaurant and user
      await fetch("http://localhost:3000/restaurants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRestaurant),
      });

      await fetch("http://localhost:3000/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });

      // Show success message
      alert(
        "Registration successful!\n\nYour restaurant has been submitted for review. You will receive a notification once the admin approves your registration.\n\nThank you for partnering with us!"
      );

      // Redirect to home
      navigate("/");
    } catch (error) {
      console.error("Registration error:", error);
      setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-restaurant-page">
      <div className="register-restaurant-container">
        <div className="register-restaurant-header">
          <MdStore size={48} />
          <h1>Become a Restaurant Partner</h1>
          <p>Join our platform and reach thousands of customers</p>
        </div>

        <form onSubmit={handleSubmit} className="register-restaurant-form">
          {error && (
            <div className="error-message">
              <MdWarning size={20} /> {error}
            </div>
          )}

          <div className="form-section">
            <h3>Restaurant Information</h3>

            <div className="form-group">
              <label>
                <MdStore /> Restaurant Name <span className="required">*</span>
              </label>
              <input
                type="text"
                name="restaurantName"
                value={formData.restaurantName}
                onChange={handleChange}
                placeholder="e.g., Joe's Pizza"
                required
              />
            </div>

            <div className="form-group">
              <label>
                <MdLocationOn /> Address <span className="required">*</span>
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Full restaurant address"
                required
              />
            </div>

            <div className="form-group">
              <label>Description (Optional)</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Tell us about your restaurant..."
                rows={3}
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Owner Information</h3>

            <div className="form-group">
              <label>
                Owner Full Name <span className="required">*</span>
              </label>
              <input
                type="text"
                name="ownerName"
                value={formData.ownerName}
                onChange={handleChange}
                placeholder="Your full name"
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
                  <MdPhone /> Phone <span className="required">*</span>
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
                  <MdLock /> Password <span className="required">*</span>
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="At least 6 characters"
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  <MdLock /> Confirm Password{" "}
                  <span className="required">*</span>
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
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
              Cancel
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit Application"}
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
