const Houseboat = require("../models/Houseboat");
const Booking = require("../models/Booking");

module.exports = function registerSocketHandlers(socket) {
  console.log("Client connected:", socket.id);

  socket.on("getHouseboat", async (houseboatId) => {
    try {
      const houseboat = await Houseboat.findById(houseboatId);
      socket.emit("houseboatData", houseboat);
    } catch (error) {
      console.error("Error fetching houseboat:", error);
    }
  });

  socket.on("fetchBookings", async ({ ownerId }) => {
    try {
      const bookings = await Booking.find({ ownerId })
        .sort({ createdAt: -1 })
        .populate("houseboatId", "name");

      socket.emit("initialBookings", bookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
};
