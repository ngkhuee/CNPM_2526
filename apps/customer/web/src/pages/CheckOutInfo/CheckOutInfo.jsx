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
  usePromotions,
  useSettings,
  calculateCartTotals,
} from "customer-shared";
import { formatCurrency, isRestaurantOpen, reverseGeocode } from "shared-utils";
import { restaurantService } from "shared-services";
import { useNavigate } from "react-router-dom";
import { MdError, MdSave, MdCreditCard } from "react-icons/md";
import {
  CheckoutCustomerForm,
  CheckoutAddressSection,
  CheckoutOrderSummary,
} from "../../components/Checkout";
import momoIcon from "../../assets/momo.png";

const CheckoutInfo = () => {
  // Contexts
  const { user } = useContext(AuthContext);
  const { cart, clearCart, getTotalCartAmount, appliedPromotion, setAppliedPromotion } = useContext(CartContext);
  const { addOrder } = useContext(OrderContext);
  const navigate = useNavigate();

  // Addresses
  const { addresses } = useAddresses(user?.id);

  // Custom Hooks
  const {
    gpsLocation,
    setGpsLocation,
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

  const { getApplicablePromotions, loading: loadingPromos } = usePromotions(cart?.restaurant_id);
  const { deliveryFee: deliveryFeeValue } = useSettings();

  // Get promotions applicable to current cart's restaurant
  const applicablePromotions = cart?.restaurant_id
    ? getApplicablePromotions(cart.restaurant_id)
    : [];

  // Local state
  const [customer, setCustomer] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    address: "",
  });
  const [useNewAddress, setUseNewAddress] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [saveAddressChecked, setSaveAddressChecked] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("momo"); // momo or card

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
  }, [handleGetGPS]);

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

  // Auto-fill default address on mount
  useEffect(() => {
    if (addresses && addresses.length > 0 && !selectedAddressId) {
      const defaultAddr = addresses.find(addr => addr.isDefault || addr.is_default);
      if (defaultAddr) {
        console.log('[CheckoutInfo] Auto-filling default address:', defaultAddr);
        handleSelectSavedAddress(defaultAddr, setGpsLocation);
        setUseNewAddress(false);
      }
    }
  }, [addresses]);

  const handleInput = (e) => {
    const { name, value } = e.target;
    setCustomer((prev) => ({
      ...prev,
      [name]: value,
    }));
    markAsTouched(name);
    clearCheckoutError();
  };

  const handleSelectSavedAddress = (addr, setGpsLocationFn) => {
    setSelectedAddressId(addr.id);
    setCustomer((prev) => ({
      ...prev,
      address: `${addr.address_line}, ${addr.district}, ${addr.city}`,
    }));

    // Set GPS location from saved address if available
    if (addr.latitude && addr.longitude && setGpsLocationFn) {
      setGpsLocationFn({ lat: addr.latitude, lng: addr.longitude });
      console.log("GPS location set from saved address:", addr.latitude, addr.longitude);
    }

    markAsTouched("address");
  };

  // When GPS location is obtained, reverse geocode to text and auto-fill address field
  useEffect(() => {
    const reverseGeocodeGPS = async () => {
      if (gpsLocation && useNewAddress) {
        try {
          // Use reverse geocoding utility from shared-utils
          const result = await reverseGeocode(gpsLocation.lat, gpsLocation.lng);

          if (result && result.display_name) {
            setCustomer((prev) => ({
              ...prev,
              address: result.display_name,
            }));
            console.log("GPS location reverse geocoded to address:", result.display_name);
          } else {
            // Fallback to coordinates display
            setCustomer((prev) => ({
              ...prev,
              address: `${gpsLocation.lat.toFixed(6)}, ${gpsLocation.lng.toFixed(6)}`,
            }));
          }
        } catch (error) {
          console.error("Reverse geocoding error:", error);
          // Fallback to coordinates display
          setCustomer((prev) => ({
            ...prev,
            address: `${gpsLocation.lat.toFixed(6)}, ${gpsLocation.lng.toFixed(6)}`,
          }));
        }
      }
    };

    reverseGeocodeGPS();
  }, [gpsLocation, useNewAddress]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearCheckoutError();

    if (!cart?.items || cart.items.length === 0) {
      alert("Giỏ hàng của bạn đang trống");
      return;
    }

    const isValid = validateCheckout({
      customer,
      useNewAddress,
      selectedAddressId,
      items: cart.items,
    });

    if (!isValid) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    // Check if restaurant is still open
    try {
      const restaurant = await restaurantService.getById(cart.restaurant_id);
      if (!isRestaurantOpen(restaurant.opening_hours)) {
        alert("Xin lỗi, nhà hàng hiện đang đóng cửa. Vui lòng kiểm tra giờ mở cửa.");
        return;
      }
    } catch (error) {
      console.error("Error checking restaurant status:", error);
      alert("Lỗi kiểm tra trạng thái nhà hàng. Vui lòng thử lại.");
      return;
    }

    try {
      let finalGpsLocation = gpsLocation;
      let addressIdForOrder = selectedAddressId;

      // Always try to get GPS if not available - whether using new or saved address
      if (!finalGpsLocation) {
        const geocoded = await geocodeAddressToCoords(customer.address);
        if (geocoded) {
          finalGpsLocation = geocoded;
          console.log("Geocoded address to GPS:", geocoded);
        }
      }

      if (useNewAddress) {
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
        cart.restaurant_id,
        addressIdForOrder,
        finalGpsLocation,
        appliedPromotion,
        paymentMethod
      );

      if (!checkoutResult.success) {
        alert(`Lỗi thanh toán: ${checkoutResult.message}`);
        return;
      }

      let lastOrderId = null;
      for (const orderData of checkoutResult.orders) {
        const result = await addOrder(orderData);
        if (!result || !result.success) {
          alert(`Lỗi đơn hàng: ${result?.message || "Lỗi không xác định"}`);
          return;
        }
        lastOrderId = result.order?.id || result.order?._id;
      }

      await clearCart();

      if (lastOrderId) {
        // Navigate to appropriate payment page based on payment method
        if (paymentMethod === "card") {
          navigate(`/payment-card/${lastOrderId}`);
        } else {
          navigate(`/payment-momo/${lastOrderId}`);
        }
      } else {
        navigate("/myorders");
      }
    } catch (error) {
      console.error("Order error:", error);
      alert(error.message || "Có lỗi xảy ra khi đặt hàng!");
    }
  };

  const subtotal = getTotalCartAmount();
  const { discountAmount, deliveryFee, total } = calculateCartTotals(
    subtotal,
    appliedPromotion,
    deliveryFeeValue
  );

  // Validate and apply promotion with min order check
  const handleApplyPromotion = (promo) => {
    const minOrderValue = promo.minOrderValue || promo.min_order_value || 0;

    // Check minimum order value
    if (minOrderValue > 0 && subtotal < minOrderValue) {
      alert(`Đơn tối thiểu: ${formatCurrency(minOrderValue)}. Đơn hiện tại: ${formatCurrency(subtotal)}`);
      return;
    }

    // Check date range
    const now = new Date();
    const startDate = new Date(promo.startDate || promo.start_date);
    const endDate = new Date(promo.endDate || promo.end_date);

    if (now < startDate) {
      alert('Khuyến mãi chưa bắt đầu');
      return;
    }

    if (now > endDate) {
      alert('Khuyến mãi đã hết hạn');
      return;
    }

    // All validations passed
    setAppliedPromotion(promo);
  };

  return (
    <div className="checkout-page">
      <div className="checkout-left">
        <div className="checkout-info">
          <h2>Thanh toán</h2>
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
              onGetGPS={async () => {
                const result = await handleGetGPS();
                if (result.success && result.address) {
                  setCustomer(prev => ({ ...prev, address: result.address }));
                  markAsTouched('address');
                }
              }}
              getFieldError={getFieldError}
              setGpsLocationFn={setGpsLocation}
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
                  {/* <MdSave style={{ marginLeft: "8px", marginRight: "4px" }} /> */}
                  <span>Lưu địa chỉ này cho các đơn hàng sau</span>
                </label>
              </div>
            )}

            {/* Payment Method Selection */}
            <div className="payment-method-section">
              <h3>Phương thức thanh toán</h3>
              <div className="payment-options">
                <label
                  className={`payment-option ${paymentMethod === "momo" ? "active" : ""}`}
                  onClick={() => setPaymentMethod("momo")}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="momo"
                    checked={paymentMethod === "momo"}
                    onChange={() => setPaymentMethod("momo")}
                  />
                  <img src={momoIcon} alt="MoMo" className="payment-icon" />
                  <span>Ví MoMo</span>
                </label>
                <label
                  className={`payment-option ${paymentMethod === "card" ? "active" : ""}`}
                  onClick={() => setPaymentMethod("card")}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={paymentMethod === "card"}
                    onChange={() => setPaymentMethod("card")}
                  />
                  <MdCreditCard className="payment-icon card-icon" />
                  <span>Thẻ tín dụng/Ghi nợ</span>
                </label>
              </div>
            </div>

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
              {loadingSubmit ? "Đang xử lý..." : "Tiến hành thanh toán"}
            </button>
          </form>
        </div>
      </div>

      <div className="checkout-right">
        <CheckoutOrderSummary
          cart={cart}
          subtotal={subtotal}
          discountAmount={discountAmount}
          deliveryFee={deliveryFee}
          total={total}
          appliedPromo={appliedPromotion}
          promotions={applicablePromotions}
          loadingPromos={loadingPromos}
          onApplyPromo={handleApplyPromotion}
          onRemovePromo={() => setAppliedPromotion(null)}
        />
      </div>
    </div>
  );
};

export default CheckoutInfo;
