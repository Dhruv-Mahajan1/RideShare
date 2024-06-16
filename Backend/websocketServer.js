const WebSocket = require("ws");
const { v4: uuidv4 } = require("uuid");

const wss = new WebSocket.Server({ port: 8080 });

const rides = {};

wss.on("connection", (ws, req) => {
  const url = new URL(req.url, `ws://${req.headers.host}`);
  const rideId = url.searchParams.get("rideId");
  const role = url.searchParams.get("role");

  if (!rideId || !role) {
    ws.close(1008, "Missing rideId or role");
    return;
  }

  if (rides[rideId] && rides[rideId].completed) {
    console.log(rides[rideId].completed);
    ws.close(1008, "Ride is complete, no further connections allowed");
    return;
  }

  if (!rides[rideId]) {
    rides[rideId] = {
      sender: null,
      receivers: [],
      completed: false,
    };
  }

  if (role === "sender") {
    rides[rideId].sender = ws;
  } else if (role === "receiver") {
    rides[rideId].receivers.push(ws);
  }

  console.log(`Client connected to ride: ${rideId} as ${role}`);

  ws.on("message", (message) => {
    const parsedMessage = JSON.parse(message);

    if (role === "sender") {
      if (parsedMessage.message === "reached the destination") {
        console.log(`Trip is complete for ride: ${rideId}`);
        rides[rideId].completed = true;

        rides[rideId].receivers.forEach((receiver) => {
          if (receiver.readyState === WebSocket.OPEN) {
            receiver.send(
              JSON.stringify({ message: "reached the destination" })
            );
          }
        });
        ws.close();
        rides[rideId].receivers.forEach((receiver) => receiver.close());
      } else {
        rides[rideId].receivers.forEach((receiver) => {
          if (receiver.readyState === WebSocket.OPEN) {
            receiver.send(message);
          }
        });
      }
    }
  });

  ws.on("close", () => {
    console.log(`Client  disconnected from ride: ${rideId} as ${role}`);
    if (role === "sender") {
      rides[rideId].sender = null;
    } else if (role === "receiver") {
      rides[rideId].receivers = rides[rideId].receivers.filter(
        (receiver) => receiver !== ws
      );
    }
  });
});

console.log("WebSocket server is running on ws://localhost:8080");
