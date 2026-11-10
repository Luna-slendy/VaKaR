/**
 * WebSocket sagatave. Jāizsauc tikai pēc OAuth autentifikācijas ieviešanas.
 * Publicētajā vidē adresei jāizmanto wss://. WebAPI jānodrošina savienojuma autentifikācija.
 */
export function connectChatSocket({ onMessage, onStatus } = {}) {
  const url = import.meta.env.VITE_WS_URL;
  if (!url) {
    onStatus?.("offline");
    return { send: () => {}, close: () => {} };
  }

  const socket = new WebSocket(url);
  socket.addEventListener("open", () => onStatus?.("online"));
  socket.addEventListener("close", () => onStatus?.("offline"));
  socket.addEventListener("error", () => onStatus?.("error"));
  socket.addEventListener("message", (event) => {
    try {
      onMessage?.(JSON.parse(event.data));
    } catch {
      onMessage?.({ type: "raw", payload: event.data });
    }
  });

  return {
    send(payload) {
      if (socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify(payload));
    },
    close() {
      socket.close();
    },
  };
}
