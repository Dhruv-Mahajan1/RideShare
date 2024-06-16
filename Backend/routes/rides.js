const express = require("express");
const router = express.Router();
const Ride = require("../models/Ride");
const auth = require("../middlewares/auth");
const role = require("../middlewares/role");
const { v4: uuidv4 } = require("uuid");

const generateDriverDetails = () => {
  const names = ["Rajesh Kumar", "Amit Singh", "Vikram Sharma", "Manoj Verma"];
  const carModels = ["Maruti Swift", "Hyundai i20", "Honda City", "Tata Nexon"];
  const phoneNumbers = ["9876543210", "9123456789", "9823456710", "9988776655"];
  const carNumbers = ["MH12AB1234", "DL3CAB5678", "KA01CD2345", "TN10EF4567"];

  return {
    driverName: names[Math.floor(Math.random() * names.length)],
    driverPhone: phoneNumbers[Math.floor(Math.random() * phoneNumbers.length)],
    carModel: carModels[Math.floor(Math.random() * carModels.length)],
    carNumber: carNumbers[Math.floor(Math.random() * carNumbers.length)],
  };
};
const generatecordinates = () => {
  return {
    longitude: Math.floor(Math.random() * 20) + 1,
    latitude: Math.floor(Math.random() * 20) + 1,
  };
};

router.post("/create", auth, role("traveller"), async (req, res) => {
  const { pickupLocation, dropoffLocation, rideDate } = req.body;
  const rideId = uuidv4();
  try {
    const driverDetails = generateDriverDetails();
    const cordinates = generatecordinates();
    const ride = new Ride({
      rideId,
      traveller: req.user.id,
      pickupLocation,
      dropoffLocation,
      rideDate,
      ...cordinates,
      ...driverDetails,
    });
    await ride.save();

    const wsHost = "ws://localhost:8080";
    const senderUrl = `${wsHost}?rideId=${rideId}&role=sender`;
    const receiverUrl = `${wsHost}?rideId=${rideId}&role=receiver`;

    res.status(201).json({
      message: "Ride created successfully",
      ride,
      webSocketUrls: {
        sender: senderUrl,
        receiver: receiverUrl,
      },
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post("/feedback", auth, role("traveller"), async (req, res) => {
  const { rideId, feedback } = req.body;

  try {
    const ride = await Ride.findOne({ rideId, traveller: req.user.id });
    console.log(req.user.id);
    if (!ride) {
      return res
        .status(404)
        .send("Ride not found or not associated with this traveller.");
    }
    ride.feedback = feedback;
    ride.status = "completed";
    await ride.save();

    res.send(ride);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal server error.");
  }
});

router.get("/admin/rides", auth, role("admin"), async (req, res) => {
  try {
    const rides = await Ride.find();
    res.send(rides);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal server error.");
  }
});

router.get("/admin/rides/completed", auth, role("admin"), async (req, res) => {
  try {
    const completedRides = await Ride.find({ status: "completed" });
    res.send(completedRides);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal server error.");
  }
});

module.exports = router;
