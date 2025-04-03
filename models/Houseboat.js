const mongoose = require("mongoose");

const HouseboatSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        name: { type: String, required: true },
        description: { type: String, required: true },
        location: { type: String, required: true },
        beds: { type: Number, required: true },
        maxPeople: { type: Number, required: true },
        price: { type: Number, required: true },
        rating: { type: Number, default: 3 },
        rateCount: { type: Number, default: 0 },
        dates: {
            type: Map,
            of: new mongoose.Schema({
                price: Number,
                available: Boolean,
                dayCruiser: Boolean,
                nightStay: Boolean,
                dayCruiserBooked: { type: Boolean, default: false },
                nightStayBooked: { type: Boolean, default: false },
                pricePerDay: Number,
                pricePerNight: Number,
                extraPricePerBed: Number,
            }),
            default: {},
        },
        amenities: { type: [String], required: true },
        food: {
            veg: { type: [String], required: true },
            nonVeg: { type: [String], required: true },
        },
        images: { type: [String], required: true },
        isAvailable: { type: Boolean, default: true },
        isVerified: { type: Boolean, default: false },
        updatedAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

const Houseboat = mongoose.models.Houseboat || mongoose.model("Houseboat", HouseboatSchema);

module.exports = Houseboat;