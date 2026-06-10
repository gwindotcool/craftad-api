const mongoose =
    require("mongoose");

const platformWalletSchema =
    new mongoose.Schema({

        totalEarnings: {
            type: Number,
            default: 0
        },

        totalWithdrawn: {
            type: Number,
            default: 0
        }

    }, {
        timestamps: true
    });

module.exports =
    mongoose.model(
        "PlatformWallet",
        platformWalletSchema
    );