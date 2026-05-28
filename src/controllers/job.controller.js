const Job = require('../models/Job');
const ArtisanProfile = require('../models/ArtisanProfile');

exports.createJob = async (req, res) => {
    try {
        const { title, description, category, location, budget, } = req.body;
        const job = await Job.create({
            customer: req.user.id,
            title,
            description,
            category,
            location,
            budget
        });
        res.status(201).json({
            success: true,
            message: 'Job created successfully.',
            data: job,
        });
    }catch(error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.suggestJobs = async (req, res) => {
    try {

        const artisan =
            await ArtisanProfile
                .findOne({
                    user:req.user.id
                })
        if (!artisan) {
            return res.status(404).send({
                success: false,
                message: 'Artisan profile not found'
            })
        }
        const jobs =
            await Job.find({

                category: {
                    $in:
                    artisan.skills
                },

                status:
                    "pending",

                location: {
                    $near: {
                        $geometry: {
                            type:
                                "Point",

                            coordinates:
                            artisan.location.coordinates
                        },

                        $maxDistance:
                            10000
                    }
                }
            })
                .populate(
                    "customer",
                    "fullName phone"
                )
        return res.status(200).json({
            success: true,
            totalJobs:
            jobs.length,
            data: jobs
        })
    }catch(error) {
      return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.matchArtisans = async (req, res) => {
    try {
        const { jobId } = req.params;
        const job = await Job.findById(jobId)

        if (!job) {
            res.status(404).json({
                success: false,
                message: 'Job not found'
            })
        }
        const artisans =
            await ArtisanProfile.find({
            skills: job.category,
            availabilityStatus: true,
            location: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates:
                        job.location.coordinates,
                    },

                    $maxDistance: 10000,
                },
            },

        })
                .sort ({
                    ratingAverage: -1,
                    totalJobsCompleted: -1,
                    yearsOfExperience: -1
                })
                .limit(10)
                .populate(
            "user",
            "fullName email phone"
        );
        return res.status(200).json({
            success: true,
            totalMatches: artisans.length,
            data: artisans,
        })

    }catch(error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.acceptJob = async (req, res) => {
    try {
        const { jobId } = req.params;
        const job = await Job.findById(jobId )
        if (!job) {
           return res.status(404).json({
                success: false,
                message: 'Job not found'
            })
        }
        if (job.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Job already accepted.'
            })
        }
        job.artisan = req.user.id
        job.status = 'accepted'
        await job.save();

        const updatedJob =
            await Job.findById(jobId)
                .populate(
                    "customer",
                    "fullName email phone"
                )
                .populate(
                    "artisan",
                    "fullName email phone"
                );
        return res.status(200).json({
            success: true,
            message: 'Job accepted successfully.',
            data: updatedJob,
        })

    }catch(error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}


exports.updateJobStatus =
    async (req, res) => {
        try {
            const { jobId } =
                req.params;

            const { status } =
                req.body;

            // find job
            const job =
                await Job.findById(
                    jobId
                );

            // check if job exists
            if (!job) {
                return res
                    .status(404)
                    .json({
                        success: false,
                        message:
                            "Job not found",
                    });
            }

            // only assigned artisan
            if (
                job.artisan.toString() !==
                req.user.id
            ) {
                return res
                    .status(403)
                    .json({
                        success: false,
                        message:
                            "You are not assigned to this job",
                    });
            }

            // allowed status
            const allowedStatus =
                [
                    "in-progress",
                    "completed",
                ];

            if (
                !allowedStatus.includes(
                    status
                )
            ) {
                return res
                    .status(400)
                    .json({
                        success: false,
                        message:
                            "Invalid status",
                    });
            }

            // update status
            job.status =
                status;

            await job.save();

            const updatedJob =
                await Job.findById(
                    jobId
                )
                    .populate(
                        "customer",
                        "fullName email phone"
                    )
                    .populate(
                        "artisan",
                        "fullName email phone"
                    );

            return res
                .status(200)
                .json({
                    success: true,
                    message:
                        "Job status updated successfully",
                    data:
                    updatedJob,
                });

        } catch (error) {
            return res
                .status(500)
                .json({
                    success: false,
                    message:
                    error.message,
                });
        }
    };