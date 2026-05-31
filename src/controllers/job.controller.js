const Job = require('../models/Job');
const ArtisanProfile = require('../models/ArtisanProfile');
const {sendNotification} = require('../utils/notify');
const {populate} = require("dotenv");

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
        const matchedArtisans =
            await ArtisanProfile.find({
                skills: job.category,
            })
                .populate(
                    "user",
                    "fullName email phone"
                );
        const onlineArtisans =
            matchedArtisans.filter(
                (artisan) =>
                    global.onlineUsers.has(
                        assignedArtisan.user._id.toString()
                    )
            );

        for (
            const artisan
            of onlineArtisans
            ) {

            await sendNotification({
                user:
                assignedArtisan.user._id,

                title:
                    "New Job Available",

                message:
                     `${job.title} • Budget ₦${job.budget}`,

                type: "job",
            });
        }

        await sendNotification({
            user: req.user.id,
            title: "Job Created",
            message: "Your job has been posted successfully",
            type: "job",
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
            return res.status(404).json({
                success: false,
                message: 'Artisan profile not found'
            })
        }
        const jobs =
            await Job.find({

                category: {
                    $in:
                    assignedArtisan.skills
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
        console.log("TOTAL ARTISANS IN DB:", await ArtisanProfile.countDocuments());

        console.log("MATCHED BEFORE GEO FILTER:", await ArtisanProfile.find({
            skills: job.category
        }));

        if (!job) {
            res.status(404).json({
                success: false,
                message: 'Job not found'
            })
        }
        const radiusLevels = [
            5000,    // 5km
            10000,   // 10km
            20000,   // 20km
            50000,   // 50km
        ];
        let artisans = [];

        for (const radius of radiusLevels) {

            artisans =
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

                            $maxDistance: radius,
                        },
                    },
                })

                    .sort({
                        ratingAverage: -1,
                        totalJobsCompleted: -1,
                        yearsOfExperience: -1,
                    })

                    .limit(10)

                    .populate(
                        "user",
                        "fullName email phone"
                    );

            if (artisans.length > 0) {

                console.log(
                    `FOUND ${artisans.length} ARTISANS AT ${radius}m`
                );

                break;
            }
        }
        const onlineArtisans =
            artisans.filter(
                (artisan) =>
                    global.onlineUsers.has(
                        assignedArtisan.user._id.toString()
                    )
            );
        
        return res.status(200).json({
            success: true,
            totalMatches: onlineArtisans.length,
            data: onlineArtisans,
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
        if (!job.assignedArtisan) {
            return res.status(400).json({
                success: false,
                message:
                    "No artisan has been assigned yet",
            });
        }
        if (
            job.assignedArtisan.toString()
            !== req.user.id
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "This job is not assigned to you",
            });
        }

        if (job.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Job already accepted.'
            })
        }
        job.assignedArtisan = req.user.id
        job.status = 'accepted'

        await sendNotification({
            user: job.customer,
            title: "Job Accepted",
            message: "An artisan has accepted your job",
            type: "job"
        });

        await job.save();

        const updatedJob =
            await Job.findById(jobId)
                .populate(
                    "customer",
                    "fullName email phone"
                )
                .populate(
                    "assignedArtisan",
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

exports.assignArtisan = async (req, res) => {
    try {
        const { jobId } = req.params;
        const { artisanId } = req.body;
        const job = await Job.findById(jobId);

        if (job.status !== "pending") {
            return res.status(400).json({
                success: false,
                message:
                    "Only pending jobs can be assigned",
            });
        }
        if (job.assignedArtisan){
            return res.status(400).json({
                success: false,
                message:"Artisan already assigned",
            })
        }

        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            })
        }
        // only customer who created job can assign
        if (job.customer.toString() !== req.user.id) {
            return res.status(400).json({
                success: false,
                message: "You can only assign your own job",
            })
        }
        const artisan = await ArtisanProfile.findOne({user: artisanId})
        if (!artisan) {
            return res.status(404).json({
                success: false,
                message: 'Artisan profile not found'
            })
        }
        job.assignedArtisan =
            artisanId;
        await job.save()

        const updateJob = await Job.findById(jobId)
            .populate(
                'customer',
                'fullName email phone'
            )
            .populate(
                "assignedArtisan",
                "fullName email phone"
            );
        return res.status(200).json({
            success: true,
            message:"Artisan assigned successfully",
            data: updateJob,
        })
    }catch(error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.getMyJobs = async (req, res) => {
    try {

        const jobs = await Job.find({
            assignedArtisan: req.user.id,
            status: "accepted"
        })
            .populate(
                "customer",
                "fullName email phone"
            )
            .populate(
                "assignedArtisan",
                "fullName email phone"
            )
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            totalJobs: jobs.length,
            data: jobs
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


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
                job.assignedArtisan.toString() !==
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

            const validTransitions = {
                accepted: ["in-progress"],
                "in-progress": ["completed"],
            };

            const allowedNextStatus =
                validTransitions[job.status] || [];

            if (
                !allowedNextStatus.includes(status)
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        `Cannot change status from ${job.status} to ${status}`,
                });
            }

            // update status
            job.status =
                status;

            if (status === "completed") {
                await sendNotification({
                    user: job.customer,
                    title: "Job Completed",
                    message: "Your job has been marked as completed",
                    type: "job"
                });
            }

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
                        "assignedArtisan",
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
exports.getActiveJobs = async (req, res) => {
    try {
        const assignedArtisan = req.user.id;
        const jobs = await Job.find({
            assignedArtisan:
            req.user.id,

            status: {
                $in: [
                    "accepted",
                    "in-progress"
                ]
            }
        })
            .populate(
                "customer",
                "fullName email phone"
            )
            .populate(
                "assignedArtisan",
                "fullName email phone"
            )
            .sort({
                createdAt: -1
            });
        return res.status(200).json({
            success: true,
            totalJobs:
            jobs.length,
            data: jobs,
        });


    }catch(error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}


exports.getCompletedJobs = async (req, res) => {
    try {
        const jobs = await Job.find({
            assignedArtisan:
            req.user.id,

            status:
                "completed"
        })
            .populate(
            "customer",
             "fullName email phone"
        )
             .populate(
                 "assignedArtisan",
                 "fullName email phone"
        )
            .sort({
                updatedAt: -1
            })
        return res.status(200).json({
            success: true,
            totalJobs:jobs.length,
            data: jobs,
        })
    }catch(error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

exports.getJobHistory =
    async (req, res) => {
        try {

            const jobs =
                await Job.find({
                    assignedArtisan:
                    req.user.id,

                    status: {
                        $in: [
                            "completed",
                            "cancelled"
                        ]
                    }
                })
                    .populate(
                        "customer",
                        "fullName email phone"
                    )
                    .populate(
                        "assignedArtisan",
                        "fullName email phone"
                    )
                    .sort({
                        updatedAt: -1
                    });

            return res.status(200).json({
                success: true,
                totalJobs:
                jobs.length,
                data: jobs,
            });

        } catch (error) {

            return res.status(500).json({
                success: false,
                message:
                error.message,
            });
        }
    };