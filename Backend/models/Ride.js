const mongoose = require("mongoose");

const rideSchema = new mongoose.Schema({
  rideId: { type: String, required: true },
  traveller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  driverName: { type: String, required: true },
  driverPhone: { type: String, required: true },
  carModel: { type: String, required: true },
  carNumber: { type: String, required: true },
  pickupLocation: { type: String, required: true },
  dropoffLocation: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },

  feedback: { type: String, enum: ["1", "2", "3", "4", "5"], required: false },
  rideDate: { type: Date, required: true },
  status: { type: String, enum: ["pending", "completed"], default: "pending" },
});

module.exports = mongoose.model("Ride", rideSchema);
