
const WS_URL = "ws://localhost:9090/ws";
const BASE_RECONNECT_DELAY = 1000;
const MAX_RECONNECT_DELAY = 30000;

let ws = null;
let reconnectTimer = null;
let reconnectAttempts = 0;
let isIntentionalClose = false;

const listeners = new Map(); 
const queue = []; 

function cleanupWs() {
  if (ws) {
    ws.onopen = null;
    ws.onmessage = null;
    ws.onclose = null;
    ws.onerror = null;
    ws = null;
  }
}

function emit(type, data) {
  listeners.get(type)?.forEach((fn) => fn(data));
}

function flushQueue() {
  while (queue.length > 0 && ws?.readyState === WebSocket.OPEN) {
    const payload = queue.shift();
    ws.send(JSON.stringify(payload));
  }
}

export function connect() {
  if (ws && ws.readyState < WebSocket.CLOSING) return;

  isIntentionalClose = false;
  clearTimeout(reconnectTimer);

  ws = new WebSocket(WS_URL);

  ws.onopen = () => {
    reconnectAttempts = 0;
    flushQueue();
    emit("connection", { status: "connected" });
  };

  ws.onmessage = (event) => {
    let msg;
    try {
      msg = JSON.parse(event.data);
    } catch {
      return;
    }

    const type = msg.type || "message";
    emit(type, msg);
    emit("*", msg); 
  };

  ws.onclose = () => {
    cleanupWs();
    if (isIntentionalClose) return;

    emit("connection", { status: "disconnected" });

    const delay = Math.min(
      BASE_RECONNECT_DELAY * Math.pow(2, reconnectAttempts),
      MAX_RECONNECT_DELAY,
    );
    reconnectAttempts++;
    reconnectTimer = setTimeout(connect, delay);
  };

  ws.onerror = (err) => {
    console.error("[ws] error:", err);
  };
}

export function disconnect() {
  isIntentionalClose = true;
  clearTimeout(reconnectTimer);
  if (ws) {
    ws.close();
    cleanupWs();
  }
}

export function send(payload) {
  if (ws?.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(payload));
    return true;
  }

  if (!ws || ws.readyState === WebSocket.CONNECTING) {
    queue.push(payload);
    if (!ws) connect();
    return true;
  }

  return false;
}

export function on(type, handler) {
  if (!listeners.has(type)) {
    listeners.set(type, new Set());
  }
  listeners.get(type).add(handler);

  return () => off(type, handler);
}

export function off(type, handler) {
  const handlers = listeners.get(type);
  if (handlers) {
    handlers.delete(handler);
    if (handlers.size === 0) listeners.delete(type);
  }
}
