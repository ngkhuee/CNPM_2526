import React, { useContext, useState, useEffect } from "react";
import "./CheckOutInfo.css";
import {
  AuthContext,
  CartContext,
  OrderContext,
  useAddresses,
  useCheckout,
} from "customer-shared";
import { formatCurrency } from "shared-utils";
import { useNavigate } from "react-router-dom";
import { MdLocationOn, MdCheckCircle, MdError, MdSave } from "react-icons/md";

const CheckoutInfo = () => {
  const { user } = useContext(AuthContext);
  const { cart, clearCart, getTotalCartAmount } = useContext(CartContext);
  const { addOrder } = useContext(OrderContext);
  const { addresses, loading: loadingAddresses } = useAddresses(user?.id);
  const {
    gpsLocation,
    loadingGPS,
    loadingSubmit,
    setGpsLocation,
    handleGetGPS,
    processCheckout,
  } = useCheckout(user);
  const navigate = useNavigate();

  const [customer, setCustomer] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    address: "",
  });
  const [useNewAddress, setUseNewAddress] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [saveAddress, setSaveAddress] = useState(false);

  // Auto-fetch GPS on mount if permitted
  useEffect(() => {
    if (navigator.permissions) {
      navigator.permissions.query({ name: "geolocation" }).then((result) => {
        if (result.state === "granted") {
          handleGetGPS();
        }
      });
    }
  }, []);

  // Update customer info when user changes
  useEffect(() => {
    if (user) {
      setCustomer((prev) => ({
        ...prev,
        name: user.name || prev.name,
        phone: user.phone || prev.phone,
      }));
    }
  }, [user]);

  const handleInput = (e) => {
    setCustomer({ ...customer, [e.target.name]: e.target.value });
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customer.name || !customer.phone || !customer.address) {
      alert("Please fill in all required information before proceeding!");
      return;
    }

    // Prepare order items
    const orderItems = food_list
      .filter((item) => cartItems[item._id] > 0)
      .map((item) => ({
        foodId: item._id,
        name: item.name,
        price: item.price,
        quantity: cartItems[item._id],
        restaurantId: item.restaurantId,
      }));

    // Validate that all items have restaurantId
    const itemsWithoutRestaurant = orderItems.filter(
      (item) => !item.restaurantId
    );
    if (itemsWithoutRestaurant.length > 0) {
      alert(
        "Error: Some items are missing restaurant information. Please refresh and try again."
      );
      return;
    }

    // Use the new useCheckout hook to process checkout
    const checkoutResult = await processCheckout(
      customer,
      orderItems,
      useNewAddress,
      selectedAddressId,
      saveAddress,
      addresses
    );

    if (!checkoutResult.success) {
      alert(`Checkout error: ${checkoutResult.message}`);
      return;
    }

    // Create orders for each restaurant
    try {
      let lastOrderId = null;

      for (const orderData of checkoutResult.orders) {
        const result = await addOrder(orderData);

        if (!result || !result.success) {
          alert(
            `Order creation error: ${result?.message || "Unknown error"}`
          );
          return;
        }

        console.log("✅ Order created successfully:", result.order);
        lastOrderId = result.order?.id || result.order?._id;
      }

      // Reset cart
      await clearCart();

      // Redirect to MoMo payment page
      if (lastOrderId) {
        navigate(`/payment-momo/${lastOrderId}`);
      } else {
        alert("Order created! Redirecting to payment...");
        navigate("/myorders");
      }
    } catch (error) {
      console.error("Order error:", error);
      alert("An error occurred while placing order!");
    }
  };

  return (
    <div className="checkout-page">
      <div className="checkout-left">
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

            <label>Delivery Address</label>

            {/* Address selection radio buttons */}
            <div className="address-selection">
              <label>
                <input
                  type="radio"
                  checked={!useNewAddress}
                  onChange={() => setUseNewAddress(false)}
                />
                <span> Select saved address</span>
              </label>
              <label>
                <input
                  type="radio"
                  checked={useNewAddress}
                  onChange={() => {
                    setUseNewAddress(true);
                    setSelectedAddressId(null);
                  }}
                />
                <span> Enter new address</span>
              </label>
            </div>

            {/* Saved addresses list */}
            {!useNewAddress && addresses.length > 0 && (
              <div className="saved-addresses">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className={`address-card ${selectedAddressId === addr.id ? "selected" : ""}`}
                    onClick={() => handleSelectSavedAddress(addr)}
                  >
                    <strong>{addr.address_line}</strong>
                    <br />
                    <small>
                      {addr.district}, {addr.city}
                      {addr.is_default && (
                        <span className="default-badge">(Default)</span>
                      )}
                    </small>
                  </div>
                ))}
              </div>
            )}

            {/* New address input with GPS button */}
            {useNewAddress && (
              <>
                <div className="address-input-container">
                  <textarea
                    name="address"
                    value={customer.address}
                    onChange={handleInput}
                    placeholder="Enter detailed address"
                  ></textarea>
                  <button
                    type="button"
                    onClick={handleGetGPS}
                    disabled={loadingGPS}
                    className="gps-btn"
                    title={
                      gpsLocation
                        ? "GPS location obtained"
                        : "Get current location"
                    }
                  >
                    {loadingGPS ? (
                      <span className="gps-text">...</span>
                    ) : gpsLocation ? (
                      <MdCheckCircle />
                    ) : (
                      <>
                        <MdLocationOn />
                        <span className="gps-text">Get current location</span>
                      </>
                    )}
                  </button>
                </div>

                {user && (
                  <div className="save-address-option">
                    <label>
                      <input
                        type="checkbox"
                        checked={saveAddress}
                        onChange={(e) => setSaveAddress(e.target.checked)}
                      />
                      <MdSave
                        style={{ marginLeft: "8px", marginRight: "4px" }}
                      />
                      <span>Save this address for future orders</span>
                    </label>
                  </div>
                )}
              </>
            )}

            <button
              type="submit"
              className="confirm-btn"
              disabled={!customer.name || !customer.phone || !customer.address}
            >
              Checkout
            </button>
          </form>
        </div>
      </div>

      <div className="checkout-right">
        <div className="checkout-summary">
          <h3>Order Summary</h3>

          <div className="order-list">
            {food_list.filter((item) => cartItems[item._id] > 0).length ===
              0 ? (
              <p className="empty-cart">No items yet.</p>
            ) : (
              food_list
                .filter((item) => cartItems[item._id] > 0)
                .map((item, i) => (
                  <div key={i} className="order-item">
                    <div className="order-item-info">
                      <span className="item-name">{item.name}</span>
                      <span className="item-quantity">
                        x{cartItems[item._id]}
                      </span>
                    </div>
                    <span className="item-price">
                      {formatCurrency(item.price * cartItems[item._id])}
                    </span>
                  </div>
                ))
            )}
          </div>

          <div className="order-total">
            <div className="total-row">
              <span>Total:</span>
              <span className="total-amount">
                {formatCurrency(getTotalCartAmount())}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutInfo;
