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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Order #${order.id}`}
      width="900px"
    >
      <div className="odm-body">
        {/* Row 1: Customer & Items */}
        <div className="odm-row">
          <section className="odm-section odm-half">
            <h4>Customer</h4>
            <p>
              <strong>Name:</strong>
              <span>
                {order.user?.full_name ||
                  order.userName ||
                  order.full_name ||
                  "-"}
              </span>
            </p>
            <p>
              <strong>ID:</strong>
              <span>{order.user_id || order.userId || "-"}</span>
            </p>
          </section>

          <section className="odm-section odm-half">
            <h4>Payment Summary</h4>
            <p>
              <strong>Subtotal:</strong>
              <span className="odm-amount odm-subtotal">
                {formatCurrency(
                  order.subtotal || order.sub_total || order.total_amount
                )}
              </span>
            </p>
            <p>
              <strong>Delivery Fee:</strong>
              <span className="odm-amount odm-delivery-fee">
                {formatCurrency(order.delivery_fee || order.deliveryFee)}
              </span>
            </p>
            <p>
              <strong>Total:</strong>
              <span className="odm-amount odm-total">
                {formatCurrency(
                  order.total_amount || order.total || order.totalAmount
                )}
              </span>
            </p>
          </section>
        </div>

        {/* Row 2: Items (full width) */}
        <section className="odm-section">
          <h4>Order Items</h4>
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
        </section>

        {/* Row 3: Delivery & Details */}
        <div className="odm-row">
          <section className="odm-section odm-half">
            <h4>Delivery</h4>
            <p>
              <strong>Address:</strong>
              <span>
                {order.address ||
                  order.delivery_address ||
                  (order.addressId ? `Address ID: ${order.addressId}` : "-")}
              </span>
            </p>
            <p>
              <strong>Estimated:</strong>
              <span>
                {order.estimated_delivery_time ||
                  order.estimatedDeliveryTime ||
                  "Not specified"}
              </span>
            </p>
            <p>
              <strong>Drone:</strong>
              <span className="value-highlight">
                {order.drone_id || order.droneId || "Not assigned"}
              </span>
            </p>
          </section>

          <section className="odm-section odm-half">
            <h4>Order Info</h4>
            <p>
              <strong>Status:</strong>
              <span className="odm-status-badge">
                {order.status || "Unknown"}
              </span>
            </p>
            <p>
              <strong>Payment:</strong>
              <span className="odm-payment-badge">
                {order.payment_method || order.paymentMethod || "N/A"}
              </span>
            </p>
            <p>
              <strong>Date:</strong>
              <span>
                {order.created_at || order.createdAt
                  ? new Date(
                      order.created_at || order.createdAt
                    ).toLocaleString()
                  : "Unknown"}
              </span>
            </p>
          </section>
        </div>
      </div>
    </Modal>
  );
};

export default OrderDetailModal;
