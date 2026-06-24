const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
    {
        job: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Job",
            required: true
        },

        artisan: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        message: {
            type: String,
            trim: true,
            maxlength: 500,
            default: ""
        },

        status: {
            type: String,
            enum: [
                "pending",
                "accepted",
                "rejected"
            ],
            default: "pending"
        },

        acceptedAt: Date,

        rejectedAt: Date
    },
    {
        timestamps: true
    }
);

applicationSchema.index(
    {
        job: 1,
        artisan: 1
    },
    {
        unique: true
    });

applicationSchema.index({ job: 1 });

applicationSchema.index({ artisan: 1 });

applicationSchema.index({ status: 1 });

applicationSchema.index({
    job: 1,
    status: 1
});

module.exports = mongoose.model(
    "Application",
    applicationSchema
);