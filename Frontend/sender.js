const WebSocket = require("ws");

const wsUrl = `ws://localhost:8080?rideId=22c4becd-7d2d-4413-8120-9921399c6a2f&role=sender`;
const destinationlongitude = 11;
const destinationlatitude = 2;
const ws = new WebSocket(wsUrl);

currentlatitude = 0;
currentlongitude = 0;

function getCoordinates() {
  currentlatitude = currentlatitude + 1;
  currentlongitude = currentlongitude + 1;
  return {
    latitude: Math.min(currentlatitude, destinationlatitude),
    longitude: Math.min(currentlongitude, destinationlongitude),
  };
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  return Math.sqrt(Math.pow(lat2 - lat1, 2) + Math.pow(lon2 - lon1, 2));
}

function sendCoordinates() {
  if (ws.readyState === WebSocket.OPEN) {
    const coordinates = getCoordinates();

    if (
      coordinates.latitude === destinationlatitude &&
      coordinates.longitude === destinationlongitude
    ) {
      ws.send(JSON.stringify({ message: "reached the destination" }));
      console.log("Sent message: reached the destination");
      ws.close();
      console.log("WebSocket connection closed.");
    } else {
      const distance = calculateDistance(
        coordinates.latitude,
        coordinates.longitude,
        destinationlatitude,
        destinationlongitude
      );

      if (distance <= 3) {
        ws.send(
          JSON.stringify({ message: "nearby", coordinates: coordinates })
        );
        console.log("Sent message: nearby");
      } else {
        ws.send(JSON.stringify(coordinates));
        console.log(`Sent coordinates: ${JSON.stringify(coordinates)}`);
      }
    }
  }
}

ws.on("open", () => {
  console.log("Connected to WebSocket server as sender");
  setInterval(sendCoordinates, 3000);
});

ws.on("message", (message) => {
  console.log(`Received message: ${message}`);
});

ws.on("error", (error) => {
  console.error(`WebSocket error: ${error.message}`);
});

ws.on("close", (code, reason) => {
  console.log(`WebSocket connection closed: ${code} ${reason}`);
});
