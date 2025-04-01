require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const { connectToDB } = require("./database");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

// Connect to MongoDB first
connectToDB().then(() => {
  console.log("==> Setting up Change Stream...");

  // Ensure the collection exists before watching changes
  const houseboatCollection = mongoose.connection.collection("houseboats");
  const changeStream = houseboatCollection.watch();

  changeStream.on("change", (change) => {
    if (change.operationType === "update") {
      const updatedFields = change.updateDescription.updatedFields;

      if (updatedFields.price) {
        const houseboatId = change.documentKey._id;
        const newPrice = updatedFields.price;

        console.log(`Price updated for houseboat ${houseboatId}: ₹${newPrice}`);
        io.emit("priceUpdated", { houseboatId, newPrice });
      }
    }
  });
});

// Handle client connections
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Start the server
const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Socket server running on http://localhost:${PORT}`);
});
