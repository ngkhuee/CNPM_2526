import React from "react";
import { Modal } from "../Modal/Modal";
import "./OrderDetailModal.css";

export const OrderDetailModal = ({ isOpen, onClose, order }) => {
  if (!order) return null;

  const formatCurrency = (v) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(v || 0);
  };

  // Parse timestamps
  const getFormattedDate = (dateStr) => {
    if (!dateStr) return "Unknown";
    try {
      return new Date(dateStr).toLocaleString("vi-VN");
    } catch {
      return "Invalid date";
    }
  };

  const orderPlacedTime = getFormattedDate(order.created_at || order.createdAt);
  const completedTime = order.status === "completed"
    ? getFormattedDate(order.updated_at || order.updatedAt)
    : null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Order #${order.id}`}
      width="900px"
    >
      <div className="odm-body">
        {/* Row 1: Customer & Restaurant */}
        <div className="odm-row">
          <section className="odm-section odm-half">
            <h4>Customer</h4>
            <p>
              <strong>Name:</strong>
              <span>
                {order.customer?.name ||
                  order.user?.full_name ||
                  order.userName ||
                  order.full_name ||
                  "-"}
              </span>
            </p>
            <p>
              <strong>ID:</strong>
              <span>{order.user_id || order.userId || "-"}</span>
            </p>
            <p>
              <strong>Phone:</strong>
              <span>
                {order.customer?.phone ||
                  order.user?.phone ||
                  order.phone ||
                  "N/A"}
              </span>
            </p>
            <p>
              <strong>Address:</strong>
              <span>
                {order.customer?.address ||
                  order.delivery_address ||
                  order.address ||
                  "-"}
              </span>
            </p>
          </section>

          <section className="odm-section odm-half">
            <h4>Restaurant</h4>
            <p>
              <strong>Name:</strong>
              <span>
                {order.restaurant?.name || order.restaurantName || "N/A"}
              </span>
            </p>
            <p>
              <strong>Address:</strong>
              <span>
                {order.restaurant?.address || order.restaurantAddress || "N/A"}
              </span>
            </p>
            <p>
              <strong>ID:</strong>
              <span className="value-highlight">
                {order.restaurant_id || order.restaurantId || "-"}
              </span>
            </p>
            <p>
              <strong>Phone:</strong>
              <span>
                {order.restaurant?.phone || order.restaurantPhone || "N/A"}
              </span>
            </p>
          </section>
        </div>

        {/* Row 2: Order Status (with Order Info merged) */}
        <section className="odm-section">
          <h4>Order Status</h4>
          <p>
            <strong>Status:</strong>
            <span className="odm-status-badge">
              {order.status || "Unknown"}
            </span>
          </p>
          <p>
            <strong>Payment Method:</strong>
            <span className="odm-payment-badge">
              {order.payment_method || order.paymentMethod || "N/A"}
            </span>
          </p>
          <p>
            <strong>Payment Status:</strong>
            <span>
              {order.payment_status || order.paymentStatus || "N/A"}
            </span>
          </p>
          <p>
            <strong>Order Placed:</strong>
            <span>{orderPlacedTime}</span>
          </p>
          {completedTime && (
            <p>
              <strong>Completed:</strong>
              <span>{completedTime}</span>
            </p>
          )}
        </section>

        {/* Row 3: Order & Payment Info combined */}
        <section className="odm-section">
          <h4>Order Summary</h4>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px" }}>
            <div style={{ paddingLeft: "15px" }} >
              <h5 style={{ marginBottom: "10px" }} >Items</h5>
              <ul>
                {order.items && order.items.length > 0 ? (
                  order.items.map((it, idx) => (
                    <li key={idx}>
                      <span>
                        <strong>{it.name}</strong> × {it.quantity}
                      </span>
                      <span className="value-highlight">
                        {formatCurrency(
                          it.subtotal || it.unit_price || it.unitPrice
                        )}
                      </span>
                    </li>
                  ))
                ) : (
                  <li>No items</li>
                )}
              </ul>
            </div>
            <div>
              <h5 style={{ marginBottom: "10px" }} >Payment Details</h5>
              <div style={{ paddingLeft: "20x" }} >
                <p>
                  <strong>Subtotal:</strong>
                  <span className="odm-amount" style={{ color: "#000" }} >
                    {formatCurrency(
                      order.subtotal || order.sub_total || 0
                    )}
                  </span>
                </p>
                <p>
                  <strong>Delivery Fee:</strong>
                  <span className="odm-amount" style={{ color: "#000" }} >
                    {formatCurrency(order.delivery_fee || order.deliveryFee || 0)}
                  </span>
                </p>
                <p>
                  <strong>Discount:</strong>
                  <span className="odm-amount odm-discount">
                    -{formatCurrency(
                      order.discount_amount || order.discountAmount || 0
                    )}
                  </span>
                </p>
                <p style={{ borderTop: "1px solid #ddd", paddingTop: "8px", marginTop: "8px" }}>
                  <strong>Total:</strong>
                  <span className="odm-amount odm-total">
                    {formatCurrency(
                      order.total_amount || order.totalPrice || order.totalAmount || 0
                    )}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Row 4: Delivery Info */}
        <section className="odm-section">
          <h4>Delivery Info</h4>
          <p>
            <strong>Drone:</strong>
            <span>
              {order.drone_id || order.droneId
                ? `${order.drone_id || order.droneId} - ${order.drone_name || order.droneName || ""}`.trim()
                : "Not assigned"}
            </span>
          </p>
          <p>
            <strong>Restaurant Address:</strong>
            <span>
              {order.restaurant?.address || order.restaurantAddress || "N/A"}
            </span>
          </p>
          <p>
            <strong>Customer Address:</strong>
            <span>
              {order.customer?.address ||
                order.delivery_address ||
                order.address ||
                "N/A"}
            </span>
          </p>
          {(order.special_instructions || order.specialInstructions) && (
            <p>
              <strong>Special Instructions:</strong>
              <span>
                {order.special_instructions || order.specialInstructions}
              </span>
            </p>
          )}
        </section>
      </div>
    </Modal>
  );
};

export default OrderDetailModal;
