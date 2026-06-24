const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
    {
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        assignedArtisan: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        title: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            required: true,
            trim: true
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
            min: 1,
        },

        status: {
            type: String,
            enum: [
                "pending",
                "assigned",
                "accepted",
                "in-progress",
                "completed",
                "paid",
                "cancelled"
            ],
            default: "pending"
        },

        acceptedAt: Date,

        startedAt: Date,

        completedAt: Date,

        paidAt: Date,

        cancelledAt: Date

    },
    {
        timestamps: true
    }
);

jobSchema.index({ location: "2dsphere" });

jobSchema.index({
    customer: 1,
    status: 1
});

jobSchema.index({
    assignedArtisan: 1,
    status: 1
});

jobSchema.index({
    status: 1
});
jobSchema.index({
    customer: 1,
    createdAt: -1
});

jobSchema.index({
    assignedArtisan: 1,
    createdAt: -1
});

module.exports = mongoose.model(
    "Job",
    jobSchema
);