require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const Houseboat = require("./models/Houseboat");
const Booking = require("./models/Booking"); // Import Booking model
const { connectToDB } = require("./database");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

// Function to watch MongoDB changes
async function watchChanges() {
  try {
    await connectToDB();
    console.log("==> Connected to MongoDB, Setting up Change Stream...");

    const houseboatCollection = mongoose.connection.collection("houseboats");
    const bookingCollection = mongoose.connection.collection("bookings");

    const houseboatStream = houseboatCollection.watch();
    const bookingStream = bookingCollection.watch();

    // Watching Houseboat updates
    houseboatStream.on("change", (change) => {
      if (change.operationType === "update") {
        console.log("Houseboat update detected.");
        const updatedFields = change.updateDescription.updatedFields;
        if (updatedFields !== undefined) {
          const houseboatId = change.documentKey._id;
          io.emit("houseboatUpdated", { houseboatId, updatedFields });
          console.log(`Emitted update for houseboat ${houseboatId}:`, updatedFields);
        }
      }
    });

    // Watching Booking updates
    bookingStream.on("change", (change) => {
      if (["insert", "update", "delete"].includes(change.operationType)) {
        console.log("Booking change detected.");
        const updatedFields = change.updateDescription.updatedFields;
        if (updatedFields !== undefined) {
          const bookingId = change.documentKey._id;
          console.log(bookingId);
          io.emit("bookingUpdated", {bookingId,updatedFields});
        }
      }
    });

    // Handle errors
    houseboatStream.on("error", handleChangeStreamError);
    bookingStream.on("error", handleChangeStreamError);
  } catch (error) {
    console.error("Error setting up Change Stream:", error);
    setTimeout(watchChanges, 5000);
  }
}

// Error handler for Change Stream
function handleChangeStreamError(err) {
  console.error("Change Stream Error:", err);
  setTimeout(watchChanges, 3000);
}

// Start watching MongoDB changes
watchChanges();

// Handle client connections
io.on("connection", async (socket) => {
  console.log("Client connected:", socket.id);

  // Fetch all bookings when a client connects


  // Fetch bookings manually if requested
  socket.on("fetchBookings", async (ownerId) => {
    try {
      console.log(ownerId.ownerId)
      const bookings = await Booking.find({ownerId:ownerId.ownerId}).sort({createdAt:-1}).populate("houseboatId", "name");
      bookings.map((b) => ({
        _id: b._id,
        houseboat: {
            name: b.houseboatId.name,
            location: b.houseboatId.location,
            image: b.houseboatId.images,
        },
        date: b.date,
        status: b.status,
        guests: b.guests,
        beds: b.beds,
        type: b.type,
        totalPrice: b.totalPrice,
    })),
      socket.emit("initialBookings", bookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Start the server
const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Socket server running on http://localhost:${PORT}`);
});
