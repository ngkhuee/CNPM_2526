class WebSocketService {
  constructor() {
    this.ws = null;
    this.listeners = {};
    this.reconnectInterval = 5000;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  connect(url = "ws://localhost:4000") {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log("WebSocket already connected");
      return;
    }

    try {
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        console.log("✅ WebSocket connected");
        this.reconnectAttempts = 0;
        this.emit("connected");
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("📩 WebSocket message:", data);

          // Emit event based on message type
          if (data.type) {
            this.emit(data.type, data.payload);
          }

          // Generic message event
          this.emit("message", data);
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      this.ws.onerror = (error) => {
        console.error(" WebSocket error:", error);
        this.emit("error", error);
      };

      this.ws.onclose = () => {
        console.log("🔌 WebSocket disconnected");
        this.emit("disconnected");
        this.attemptReconnect();
      };
    } catch (error) {
      console.error("Failed to connect WebSocket:", error);
      this.attemptReconnect();
    }
  }

  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(
        `Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`
      );

      setTimeout(() => {
        this.connect();
      }, this.reconnectInterval);
    } else {
      console.error("Max reconnection attempts reached");
      this.emit("reconnect_failed");
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.listeners = {};
    }
  }

  send(type, payload) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message = JSON.stringify({ type, payload });
      this.ws.send(message);
      console.log("📤 WebSocket send:", { type, payload });
    } else {
      console.error("WebSocket is not connected");
    }
  }

  // Track specific order
  trackOrder(orderId) {
    this.send("track_order", { orderId });
  }

  // Subscribe to restaurant updates
  subscribeRestaurant(restaurantId) {
    this.send("subscribe_restaurant", { restaurantId });
  }

  // Event listener management
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);

    // Return unsubscribe function
    return () => {
      this.off(event, callback);
    };
  }

  off(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(
        (cb) => cb !== callback
      );
    }
  }

  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in listener for ${event}:`, error);
        }
      });
    }
  }
}

// Create singleton instance
const websocketService = new WebSocketService();

export default websocketService;

// Event types you can listen to:
// - "connected": WebSocket connection established
// - "disconnected": WebSocket connection closed
// - "error": WebSocket error occurred
// - "message": Any message received
// - "order_status_change": Order status updated
// - "gps_update": GPS location updated
// - "restaurant_confirms": Restaurant confirmed order
// - "delivery_completed": Order delivered
// - "reconnect_failed": Max reconnection attempts reached
