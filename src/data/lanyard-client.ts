import type {LanyardData, LanyardRestPayload, LanyardSocketPayload} from "./lanyard.types";

const USER_ID = "548120702373593090";
const API_URL = `https://api.lanyard.rest/v1/users/${USER_ID}`;
const SOCKET_URL = "wss://api.lanyard.rest/socket";
const HEARTBEAT_MS = 30_000;
const SNAPSHOT_MS = 60_000;

type LanyardClientOptions = {
  onData: (data: LanyardData) => void;
  onInitialSettled: () => void;
};

export class LanyardClient {
  #abort?: AbortController;
  #dataRevision = 0;
  #heartbeat?: number;
  #lastSignature = "";
  #options: LanyardClientOptions;
  #reconnectAttempt = 0;
  #reconnectTimer?: number;
  #snapshotTimer?: number;
  #socket?: WebSocket;
  #started = false;
  #suspended = false;

  constructor(options: LanyardClientOptions) {
    this.#options = options;
  }

  start() {
    if (this.#started) return;
    this.#started = true;
    this.#listen();
    void this.#refreshSnapshot(true);
    this.#connect();
    this.#snapshotTimer = window.setInterval(() => {
      if (document.visibilityState === "visible") void this.#refreshSnapshot(false);
    }, SNAPSHOT_MS);
  }

  stop() {
    this.#started = false;
    this.#abort?.abort();
    window.clearInterval(this.#heartbeat);
    window.clearInterval(this.#snapshotTimer);
    window.clearTimeout(this.#reconnectTimer);
    this.#socket?.close();
    this.#socket = undefined;
    window.removeEventListener("online", this.#handleOnline);
    window.removeEventListener("offline", this.#handleOffline);
    document.removeEventListener("visibilitychange", this.#handleVisibility);
  }

  #apply(data: LanyardData) {
    const signature = JSON.stringify(data);
    if (signature === this.#lastSignature) return;
    this.#lastSignature = signature;
    this.#dataRevision += 1;
    this.#options.onData(data);
  }

  async #refreshSnapshot(initial: boolean) {
    if (!navigator.onLine) {
      if (initial) this.#options.onInitialSettled();
      return;
    }

    const revision = this.#dataRevision;
    this.#abort?.abort();
    const abort = new AbortController();
    this.#abort = abort;

    try {
      const response = await fetch(API_URL, {cache: "no-store", signal: abort.signal});
      if (!response.ok) return;
      const payload = await response.json() as LanyardRestPayload;
      if (payload.success && payload.data && revision === this.#dataRevision) this.#apply(payload.data);
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) {
        // The socket or next scheduled snapshot remains the source of recovery.
      }
    } finally {
      if (initial && this.#started) this.#options.onInitialSettled();
    }
  }

  #connect() {
    if (!this.#started || this.#suspended || !navigator.onLine) return;
    if (this.#socket?.readyState === WebSocket.CONNECTING || this.#socket?.readyState === WebSocket.OPEN) return;

    const socket = new WebSocket(SOCKET_URL);
    this.#socket = socket;

    socket.addEventListener("open", () => {
      if (this.#socket !== socket) return;
      socket.send(JSON.stringify({op: 2, d: {subscribe_to_id: USER_ID}}));
      window.clearInterval(this.#heartbeat);
      this.#heartbeat = window.setInterval(() => {
        if (socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify({op: 3}));
      }, HEARTBEAT_MS);
    });

    socket.addEventListener("message", (event) => {
      try {
        const payload = JSON.parse(String(event.data)) as LanyardSocketPayload;
        if ((payload.t !== "INIT_STATE" && payload.t !== "PRESENCE_UPDATE") || !payload.d) return;
        this.#reconnectAttempt = 0;
        this.#apply(payload.d as LanyardData);
      } catch {
        // Ignore malformed frames without interrupting a healthy connection.
      }
    });

    socket.addEventListener("error", () => socket.close());
    socket.addEventListener("close", () => {
      if (this.#socket !== socket) return;
      this.#socket = undefined;
      window.clearInterval(this.#heartbeat);
      this.#heartbeat = undefined;
      if (this.#started && !this.#suspended) {
        void this.#refreshSnapshot(false);
        this.#scheduleReconnect();
      }
    });
  }

  #scheduleReconnect() {
    if (this.#reconnectTimer !== undefined || !this.#started || this.#suspended || !navigator.onLine) return;
    const delay = Math.min(750 * 2 ** this.#reconnectAttempt, 30_000) + Math.random() * 350;
    this.#reconnectAttempt += 1;
    this.#reconnectTimer = window.setTimeout(() => {
      this.#reconnectTimer = undefined;
      this.#connect();
    }, delay);
  }

  #listen() {
    window.addEventListener("online", this.#handleOnline);
    window.addEventListener("offline", this.#handleOffline);
    document.addEventListener("visibilitychange", this.#handleVisibility);
  }

  #handleOnline = () => {
    this.#suspended = false;
    window.clearTimeout(this.#reconnectTimer);
    this.#reconnectTimer = undefined;
    void this.#refreshSnapshot(false);
    this.#connect();
  };

  #handleOffline = () => {
    this.#suspended = true;
    this.#socket?.close();
  };

  #handleVisibility = () => {
    this.#suspended = document.visibilityState === "hidden";
    if (this.#suspended) {
      this.#socket?.close();
      return;
    }
    void this.#refreshSnapshot(false);
    this.#connect();
  };
}
