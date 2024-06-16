const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
require("./websocketServer");
dotenv.config();

const app = express();

app.use(express.json());

const userRoutes = require("./routes/users");
const rideRoutes = require("./routes/rides");
app.use("/api/users", userRoutes);
app.use("/api/rides", rideRoutes);

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI).then(() => {
      console.log("Connected to MongoDB");
    });
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error("Error connecting to MongoDB", error);
    process.exit(1);
  }
};

startServer();
