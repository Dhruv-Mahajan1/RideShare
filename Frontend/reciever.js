const WebSocket = require("ws");

const wsUrl = `ws://localhost:8080?rideId=22c4becd-7d2d-4413-8120-9921399c6a2f&role=receiver`;

const ws = new WebSocket(wsUrl);

ws.on("open", () => {
  console.log("Connected to WebSocket server as receiver");
});

ws.on("message", (message) => {
  const message1 = JSON.parse(message);
  console.log(message1);
});

ws.on("error", (error) => {
  console.error(`WebSocket error: ${error.message}`);
});

ws.on("close", (code, reason) => {
  console.log(`WebSocket connection closed: ${code} ${reason}`);
});
