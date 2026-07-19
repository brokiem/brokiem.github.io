import type * as Lanyard from "lanyard-wrapper";
import {$data, $isLoading} from "./store";

const USER_ID = "548120702373593090";
const API_URL = `https://api.lanyard.rest/v1/users/${USER_ID}`;
const WEBSOCKET_URL = "wss://api.lanyard.rest/socket";
const HEARTBEAT_INTERVAL = 30_000;
const SNAPSHOT_INTERVAL = 60_000;

let activeSocket: WebSocket | undefined;
let heartbeatTimer: number | undefined;
let reconnectTimer: number | undefined;
let reconnectAttempt = 0;
let dataRevision = 0;
let lastDataSignature = "";
let hasStarted = false;

function applyPresence(data: Lanyard.Data) {
  const signature = JSON.stringify(data);
  if (signature === lastDataSignature) return;

  lastDataSignature = signature;
  dataRevision += 1;
  $data.set(data);
  $isLoading.set(false);
}

async function refreshSnapshot() {
  if (!navigator.onLine) return;

  const revisionAtStart = dataRevision;

  try {
    const response = await fetch(API_URL, {cache: "no-store"});
    if (!response.ok) return;

    const payload = await response.json() as {success: boolean; data?: Lanyard.Data};
    if (!payload.success || !payload.data || dataRevision !== revisionAtStart) return;
    applyPresence(payload.data);
  } catch {
    // The WebSocket or the next scheduled snapshot will retry without
    // replacing the last known presence with an error state.
  }
}

function clearHeartbeat() {
  window.clearInterval(heartbeatTimer);
  heartbeatTimer = undefined;
}

function scheduleReconnect() {
  if (reconnectTimer !== undefined || document.visibilityState === "hidden" || !navigator.onLine) return;

  const delay = Math.min(1000 * 2 ** reconnectAttempt, 30_000) + Math.random() * 400;
  reconnectAttempt += 1;
  reconnectTimer = window.setTimeout(() => {
    reconnectTimer = undefined;
    connectWebSocket();
  }, delay);
}

function connectWebSocket() {
  if (
    !navigator.onLine
    || activeSocket?.readyState === WebSocket.CONNECTING
    || activeSocket?.readyState === WebSocket.OPEN
  ) return;

  let socket: WebSocket;
  try {
    socket = new WebSocket(WEBSOCKET_URL);
  } catch {
    scheduleReconnect();
    return;
  }
  activeSocket = socket;

  socket.addEventListener("open", () => {
    if (activeSocket !== socket) return;

    socket.send(JSON.stringify({op: 2, d: {subscribe_to_id: USER_ID}}));
    clearHeartbeat();
    heartbeatTimer = window.setInterval(() => {
      if (socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify({op: 3}));
    }, HEARTBEAT_INTERVAL);
  });

  socket.addEventListener("message", (event) => {
    try {
      const message = JSON.parse(String(event.data)) as {t?: string; d?: Lanyard.Data};
      if ((message.t !== "INIT_STATE" && message.t !== "PRESENCE_UPDATE") || !message.d) return;

      reconnectAttempt = 0;
      applyPresence(message.d);
    } catch {
      // Ignore malformed frames and keep the healthy socket alive.
    }
  });

  socket.addEventListener("error", () => socket.close());
  socket.addEventListener("close", () => {
    if (activeSocket !== socket) return;

    activeSocket = undefined;
    clearHeartbeat();
    void refreshSnapshot();
    scheduleReconnect();
  });
}

export function startLivePresence() {
  if (hasStarted) return;
  hasStarted = true;

  void refreshSnapshot();
  connectWebSocket();

  window.addEventListener("online", () => {
    window.clearTimeout(reconnectTimer);
    reconnectTimer = undefined;
    void refreshSnapshot();
    connectWebSocket();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState !== "visible") return;
    void refreshSnapshot();
    connectWebSocket();
  });

  window.setInterval(() => {
    if (document.visibilityState === "visible") void refreshSnapshot();
  }, SNAPSHOT_INTERVAL);
}
