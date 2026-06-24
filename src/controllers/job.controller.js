const Job = require('../models/Job');
const ArtisanProfile = require('../models/ArtisanProfile');
const {sendNotification} = require('../utils/notify');
const Application = require("../models/Application");



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

        if (job.status !== 'assigned') {
            return res.status(400).json({
                success: false,
                message: `Cannot accept a ${job.status} job`

            })
        }
        job.status = 'accepted';

        await job.save();

        await sendNotification({
            user: job.customer,
            title: "Job Accepted",
            message: "An artisan has accepted your job",
            type: "job"
        });

        const customerSocketId =
            global.onlineUsers.get(
                job.customer.toString()
            );
        if (
            customerSocketId &&
            global.io
        ) {
            global.io
                .to(customerSocketId)
                .emit("jobAccepted", {
                    title: "Job Accepted",
                    message:
                        "An artisan has accepted your job",
                    jobId: job._id,
                });
        }

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
exports.applyForJob =
    async (req, res) => {
        try {

            const { jobId } =
                req.params;

            const {
                message
            } = req.body;

            const job =
                await Job.findById(
                    jobId
                );

            if (!job) {
                return res
                    .status(404)
                    .json({
                        success: false,
                        message:
                            "Job not found"
                    });
            }

            // only pending jobs
            if (
                job.status !==
                "pending"
            ) {
                return res
                    .status(400)
                    .json({
                        success: false,
                        message:
                            "Job unavailable"
                    });
            }

            // prevent duplicate application
            const existing =
                await Application.findOne({
                    job: jobId,

                    artisan:
                    req.user.id
                });

            if (existing) {
                return res
                    .status(400)
                    .json({
                        success: false,
                        message:
                            "Already applied"
                    });
            }

            const application =

                await Application.create({

                    job: jobId,

                    artisan:
                    req.user.id,

                    message
                });

            return res
                .status(201)
                .json({
                    success: true,
                    message:
                        "Application submitted",
                    data:
                    application
                });

        } catch (error) {

            return res
                .status(500)
                .json({
                    success: false,
                    message:
                    error.message
                });
        }
    };

exports.getJobApplications = async (req, res) => {
    try {

        const { jobId } = req.params;

        const job = await Job.findById(jobId);

        if (!job) {
            return res.status(404).json({
                success: false,
                message: "Job not found"
            });
        }

        if (job.customer.toString() !== req.user.id && (!job.assignedArtisan || job.assignedArtisan.toString()
            !== req.user.id) && req.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Unauthorized"
            });
        }

        // Authorization check
        const isOwner =
            job.customer.toString() === req.user.id;

        const isAssignedArtisan =
            job.assignedArtisan &&
            job.assignedArtisan.toString() === req.user.id;

        const isAdmin =
            req.user.role === "admin";

        if (
            !isOwner &&
            !isAssignedArtisan &&
            !isAdmin
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "You are not allowed to view applications for this job"
            });
        }

        const applications =
            await Application.find({
                job: jobId
            })
                .populate(
                    "artisan",
                    "fullName"
                )

        return res.status(200).json({
            success: true,
            totalApplicants:
            applications.length,
            data: applications
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.assignArtisan = async (req, res) => {
    try {
        const { jobId } = req.params;
        const { artisanId } = req.body || {};
        const job = await Job.findById(jobId);

        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            })
        }

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


        // only customer who created job can assign
        if (job.customer.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "You can only assign your own job",
            })
        }
        const artisan = await ArtisanProfile.findOne({user: artisanId})

        const application =
            await Application.findOne({
                job: jobId,
                artisan: artisanId
            });

        if (!application) {
            return res.status(400).json({
                success: false,
                message:
                    "Artisan did not apply for this job"
            });
        }

        if (!artisan) {
            return res.status(404).json({
                success: false,
                message: 'Artisan profile not found'
            })
        }
        job.assignedArtisan =
            artisanId;
        job.status = "assigned";
        await job.save()

        await Application.findOneAndUpdate(
            {
                job: jobId,
                artisan: artisanId
            },
            {
                status: "accepted"
            }
        );

        await Application.updateMany(
            {
                job: jobId,
                artisan: { $ne: artisanId }
            },
            {
                status: "rejected"
            }
        );

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

