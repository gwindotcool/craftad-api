const mongoose = require("mongoose");

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
            validate: {
                validator: function (arr) {
                    const allowed = [
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
                    ];

                    return arr.every(skill => allowed.includes(skill));
                },
                message: "Invalid skill detected"
            }
        },

        yearsOfExperience: {
            type: Number,
            default: 0,
            min: 0,
            max: 500,
        },

        bio: {
            type: String,
            default: "",
            trim: true
        },

        availabilityStatus: {
            type: Boolean,
            default: true,
        },

        serviceAreas: {
            type: [String],
            default: [],
            min: 1,
        },
        verificationLevel: {
            type: String,
            enum: ["unverified", "verified", "premium"],
            default: "unverified"
        },

        ratingAverage: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },

        serviceRadiusKm: {
            type: Number,
            default: 10
        },

        totalJobsCompleted: {
            type: Number,
            default: 0,
            min: 0,
        },
        totalReviews: {
            type: Number,
            default: 0,
            min: 0
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
    },
    { timestamps: true }
);
artisanProfileSchema.index({ user: 1 }, { unique: true });

artisanProfileSchema.index({ availabilityStatus: 1 });

artisanProfileSchema.index({ ratingAverage: -1 });

artisanProfileSchema.index({ totalJobsCompleted: -1 });

artisanProfileSchema.index({availabilityStatus: 1, ratingAverage: -1});

artisanProfileSchema.index({ location: "2dsphere" });

module.exports = mongoose.model(
    "ArtisanProfile",
    artisanProfileSchema
);