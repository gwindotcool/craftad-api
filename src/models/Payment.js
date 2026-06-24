const mongoose = require("mongoose");

const paymentSchema =
    new mongoose.Schema(
        {
            job: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Job",
                required: true,
                unique: true,
                index: true,
            },

            customer: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
                index: true
            },

            artisan: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
                index: true
            },

            amount: {
                type: Number,
                required: true,
                min: 1,
            },


            status: {
                type: String,
                enum: [
                    "pending",
                    "held",
                    "released",
                    "refunded"
                ],
                default:
                    "pending",
            },

            paymentMethod: {
                type: String,
                enum: [
                    "card",
                    "transfer",
                    "cash",
                ],
                default: "transfer",
            },
            autoReleaseAt: {
                type: Date,
                default: null
            },

            isAutoReleased: {
                type: Boolean,
                default: false
            },

            transactionId: {
                type: String,
                required: true,
                index: true,
                unique: true,
            },
            releasedAt: {
                type: Date
            },

            refundedAt: {
                type: Date
            }
        },
        {
            timestamps: true,
        }
    );
    paymentSchema.index({
    customer: 1,
    status: 1
    });

    paymentSchema.index({
    artisan: 1,
    status: 1
    });

    module.exports =
    mongoose.model(
        "Payment",
        paymentSchema
    );