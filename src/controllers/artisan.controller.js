const ArtisanProfile = require(
    "../models/ArtisanProfile"
);
const Job = require("../models/Job");


const User =
    require("../models/User");

exports.becomeArtisan =
    async (req, res) => {

        try {

            const user =
                await User.findById(
                    req.user.id
                );

            if (!user) {
                return res
                    .status(404)
                    .json({
                        success:
                            false,
                        message:
                            "User not found",
                    });
            }

            if (
                user.role ===
                "artisan"
            ) {
                return res
                    .status(400)
                    .json({
                        success:
                            false,
                        message:
                            "Already an artisan",
                    });
            }

            user.role =
                "artisan";

            await user.save();

            return res
                .status(200)
                .json({
                    success:
                        true,
                    message:
                        "You are now an artisan",
                    data:
                    user,
                });

        } catch (error) {

            return res
                .status(500)
                .json({
                    success:
                        false,
                    message:
                    error.message,
                });
        }
    };

exports.createArtisanProfile =
    async (req, res) => {
        try {
            const {
                skills,
                yearsOfExperience,
                bio,
                location,
            } = req.body;
            const existingProfile = await ArtisanProfile.findOne({user:req.user.id,})
            if (existingProfile) {
                return res.status(400).json({
                    success: false,
                    message: "Artisan profile already exist"
                })
            }

            // create profile
            const newProfile =
                await ArtisanProfile.create({
                    user: req.user.id,
                    skills: Array.isArray(skills)
                        ? skills.filter(
                            skill =>
                                skill.trim() !== ""
                        )
                        : [],                    yearsOfExperience,
                    bio,
                    location,
                });

            // fetch again + populate
            const profile =
                await ArtisanProfile.findById(
                    newProfile._id
                ).populate(
                    "user",
                    "fullName email phone"
                );

            // send populated data
            return res.status(201).json({
                status: "success",
                message:
                    "Artisan Profile Created",
                data: profile,
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    };
exports.updateJobStatus = async (req, res) => {
    try {
        const { jobId } = req.params;
        const { status } = req.body || {};

        if (!status) {
            return res.status(400).json({
                success: false,
                message: "Status is required for artisan",
            });
        }

        const job = await Job.findById(jobId);

        if (!job) {
            return res.status(404).json({
                success: false,
                message: "Job not found",
            });
        }

        if (job.assignedArtisan.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "You are not assigned to this job.",
            });
        }

        const allowedStatus = ["in-progress", "completed"];

        if (!allowedStatus.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status",
            });
        }

        job.status = status;
        await job.save();

        const updateJob = await Job.findById(jobId)
            .populate("customer", "fullName email phone")
            .populate("assignedArtisan", "fullName email phone")
        return res.status(200).json({
            status: "success",
            message: "Job status updated successfully",
            data: updateJob,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
exports.getMyProfile = async (req, res) => {
    try {
        const artisan = await ArtisanProfile.findOne({
            user: req.user.id,
        }).populate("user", "fullName email phone");

        if (!artisan) {
            return res.status(404).json({
                success: false,
                message: "Artisan profile not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: artisan,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};