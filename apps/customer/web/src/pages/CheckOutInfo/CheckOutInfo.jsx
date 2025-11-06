import React, { useContext, useState, useEffect } from "react";
import "./CheckOutInfo.css";
import {
  AuthContext,
  CartContext,
  StoreContext,
  OrderContext,
  useAddresses,
} from "customer-shared";
import { formatCurrency } from "shared-utils";
import { useNavigate } from "react-router-dom";
import { MdLocationOn, MdCheckCircle, MdError } from "react-icons/md";

const CheckoutInfo = () => {
  const { user } = useContext(AuthContext);
  const { cartItems, getTotalCartAmount, clearCart } = useContext(CartContext);
  const { food_list } = useContext(StoreContext);
  const { addOrder } = useContext(OrderContext);
  const { addresses, loading: loadingAddresses } = useAddresses(user?.id);
  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    address: "",
  });
  const [useNewAddress, setUseNewAddress] = useState(true); // Toggle between saved vs new
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const navigate = useNavigate();

  const handleInput = (e) => {
    setCustomer({ ...customer, [e.target.name]: e.target.value });
  };

  const [gpsLocation, setGpsLocation] = React.useState(null);
  const [loadingGPS, setLoadingGPS] = React.useState(false);

  const handleSelectSavedAddress = (addr) => {
    setSelectedAddressId(addr.id);
    setCustomer({
      ...customer,
      address: `${addr.address_line}, ${addr.district}, ${addr.city}`,
    });
    if (addr.lat && addr.lng) {
      setGpsLocation({ lat: addr.lat, lng: addr.lng });
    } else {
      setGpsLocation(null);
    }
  };

  const handleGetGPS = () => {
    if (!navigator.geolocation) {
      alert("Browser does not support GPS");
      return;
    }

    setLoadingGPS(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setGpsLocation({ lat: latitude, lng: longitude });
        setLoadingGPS(false);
        alert(
          `GPS location obtained: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
        );
      },
      (error) => {
        setLoadingGPS(false);
        console.error("GPS error:", error);
        alert("Cannot get GPS location. Please enter address manually.");
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customer.name || !customer.phone || !customer.address) {
      alert("Please fill in all information!");
      return;
    }

    // Prepare order items
    const orderItems = food_list
      .filter((item) => cartItems[item._id] > 0)
      .map((item) => ({
        foodId: item._id,
        name: item.name,
        price: item.price, // Price already in VND from DB
        quantity: cartItems[item._id],
        restaurantId: item.restaurantId, // Use camelCase from foodService
      }));

    // Group by restaurant
    const groupedByRestaurant = {};
    orderItems.forEach((item) => {
      if (!groupedByRestaurant[item.restaurantId]) {
        groupedByRestaurant[item.restaurantId] = [];
      }
      groupedByRestaurant[item.restaurantId].push(item);
    });

    // Create orders for each restaurant
    try {
      let lastOrderId = null;

      for (const [restaurantId, items] of Object.entries(groupedByRestaurant)) {
        const orderData = {
          customerId: user?.id || "guest",
          restaurantId,
          items,
          customer: {
            name: customer.name,
            phone: customer.phone,
            address: customer.address,
          },
          dropoff_gps: gpsLocation || null, // GPS coordinates hoặc null
          total_amount: items.reduce(
            (sum, it) => sum + it.price * it.quantity,
            0
          ),
          status: "pending",
          payment_method: "online",
        };

        console.log("📦 Creating order:", orderData);
        const result = await addOrder(orderData);
        if (!result.success) {
          alert(`Order creation error: ${result.message}`);
          return;
        }
        lastOrderId = result.order?.id || result.order?._id;
      }

      // Reset cart (both frontend and backend)
      await clearCart();

      // Redirect to MoMo payment page
      if (lastOrderId) {
        navigate(`/payment-momo/${lastOrderId}`);
      } else {
        alert("✅ Order created! Redirecting to payment...");
        navigate("/myorders");
      }
    } catch (error) {
      console.error("Order error:", error);
      alert("An error occurred while placing order!");
    }
  };

  return (
    <div className="checkout-page">
      <div className="checkout-info">
        <h2>Customer Information</h2>
        <form onSubmit={handleSubmit}>
          <label>Full Name</label>
          <input
            type="text"
            name="name"
            value={customer.name}
            onChange={handleInput}
            placeholder="Enter full name"
          />
          <label>Phone Number</label>
          <input
            type="text"
            name="phone"
            value={customer.phone}
            onChange={handleInput}
            placeholder="Enter phone number"
          />

          {/* Saved Addresses or New Address */}
          <div className="address-selection" style={{ marginBottom: "15px" }}>
            <label style={{ display: "flex", gap: "20px" }}>
              <div>
                <input
                  type="radio"
                  checked={!useNewAddress}
                  onChange={() => setUseNewAddress(false)}
                />
                <span> Select saved address</span>
              </div>
              <div>
                <input
                  type="radio"
                  checked={useNewAddress}
                  onChange={() => {
                    setUseNewAddress(true);
                    setSelectedAddressId(null);
                  }}
                />
                <span> Enter new address</span>
              </div>
            </label>
          </div>

          {!useNewAddress && addresses.length > 0 && (
            <div
              className="saved-addresses"
              style={{
                marginBottom: "15px",
                border: "1px solid #ddd",
                borderRadius: "5px",
                padding: "10px",
                maxHeight: "200px",
                overflowY: "auto",
              }}
            >
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  style={{
                    padding: "8px",
                    cursor: "pointer",
                    background:
                      selectedAddressId === addr.id ? "#e8f5e9" : "#fff",
                    borderRadius: "4px",
                    marginBottom: "5px",
                    border:
                      selectedAddressId === addr.id
                        ? "2px solid #4caf50"
                        : "1px solid #eee",
                  }}
                  onClick={() => handleSelectSavedAddress(addr)}
                >
                  <strong>{addr.address_line}</strong>
                  <br />
                  <small>
                    {addr.district}, {addr.city}
                    {addr.is_default && (
                      <span
                        style={{
                          marginLeft: "8px",
                          color: "#4caf50",
                          fontWeight: "bold",
                        }}
                      >
                        (Default)
                      </span>
                    )}
                  </small>
                </div>
              ))}
            </div>
          )}

          {useNewAddress && (
            <>
              <label>Delivery Address</label>
              <textarea
                name="address"
                value={customer.address}
                onChange={handleInput}
                placeholder="Enter detailed address"
              ></textarea>
            </>
          )}

          <button
            type="button"
            onClick={handleGetGPS}
            disabled={loadingGPS}
            className="gps-btn"
            style={{
              marginBottom: "10px",
              background: gpsLocation ? "#28a745" : "#007bff",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              justifyContent: "center",
            }}
          >
            {loadingGPS ? (
              "Getting GPS..."
            ) : gpsLocation ? (
              <>
                <MdCheckCircle /> GPS Obtained
              </>
            ) : (
              <>
                <MdLocationOn /> Get GPS Location
              </>
            )}
          </button>

          <button type="submit" className="confirm-btn">
            Confirm Order
          </button>
        </form>
      </div>

      <div className="checkout-summary">
        <div className="order-list">
          <h3>Your Order</h3>
          {food_list.filter((item) => cartItems[item._id] > 0).length === 0 ? (
            <p>No items yet.</p>
          ) : (
            food_list
              .filter((item) => cartItems[item._id] > 0)
              .map((item, i) => (
                <div key={i} className="order-item">
                  <span>{item.name}</span>
                  <span>
                    {cartItems[item._id]} x {formatCurrency(item.price)}
                  </span>
                </div>
              ))
          )}
        </div>

        <div className="order-total">
          <h3>Total:</h3>
          <p className="total-amount">
            {formatCurrency(getTotalCartAmount(food_list))}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CheckoutInfo;
