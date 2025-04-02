const mongoose = require("mongoose");
const { Schema } = mongoose;

const BookingSchema = new Schema(
    {
        houseboatId: { type: Schema.Types.ObjectId, ref: "Houseboat", required: true },
        userId: { type: Schema.Types.ObjectId, ref: "User ", required: true },
        ownerId: { type: Schema.Types.ObjectId, ref: "User ", required: true },
        date: { type: String, required: true },
        type: { type: String, enum: ["Day Cruiser", "Night Stay"], required: true },
        guests: { type: Number, required: true, min: 1 },
        beds: { type: Number, required: true, min: 1 },
        totalPrice: { type: Number, required: true, min: 0 },
        status: { type: String, enum: ["pending", "approved", "rejected", "cancelled"], default: "pending" },
    },
    { timestamps: true }
);

// Ensure the model is only created once
const Booking = mongoose.models.Booking || mongoose.model("Booking", BookingSchema);

module.exports = Booking;