const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },

        balance: {
            type: Number,
            default: 0,
            min: 0,
        },

        totalEarned: {
            type: Number,
            default: 0,
            min: 0,
        },

        totalWithdrawn: {
            type: Number,
            default: 0,
            min: 0,
        },
        pendingWithdrawals: {
            type: Number,
            default: 0,
            min: 0,
        },
    },
    {
        timestamps: true,
    }
);
walletSchema.virtual("availableBalance").get(function () {
    return this.balance - this.pendingWithdrawals;
});

walletSchema.set("toJSON", {
    virtuals: true
});

walletSchema.set("toObject", {
    virtuals: true
});

module.exports =
    mongoose.model(
        "Wallet",
        walletSchema
    );