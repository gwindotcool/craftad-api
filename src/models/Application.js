const mongoose =
    require("mongoose");

const applicationSchema =
    new mongoose.Schema(
        {
            job: {
                type:
                mongoose.Schema.Types.ObjectId,

                ref: "Job",

                required: true
            },

            artisan: {
                type:
                mongoose.Schema.Types.ObjectId,

                ref: "User",

                required: true
            },

            message: {
                type: String
            },

            status: {
                type: String,

                enum: [
                    "pending",
                    "accepted",
                    "rejected"
                ],

                default:
                    "pending"
            }

        },
        {
            timestamps: true
        }
    );

module.exports =
    mongoose.model(
        "Application",
        applicationSchema
    );