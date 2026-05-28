const mongoose = require("mongoose");

let userSchema;
userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
    },
    phone: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
    },
    role: {
        type: String,
        enum: ["customer", "artisan", "admin"],
        default: "customer",
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    isOnline: {
        type: Boolean,
        default: false,
    },
    location: {
        state: {
            type: String,
        },
        lga: {
            type: String,
        },
        address: {
            type: String,
            default: "",
        },
        coordinates: {
            type: {
                type: String,
                enum: ["Point"],
                default: "Point",
            },

            coordinates: {
                type: [Number],
                default: [0, 0],
            },
        }
    }
}, { timestamps: true }
);
    userSchema.index({
        "location.coordinates": "2dsphere",
    });

module.exports =
    mongoose.models.User ||
    mongoose.model("User", userSchema);