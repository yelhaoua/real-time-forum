// websocket.js

const WS_URL = "ws://localhost:9090/ws";
const BASE_RECONNECT_DELAY = 1000;
const MAX_RECONNECT_DELAY = 30000;

// متغيرات خاصة بالـ Module (مخفية تماماً وخالية من this)
let ws = null;
let reconnectTimer = null;
let reconnectAttempts = 0;
let isIntentionalClose = false;

const listeners = new Map(); // type -> Set<handler>
const queue = []; // طابور الرسائل في حالة عدم الجاهزية

// تنظيف الأحداث القديمة لمنع التداخل
function cleanupWs() {
  if (ws) {
    ws.onopen = null;
    ws.onmessage = null;
    ws.onclose = null;
    ws.onerror = null;
    ws = null;
  }
}

// إطلاق الأحداث للمستمعين
function emit(type, data) {
  listeners.get(type)?.forEach((fn) => fn(data));
}

// تفريغ طابور الرسائل عند فتح الاتصال
function flushQueue() {
  while (queue.length > 0 && ws?.readyState === WebSocket.OPEN) {
    const payload = queue.shift();
    ws.send(JSON.stringify(payload));
  }
}

// 1. بدء الاتصال (Idempotent)
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
    emit("*", msg); // Wildcard
  };

  ws.onclose = () => {
    cleanupWs();
    if (isIntentionalClose) return;

    emit("connection", { status: "disconnected" });

    // حساب وقت إعادة الاتصال الأسي (Exponential Backoff)
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

// 2. إغلاق الاتصال نهائياً
export function disconnect() {
  isIntentionalClose = true;
  clearTimeout(reconnectTimer);
  if (ws) {
    ws.close();
    cleanupWs();
  }
}

// 3. إرسال بيانات (يدعم التخزين المؤقت إذا كان الاتصال يجهز)
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

// 4. الاشتراك في الأسلوب الوظيفي (ترجع دالة إلغاء تلقائية)
export function on(type, handler) {
  if (!listeners.has(type)) {
    listeners.set(type, new Set());
  }
  listeners.get(type).add(handler);

  // Unsubscribe function
  return () => off(type, handler);
}

// 5. إلغاء الاشتراك يدوياً
export function off(type, handler) {
  const handlers = listeners.get(type);
  if (handlers) {
    handlers.delete(handler);
    if (handlers.size === 0) listeners.delete(type);
  }
}
