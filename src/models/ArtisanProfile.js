const mongoose = require("mongoose");
const User = require("../models/User");

const artisanProfileSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        skills: {
            type: [String],
            required: true,
            enum: [
                "electrician",
                "plumber",
                "generator repair",
                "mechanic",
                "locksmith",
                "cleaner",
                "painter",
                "welder",
                "houseAgent",
                "chef",
                "laundry",
                "labourer",
                "declutter"
            ],
        },

        yearsOfExperience: {
            type: Number,
            default: 0,
        },

        bio: {
            type: String,
            default: "",
        },

        availabilityStatus: {
            type: Boolean,
            default: true,
        },

        serviceAreas: {
            type: [String],
            default: [],
        },

        ratingAverage: {
            type: Number,
            default: 0,
        },

        totalJobsCompleted: {
            type: Number,
            default: 0,
        },

        location: {
            type: {
                type: String,
                enum: ["Point"],
                default: "Point",
            },
            coordinates: {
                type: [Number],
                default: [0, 0],
            },
        },
    },
    { timestamps: true }
);
artisanProfileSchema.index({ location: "2dsphere" });

module.exports = mongoose.model(
    "ArtisanProfile",
    artisanProfileSchema
);