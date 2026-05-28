const mongoose = require("mongoose");

const emergencyRequestSchema =
    new mongoose.Schema(
        {
            customerId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },

            assignedArtisan: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                default: null,
            },

            category: {
                type: String,
                required: true,
            },

            description: {
                type: String,
                required: true,
            },

            urgency: {
                type: String,
                enum: ["normal", "urgent"],
                default: "normal",
            },

            location: {
                state: String,
                lga: String,
                address: String,

                coordinates: {
                    type: {
                        type: String,
                        default: "Point",
                    },

                    coordinates: {
                        type: [Number],
                        default: [0, 0],
                    },
                },
            },

            status: {
                type: String,
                enum: [
                    "pending",
                    "accepted",
                    "artisan_on_way",
                    "in_progress",
                    "completed",
                    "cancelled",
                ],
                default: "pending",
            },

            acceptedAt: Date,
            completedAt: Date,
        },
        { timestamps: true }
    );

module.exports = mongoose.model(
    "EmergencyRequest",
    emergencyRequestSchema
);