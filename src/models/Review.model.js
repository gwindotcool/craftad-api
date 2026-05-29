const mongoose =
    require("mongoose");

const reviewSchema =
    new mongoose.Schema(
        {
            job: {
                type:
                mongoose.Schema
                    .Types.ObjectId,

                ref: "Job",

                required: true,
            },

            customer: {
                type:
                mongoose.Schema
                    .Types.ObjectId,

                ref: "User",

                required: true,
            },

            artisan: {
                type:
                mongoose.Schema
                    .Types.ObjectId,

                ref: "User",

                required: true,
            },

            rating: {
                type: Number,

                required: true,

                min: 1,

                max: 5,
            },

            comment: {
                type: String,

                default: "",
            },
        },
        {
            timestamps: true,
        }
    );

module.exports =
    mongoose.model(
        "Review",
        reviewSchema
    );