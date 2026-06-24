const Review = require("../models/Review.model");

const Job = require("../models/Job");

const ArtisanProfile = require("../models/ArtisanProfile");

exports.createReview =
    async (req, res) => {
        try {

            const { jobId } =
                req.params;

            const {
                rating,
                comment,
            } =
            req.body || {};

            const job =
                await Job.findById(jobId);

            if (!job) {
                return res
                    .status(404)
                    .json({
                        success: false,
                        message:
                            "Job not found",
                    });
            }

            // only completed jobs
            if (
                job.status !==
                "completed"
            ) {
                return res
                    .status(400)
                    .json({
                        success: false,
                        message:
                            "Job not completed",
                    });
            }

            // only customer
            if (
                job.customer
                    .toString()
                !==
                req.user.id
            ) {
                return res
                    .status(403)
                    .json({
                        success: false,
                        message:
                            "Only customer can rate",
                    });
            }

            // prevent duplicate review
            const existing =
                await Review
                    .findOne({
                        job: jobId
                    });

            if (existing) {
                return res
                    .status(400)
                    .json({
                        success: false,
                        message:
                            "Review already exists",
                    });
            }
            // update artisan stats
            const artisan =
                await ArtisanProfile
                    .findOne({
                        user:
                        job.assignedArtisan
                    });
            if (!artisan) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Artisan profile not found",
                });
            }

            // create review
            const review = await Review.create({
                job: jobId,
                customer: req.user.id,
                artisan: job.assignedArtisan,
                rating,
                comment
            });

                // update stats
            artisan.ratingAverage =
                (
                    artisan.ratingAverage *
                    artisan.totalReviews +
                    rating
                ) /
                (artisan.totalReviews + 1);

            artisan.totalReviews += 1;

            await artisan.save();

            return res
                .status(201)
                .json({
                    success: true,
                    message:
                        "Review added",
                    data: review,
                });

        } catch(error){
            return res
                .status(500)
                .json({
                    success: false,
                    message:
                    error.message,
                });
        }
    };