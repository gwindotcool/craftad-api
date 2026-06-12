const User = require("../models/User");
const Job = require("../models/Job");
const ArtisanProfile =
    require("../models/ArtisanProfile");

const PlatformWallet =
    require("../models/PlatformWallet");

exports.getAdminStats =
    async (req, res) => {
        try {

            const totalUsers =
                await User.countDocuments();

            const totalArtisans =
                await ArtisanProfile.countDocuments();

            const totalCustomers =
                await User.countDocuments({
                    role: "customer"
                });

            const totalJobs =
                await Job.countDocuments();

            const completedJobs =
                await Job.countDocuments({
                    status: "completed"
                });

            const cancelledJobs =
                await Job.countDocuments({
                    status: "cancelled"
                });

            const pendingJobs =
                await Job.countDocuments({
                    status: "pending"
                });

            const platformWallet =
                await PlatformWallet.findOne();

            const totalEarnings =
                platformWallet?.totalEarnings || 0;

            const totalWithdrawn =
                platformWallet?.totalWithdrawn || 0;

            const availableBalance =
                totalEarnings -
                totalWithdrawn;

            return res.status(200)
                .json({
                    success: true,

                    data: {
                        totalUsers,
                        totalArtisans,
                        totalCustomers,
                        totalJobs,
                        completedJobs,
                        cancelledJobs,
                        pendingJobs,
                        totalEarnings,
                        totalWithdrawn,
                        availableBalance
                    }
                });

        } catch (error) {

            return res.status(500)
                .json({
                    success: false,
                    message:
                    error.message
                });
        }
    };



exports.withdrawPlatformFunds =
    async (req, res) => {
        try {

            const { amount } =
                req.body;

            if (!amount || amount <= 0) {
                return res.status(400)
                    .json({
                        success: false,
                        message:
                            "Invalid amount"
                    });
            }

            const wallet =
                await PlatformWallet
                    .findOne();

            if (!wallet) {
                return res.status(404)
                    .json({
                        success: false,
                        message:
                            "Platform wallet not found"
                    });
            }

            const availableBalance =
                wallet.totalEarnings -
                wallet.totalWithdrawn;

            if (
                amount >
                availableBalance
            ) {
                return res.status(400)
                    .json({
                        success: false,
                        message:
                            "Insufficient balance"
                    });
            }

            wallet.totalWithdrawn +=
                amount;

            await wallet.save();

            return res.status(200)
                .json({
                    success: true,
                    message:
                        "Platform withdrawal successful",

                    data: {
                        amountWithdrawn:
                        amount,

                        remainingBalance:
                            wallet.totalEarnings -
                            wallet.totalWithdrawn
                    }
                });

        } catch (error) {

            return res.status(500)
                .json({
                    success: false,
                    message:
                    error.message
                });
        }
    };

exports.getAllUsers =
    async (req, res) => {
        try {

            const users =
                await User.find()
                    .select(
                        "fullName email role createdAt"
                    );

            return res.status(200)
                .json({
                    success: true,
                    count:
                    users.length,
                    data: users,
                });

        } catch (error) {

            return res.status(500)
                .json({
                    success: false,
                    message:
                    error.message,
                });
        }
    };