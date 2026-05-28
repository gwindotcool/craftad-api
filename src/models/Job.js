const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
    {
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        artisan: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        title: {
            type: String,
            required: true,
        },

        description: {
            type: String,
            required: true,
        },

        category: {
            type: String,
            required: true,
        },

        location: {
            type: {
                type: String,
                enum: ["Point"],
                default: "Point",
            },
            coordinates: {
                type: [Number],
                required: true,
            },
        },

        budget: {
            type: Number,
            required: true,
        },

        status: {
            type: String,
            enum: [
                "pending",
                "accepted",
                "in-progress",
                "completed",
                "cancelled",
            ],
            default: "pending",
        },
    },
    { timestamps: true }
);

jobSchema.index({ location: "2dsphere" });

module.exports = mongoose.model(
    "Job",
    jobSchema
);