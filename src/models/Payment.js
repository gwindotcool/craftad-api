const mongoose = require("mongoose");

const paymentSchema =
    new mongoose.Schema(
        {
            job: {
                type:
                mongoose.Schema.Types.ObjectId,
                ref: "Job",
                required: true,
            },

            customer: {
                type:
                mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },

            artisan: {
                type:
                mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },

            amount: {
                type: Number,
                required: true,
            },


            status: {
                type: String,
                enum: [
                    "held",
                    "released",
                    "refunded",
                ],

                default:
                    "held",
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

            transactionId: {
                type: String,
            },
        },
        {
            timestamps: true,
        }
    );

module.exports =
    mongoose.model(
        "Payment",
        paymentSchema
    );