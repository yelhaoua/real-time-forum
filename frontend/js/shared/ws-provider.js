// Global WebSocket provider — one connection shared across the entire app.
// Components subscribe to message types; the provider handles connect/reconnect.

const WS_URL = "ws://localhost:9090/ws";
const RECONNECT_DELAY = 3000;

const wsProvider = {
  ws: null,
  _listeners: new Map(), // type → Set<handler>
  _reconnectTimer: null,
  _intentionalClose: false,

  // Connect (idempotent — safe to call multiple times)
  connect() {
    if (this.ws && this.ws.readyState < WebSocket.CLOSING) return;

    this._intentionalClose = false;
    this.ws = new WebSocket(WS_URL);

    this.ws.onmessage = (event) => {
      let msg;
      try { msg = JSON.parse(event.data); } catch { return; }

      const type = msg.type || "message";
      this._emit(type, msg);
      this._emit("*", msg); // wildcard — receives everything
    };

    this.ws.onclose = () => {
      if (this._intentionalClose) return;
      // Auto-reconnect on unexpected close
      this._reconnectTimer = setTimeout(() => this.connect(), RECONNECT_DELAY);
    };

    this.ws.onerror = (err) => console.error("[ws-provider] error:", err);
  },

  // Disconnect and stop reconnecting (call on logout)
  disconnect() {
    this._intentionalClose = true;
    clearTimeout(this._reconnectTimer);
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  },

  // Send a payload — returns true if sent, false if not connected
  send(payload) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(payload));
      return true;
    }
    return false;
  },

  // Subscribe to a message type (use "*" for all messages)
  on(type, handler) {
    if (!this._listeners.has(type)) this._listeners.set(type, new Set());
    this._listeners.get(type).add(handler);
  },

  // Unsubscribe
  off(type, handler) {
    this._listeners.get(type)?.delete(handler);
  },

  _emit(type, msg) {
    this._listeners.get(type)?.forEach((fn) => fn(msg));
  },
};

export default wsProvider;
