const mongoose = require("mongoose");
const handleChangeStreamError = require("../utils/handleStreamError");

async function watchChanges(io) {
  try {
    if (mongoose.connection.readyState !== 1) {
      throw new Error("MongoDB not connected (is replica set enabled?)");
    }

    const houseboatStream = mongoose.connection.collection("houseboat").watch();
    const bookingStream = mongoose.connection.collection("bookings").watch();

    houseboatStream.on("change", (change) => {
      if (change.operationType === "update") {
        const { updatedFields } = change.updateDescription;
        const houseboatId = change.documentKey._id;
        io.emit("houseboatUpdated", { houseboatId, updatedFields });
      }
    });

    bookingStream.on("change", (change) => {
      const { updatedFields } = change.updateDescription || {};
      const bookingId = change.documentKey._id;
      io.emit("bookingUpdated", { bookingId, updatedFields });
    });

    houseboatStream.on("error", (err) => handleChangeStreamError(err, io));
    bookingStream.on("error", (err) => handleChangeStreamError(err, io));
  } catch (err) {
    console.error("Change Stream Setup Failed:", err);
    setTimeout(() => watchChanges(io), 5000);
  }
}

module.exports = watchChanges;
