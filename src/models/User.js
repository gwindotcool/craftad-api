const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true, trim: true },

    email: { type: String, required: true, unique: true, lowercase: true, trim: true },

    phone: { type: String, required: true, unique: true },

    password: { type: String, required: true, minlength: 6, select: false },

    resetPasswordToken: {type: String, select: false},

    resetPasswordExpire: Date,

    role: {type: String, enum: ["customer", "artisan", "admin"], default: "customer",},

    isVerified: { type: Boolean, default: false },

    isOnline: { type: Boolean, default: false },

    lastSeen: { type: Date, default: Date.now },

    isDeleted: { type: Boolean, default: false },

    avatar: { type: String, default: "" },

    profileImage: { type: String, default: "" },

    refreshToken: { type: String, default: null, select: false },

    accountStatus: {type: String, enum: ["active", "suspended", "banned"], default: "active"},

    location: {
        state: { type: String, trim: true },
        lga: { type: String, trim: true },
        address: { type: String, default: "" },

        coordinates: {
            type: {
                type: String,
                enum: ["Point"],
                default: "Point",
            },
            coordinates: {
                type: [Number],
                default: undefined,
            },
        }
    }
}, { timestamps: true });

userSchema.index({role: 1});

userSchema.index({isOnline: 1});

userSchema.index({role: 1, "location.coordinates": "2dsphere"});

module.exports = mongoose.models.User || mongoose.model("User", userSchema);