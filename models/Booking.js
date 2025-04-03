const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema(
    {
        houseboatId: { type: mongoose.Schema.Types.ObjectId, ref: "Houseboat", required: true },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        date: { type: String, required: true },
        type: { type: String, enum: ["Day Cruiser", "Night Stay"], required: true },
        guests: { type: Number, required: true, min: 1 },
        beds: { type: Number, required: true, min: 1 },
        totalPrice: { type: Number, required: true, min: 0 },
        status: { type: String, enum: ["pending", "approved", "rejected", "cancelled"], default: "pending" },
    },
    { timestamps: true }
);

const Booking = mongoose.models.Booking || mongoose.model("Booking", BookingSchema);

module.exports = Booking;
