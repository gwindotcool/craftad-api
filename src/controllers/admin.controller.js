const User = require("../models/User");

const Job = require("../models/Job");

const Payment = require("../models/Payment");

const Withdrawal = require("../models/Withdrawal");

exports.getDashboardStats =
    async (req, res) => {

        try {

            // USERS
            const totalUsers =
                await User.countDocuments();

            const totalCustomers =
                await User.countDocuments({
                    role:
                        "customer"
                });

            const totalArtisans =
                await User.countDocuments({
                    role:
                        "artisan"
                });

            // JOBS
            const totalJobs =
                await Job.countDocuments();

            const completedJobs =
                await Job.countDocuments({
                    status:
                        "completed"
                });

            const pendingJobs =
                await Job.countDocuments({
                    status:
                        "pending"
                });

            const cancelledJobs =
                await Job.countDocuments({
                    status:
                        "cancelled"
                });

            // PAYMENTS
            const payments =
                await Payment.find({
                    status:
                        "released"
                });

            const totalPayments =
                payments.reduce(
                    (sum, payment) =>
                        sum +
                        payment.amount,
                    0
                );

            // WITHDRAWALS
            const pendingWithdrawals =
                await Withdrawal.countDocuments({
                    status:
                        "pending"
                });

            return res.status(200).json({
                success: true,

                data: {

                    totalUsers,

                    totalCustomers,

                    totalArtisans,

                    totalJobs,

                    completedJobs,

                    pendingJobs,

                    cancelledJobs,

                    totalPayments,

                    pendingWithdrawals
                }
            });

        } catch(error) {

            return res.status(500).json({
                success: false,
                message:
                error.message
            });
        }
    };