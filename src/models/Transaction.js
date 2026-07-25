const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        wallet: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Wallet",
        },

        payment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Payment",
        },

        withdrawal: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Withdrawal",
        },

        job: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Job",
        },

        type: {
            type: String,
            enum: [
                "escrow_hold",
                "escrow_release",
                "earning",
                "withdrawal",
                "withdrawal_reversal",
                "refund",
                "platform_fee",
            ],
            required: true,
        },

        amount: {
            type: Number,
            required: true,
        },

        balanceBefore: {
            type: Number,
            default: 0,
        },

        balanceAfter: {
            type: Number,
            default: 0,
        },

        status: {
            type: String,
            enum: ["pending", "successful", "failed"],
            default: "successful",
        },

        reference: {
            type: String,
            required: true,
            unique: true,
        },

        description: {
            type: String,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);

transactionSchema.index({ user: 1, createdAt: -1 });
transactionSchema.index({ reference: 1 });

module.exports =
    mongoose.models.Transaction ||
    mongoose.model("Transaction", transactionSchema);