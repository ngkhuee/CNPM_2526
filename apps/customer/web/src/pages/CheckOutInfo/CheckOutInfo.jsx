import React, { useContext, useState, useEffect } from "react";
import "./CheckOutInfo.css";
import {
  AuthContext,
  CartContext,
  StoreContext,
  OrderContext,
  useAddresses,
} from "customer-shared";
import { formatCurrency, reverseGeocode, geocodeAddress } from "shared-utils";
import { addressService, restaurantService } from "shared-services";
import { useNavigate } from "react-router-dom";
import { MdLocationOn, MdCheckCircle, MdError, MdSave } from "react-icons/md";

const CheckoutInfo = () => {
  const { user } = useContext(AuthContext);
  const { cartItems, getTotalCartAmount, clearCart } = useContext(CartContext);
  const { food_list } = useContext(StoreContext);
  const { addOrder } = useContext(OrderContext);
  const { addresses, loading: loadingAddresses } = useAddresses(user?.id);
  const [customer, setCustomer] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    address: "",
  });
  const [useNewAddress, setUseNewAddress] = useState(true); // Toggle between saved vs new
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [saveAddress, setSaveAddress] = useState(false); // Option to save new address
  const navigate = useNavigate();

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

  const handleGetGPS = async () => {
    if (!navigator.geolocation) {
      alert("Browser does not support GPS");
      return;
    }

    setLoadingGPS(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setGpsLocation({ lat: latitude, lng: longitude });

        // Convert GPS coordinates to address text
        try {
          const result = await reverseGeocode(latitude, longitude);
          if (result && result.display_name) {
            setCustomer((prev) => ({
              ...prev,
              address: result.display_name,
            }));
          } else {
            setCustomer((prev) => ({
              ...prev,
              address: `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`,
            }));
          }
        } catch (error) {
          console.error("Reverse geocoding error:", error);
          setCustomer((prev) => ({
            ...prev,
            address: `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`,
          }));
        }

        setLoadingGPS(false);
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
      alert("Please fill in all required information before proceeding!");
      return;
    }

    // If using new address and GPS not obtained, try to geocode the address
    if (useNewAddress && !gpsLocation) {
      console.log("🗺️ Geocoding address to get GPS coordinates...");
      try {
        const geocodeResult = await geocodeAddress(customer.address);
        if (geocodeResult) {
          setGpsLocation({ lat: geocodeResult.lat, lng: geocodeResult.lng });
          console.log("✅ Geocoded GPS:", geocodeResult);
        } else {
          console.warn("⚠️ Could not geocode address, proceeding without GPS");
        }
      } catch (error) {
        console.error("❌ Geocoding error:", error);
        // Continue without GPS - not critical
      }
    }

    // Save new address if requested and get the address_id
    let addressIdForOrder = selectedAddressId; // Use selected saved address ID if exists

    if (useNewAddress && user) {
      try {
        // Always create address in database (either permanent or temporary)
        console.log(
          saveAddress
            ? "💾 Saving new address..."
            : "📍 Creating temporary address for order..."
        );
        const savedAddress = await addressService.create({
          userId: user.id,
          addressLine: customer.address,
          phone: customer.phone,
          district: "",
          city: "",
          lat: gpsLocation?.lat || null,
          lng: gpsLocation?.lng || null,
          isDefault: saveAddress && addresses.length === 0, // Set as default only if user wants to save
        });
        console.log("✅ Address created successfully:", savedAddress);
        addressIdForOrder = savedAddress.id; // Use the newly created address ID
      } catch (error) {
        console.error("❌ Error creating address:", error);
        // Continue with order even if save fails
      }
    }

    // Prepare order items
    const orderItems = food_list
      .filter((item) => cartItems[item._id] > 0)
      .map((item) => {
        console.log("🍕 Food item:", {
          id: item._id,
          name: item.name,
          restaurantId: item.restaurantId,
          price: item.price,
        });

        return {
          foodId: item._id,
          name: item.name,
          price: item.price,
          quantity: cartItems[item._id],
          restaurantId: item.restaurantId,
        };
      });

    console.log("📋 Order items prepared:", orderItems);

    // Validate that all items have restaurantId
    const itemsWithoutRestaurant = orderItems.filter(
      (item) => !item.restaurantId
    );
    if (itemsWithoutRestaurant.length > 0) {
      console.error(
        "❌ Some items missing restaurantId:",
        itemsWithoutRestaurant
      );
      alert(
        "Error: Some items are missing restaurant information. Please refresh and try again."
      );
      return;
    }

    // Group by restaurant
    const groupedByRestaurant = {};
    orderItems.forEach((item) => {
      if (!groupedByRestaurant[item.restaurantId]) {
        groupedByRestaurant[item.restaurantId] = [];
      }
      groupedByRestaurant[item.restaurantId].push(item);
    });

    console.log("🏪 Grouped by restaurant:", groupedByRestaurant);

    // Create orders for each restaurant
    try {
      let lastOrderId = null;

      for (const [restaurantId, items] of Object.entries(groupedByRestaurant)) {
        // Calculate total for this restaurant's items
        const total = items.reduce(
          (sum, it) => sum + it.price * it.quantity,
          0
        );

        // Fetch restaurant data to get pickup location
        let pickupGPS = null;
        try {
          const restaurant = await restaurantService.getById(restaurantId);
          if (restaurant && restaurant.location) {
            pickupGPS = restaurant.location;
            console.log("📍 Restaurant location:", restaurant.name, pickupGPS);
          }
        } catch (error) {
          console.warn("⚠️ Could not fetch restaurant location:", error);
        }

        const orderData = {
          customerId: user?.id || "guest",
          restaurantId: restaurantId,
          addressId: addressIdForOrder || null, // Link to address table
          items: items,
          customer: {
            name: customer.name,
            phone: customer.phone,
            address: customer.address,
          },
          pickup_gps: pickupGPS, // Restaurant location for drone pickup
          dropoff_gps: gpsLocation || null, // Customer location for delivery
          total_amount: total,
          subtotal: total,
          deliveryFee: 0,
          discountAmount: 0,
          status: "pending",
          payment_method: "online",
        };

        console.log(
          "📦 Creating order for restaurant:",
          restaurantId,
          orderData
        );

        let result;
        try {
          result = await addOrder(orderData);
          console.log("🔍 addOrder result:", result);
        } catch (err) {
          console.error("❌ Exception in addOrder:", err);
          alert(`Order creation exception: ${err.message}`);
          return;
        }

        if (!result || !result.success) {
          console.error("❌ Order creation failed:", result);
          alert(
            `Order creation error: ${result?.message || "Unknown error. Check console for details."}`
          );
          return;
        }

        console.log("✅ Order created successfully:", result.order);
        lastOrderId = result.order?.id || result.order?._id;
      }

      // Reset cart (both frontend and backend)
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
                {formatCurrency(getTotalCartAmount(food_list))}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutInfo;
