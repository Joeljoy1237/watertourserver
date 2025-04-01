require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const Houseboat = require("./models/Houseboat");
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
    const changeStream = houseboatCollection.watch();

    changeStream.on("change", (change) => {
console.log("Sucess 1")
      if (change.operationType === "update") {
        console.log("Sucess 2")
        const updatedFields = change.updateDescription.updatedFields;
        // Check if relevant fields changed
        console.log(updatedFields)
        console.log(updatedFields.dates)
        if (
          updatedFields !== undefined
        ) {
          const houseboatId = change.documentKey._id;
          console.log("Sucess 3")
          // Emit the updated fields to clients
          io.emit("houseboatUpdated", {
            houseboatId,
            updatedFields
          });
          console.log("Sucess 4")

          console.log(`Emitted update for houseboat ${houseboatId}:`, updatedFields);
        }
      }
    });

    changeStream.on("error", (err) => {
      console.error("Change Stream Error:", err);
      setTimeout(() => {
        console.log("Reconnecting to Change Stream...");
        watchChanges(); // Reinitialize the change stream
      }, 3000);
    });

  } catch (error) {
    console.error("Error setting up Change Stream:", error);
    setTimeout(() => {
      console.log("Retrying Change Stream setup...");
      watchChanges();
    }, 5000);
  }
}

// Start watching changes
watchChanges();

// Handle client connections
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("getHouseboat", async (houseboatId) => {
    try {
      const houseboat = await Houseboat.findById(houseboatId);
      socket.emit("houseboatData", houseboat);
    } catch (error) {
      console.error("Error fetching houseboat data:", error);
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