exports.updateJobStatus = async (req, res) => {
    try {
        const { jobId } = req.params;
        const { status } = req.body;

        const job = await Job.findById(jobId);

        if (!job) {
            return res.status(404).json({
                success: false,
                message: "Job not found",
            });
        }

        // Fix 1: crash prevention — assignedArtisan can be null
        if (!job.assignedArtisan) {
            return res.status(400).json({
                success: false,
                message: "No artisan assigned to this job yet",
            });
        }

        // Fix 2: admin can update any job, artisan can only update their own
        if (
            job.assignedArtisan.toString() !== req.user.id &&
            req.user.role !== "admin"
        ) {
            return res.status(403).json({
                success: false,
                message: "You are not assigned to this job",
            });
        }

        // Fix 3: skip transition rules for admin
        if (req.user.role !== "admin") {
            const validTransitions = {
                assigned: ["accepted"],
                accepted: ["in-progress"],
                "in-progress": ["completed"],
            };

            const allowedNextStatus = validTransitions[job.status] || [];

            if (!allowedNextStatus.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: `Cannot change status from "${job.status}" to "${status}"`,
                });
            }
        }

        job.status = status;

        if (status === "completed") {
            const artisan = await ArtisanProfile.findOne({
                user: job.assignedArtisan,
            });

            if (artisan) {
                artisan.totalJobsCompleted += 1;
                await artisan.save();
            }

            await sendNotification({
                user: job.customer,
                title: "Job Completed",
                message: "Your job has been marked as completed",
                type: "job",
            });
        }

        await job.save();

        const updatedJob = await Job.findById(jobId)
            .populate("customer", "fullName email phone")
            .populate("assignedArtisan", "fullName email phone");

        return res.status(200).json({
            success: true,
            message: "Job status updated successfully",
            data: updatedJob,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
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
exports.getAllJobs = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            search,
            status,
            category
        } = req.query;
        let filter = {}

        if (search) {
            filter.title = {
                $regex: search,
                $options: "i"
            };
        }
        if (status) {
            filter.status = status;
        }

        if (category) {
            filter.category = category;
        }
        const skio =(page - 1) * limit;

        const jobs = await Job.find( filter )
            .populate(
                "customer",
                "fullName email"
            )
            .populate(
                "assignedArtisan",
                "fullName email"
            )
            .skip( Number(skio))
            .limit( Number(limit))
            .sort({
                createdAt: -1
            })
        const totalJobs = await Job.countDocuments( filter)
        return res.status(200).json({
            success: true,
            currentPage: Number(page),
            totalPages: Math.ceil(
                totalJobs/limit
            ),
            totalJobs,
            data: jobs,
        })



    }catch(error) {
        return res.status(500).json({
            success: false,
            message:error.message,
        })
    }
}





exports.getJobHistory = async (req, res) => {
    try {

        const { status } = req.query;

        let filter = {};

        // customer sees only their jobs
        if (req.user.role === "customer") {
            filter.customer = req.user.id;
        }

        // artisan sees assigned jobs
        if (req.user.role === "artisan") {
            filter.assignedArtisan = req.user.id;
        }

        // optional filter by status
        if (status) {
            filter.status = status;
        }

        const jobs = await Job.find(filter)
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
            data: jobs,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
exports.cancelJob = async (req, res) => {
    try {
        const { jobId } = req.params;

        const job = await Job.findById(jobId);

        if (!job) {
            return res.status(404).json({
                success: false,
                message: "Job not found"
            });
        }

// only block if NOT the owning customer AND NOT an admin
        if (
            job.customer.toString() !== req.user.id &&
            req.user.role !== "admin"
        ) {
            return res.status(403).json({
                success: false,
                message: "You can only cancel your own job"
            });
        }
        // prevent cancelling completed or already cancelled jobs
        if (job.status === "completed" || job.status === "cancelled") {
            return res.status(400).json({
                success: false,
                message: `Cannot cancel a job that is already ${job.status}`
            });
        }

        // prevent cancelling completed
        if (
            job.status === "completed"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Completed jobs cannot be cancelled"
            });
        }

        job.status = "cancelled";

        await job.save();

        return res.status(200).json({
            success: true,
            message:
                "Job cancelled successfully",
            data: job
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};