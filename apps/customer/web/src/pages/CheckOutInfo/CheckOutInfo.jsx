import React, { useContext, useState, useEffect } from "react";
import "./CheckOutInfo.css";
import {
  AuthContext,
  CartContext,
  OrderContext,
  useAddresses,
  useGPSLocation,
  useAddressManagement,
  useCheckoutProcessing,
  useCheckoutValidation,
} from "customer-shared";
import { formatCurrency } from "shared-utils";
import { useNavigate } from "react-router-dom";
import { MdError, MdSave } from "react-icons/md";
import {
  CheckoutCustomerForm,
  CheckoutAddressSection,
  CheckoutOrderSummary,
} from "../../components/Checkout";

const CheckoutInfo = () => {
  // Contexts
  const { user } = useContext(AuthContext);
  const { cart, clearCart, getTotalCartAmount } = useContext(CartContext);
  const { addOrder } = useContext(OrderContext);
  const navigate = useNavigate();

  // Addresses
  const { addresses } = useAddresses(user?.id);

  // Custom Hooks
  const {
    gpsLocation,
    loadingGPS,
    handleGetGPS,
    geocodeAddressToCoords,
  } = useGPSLocation();

  const { saveAddressToDatabase } = useAddressManagement(user);

  const {
    loadingSubmit,
    checkoutError,
    processCheckoutOrders,
    clearError: clearCheckoutError,
  } = useCheckoutProcessing(user);

  const {
    validateCheckout,
    markAsTouched,
    getFieldError,
  } = useCheckoutValidation();

  // Local state
  const [customer, setCustomer] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    address: "",
  });
  const [useNewAddress, setUseNewAddress] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [saveAddressChecked, setSaveAddressChecked] = useState(false);

  // Auto-fetch GPS on mount
  useEffect(() => {
    if (navigator.permissions) {
      navigator.permissions
        .query({ name: "geolocation" })
        .then((result) => {
          if (result.state === "granted") {
            handleGetGPS();
          }
        })
        .catch(() => { });
    }
  }, []);

  // Update customer when user changes
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
    const { name, value } = e.target;
    setCustomer((prev) => ({
      ...prev,
      [name]: value,
    }));
    markAsTouched(name);
    clearCheckoutError();
  };

  const handleSelectSavedAddress = (addr) => {
    setSelectedAddressId(addr.id);
    setCustomer((prev) => ({
      ...prev,
      address: `${addr.address_line}, ${addr.district}, ${addr.city}`,
    }));
    markAsTouched("address");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearCheckoutError();

    if (!cart?.items || cart.items.length === 0) {
      alert("Your cart is empty");
      return;
    }

    const isValid = validateCheckout({
      customer,
      useNewAddress,
      selectedAddressId,
      items: cart.items,
    });

    if (!isValid) {
      alert("Please fill in all required fields correctly");
      return;
    }

    try {
      let finalGpsLocation = gpsLocation;
      let addressIdForOrder = selectedAddressId;

      if (useNewAddress) {
        if (!finalGpsLocation) {
          const geocoded = await geocodeAddressToCoords(customer.address);
          if (geocoded) {
            finalGpsLocation = geocoded;
          }
        }

        if (user && saveAddressChecked) {
          const savedAddress = await saveAddressToDatabase(
            {
              address: customer.address,
              phone: customer.phone,
              lat: finalGpsLocation?.lat || null,
              lng: finalGpsLocation?.lng || null,
              isDefault: addresses.length === 0,
            },
            true
          );

          if (savedAddress) {
            addressIdForOrder = savedAddress.id;
          }
        }
      }

      const checkoutResult = await processCheckoutOrders(
        customer,
        cart.items,
        addressIdForOrder,
        finalGpsLocation
      );

      if (!checkoutResult.success) {
        alert(`Checkout error: ${checkoutResult.message}`);
        return;
      }

      let lastOrderId = null;
      for (const orderData of checkoutResult.orders) {
        const result = await addOrder(orderData);
        if (!result || !result.success) {
          alert(`Order error: ${result?.message || "Unknown error"}`);
          return;
        }
        lastOrderId = result.order?.id || result.order?._id;
      }

      await clearCart();

      if (lastOrderId) {
        navigate(`/payment-momo/${lastOrderId}`);
      } else {
        navigate("/myorders");
      }
    } catch (error) {
      console.error("Order error:", error);
      alert(error.message || "An error occurred while placing order!");
    }
  };

  const subtotal = getTotalCartAmount();

  return (
    <div className="checkout-page">
      <div className="checkout-left">
        <div className="checkout-info">
          <h2>Checkout</h2>
          <form onSubmit={handleSubmit}>
            {checkoutError && (
              <div
                style={{
                  background: "#f8d7da",
                  border: "1px solid #f5c6cb",
                  borderRadius: "4px",
                  padding: "12px",
                  marginBottom: "15px",
                  color: "#721c24",
                }}
              >
                <MdError style={{ marginRight: "8px" }} />
                {checkoutError}
              </div>
            )}

            <CheckoutCustomerForm
              customer={customer}
              errors={{}}
              touched={{}}
              onInput={handleInput}
              onBlur={markAsTouched}
              getFieldError={getFieldError}
            />

            <CheckoutAddressSection
              useNewAddress={useNewAddress}
              selectedAddressId={selectedAddressId}
              addresses={addresses}
              customer={customer}
              gpsLocation={gpsLocation}
              loadingGPS={loadingGPS}
              errors={{}}
              touched={{}}
              onSelectAddressType={(isNew) => {
                setUseNewAddress(isNew);
                if (isNew) setSelectedAddressId(null);
              }}
              onSelectSavedAddress={handleSelectSavedAddress}
              onAddressInput={handleInput}
              onBlur={markAsTouched}
              onGetGPS={handleGetGPS}
              getFieldError={getFieldError}
            />

            {/* Save address option */}
            {user && useNewAddress && (
              <div className="save-address-option">
                <label>
                  <input
                    type="checkbox"
                    checked={saveAddressChecked}
                    onChange={(e) => setSaveAddressChecked(e.target.checked)}
                  />
                  <MdSave style={{ marginLeft: "8px", marginRight: "4px" }} />
                  <span>Save this address for future orders</span>
                </label>
              </div>
            )}

            <button
              type="submit"
              className="confirm-btn"
              disabled={
                loadingSubmit ||
                !customer.name ||
                !customer.phone ||
                !customer.address
              }
            >
              {loadingSubmit ? "Processing..." : "Proceed to Payment"}
            </button>
          </form>
        </div>
      </div>

      <div className="checkout-right">
        <CheckoutOrderSummary
          cart={cart}
          subtotal={subtotal}
          discountAmount={0}
          total={subtotal}
        />
      </div>
    </div>
  );
};

export default CheckoutInfo;
