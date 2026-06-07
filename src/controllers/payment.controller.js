const Payment = require("../models/Payment");
const Job = require("../models/Job");
const { sendNotification } = require("../utils/notify");
const Wallet = require("../models/Wallet");

exports.makePayment = async (req, res) => {
    try {
        const { jobId } = req.params;
        const job = await Job.findById( jobId )
        if (!job) {
            return res.status(404).json({
                success: false,
                message: "Job not found."
            })
        }
        if (job.status !== "completed") {
            return res.status(400).json({
                success: false,
                message: "Only pending jobs can be paid for"
            })
        }
        if (job.customer.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "Only customer can pay"
            })
        }
        const existingPayment = await Payment.findOne({job:jobId})
        if (existingPayment) {
            return res.status(400).json({
                success: false,
                message: "Payment already made",
            })
        }
        const payment = await Payment.create({
            job: jobId,

            customer:req.user.id,

            artisan:job.assignedArtisan,

            amount:job.budget,

            status: "held",

            transactionId: `TX-${Date.now()}`

        })

        job.status = "paid",
            await job.save();

        await sendNotification ({
            user: job.assignedArtisan,

            title: "Payment Received",

            message: "Customer has paid for the job",

            type: "payment",
        })
        return res.status(200).json({
            success: true,
            message: "Payment successful",
            data: payment,

        })

    }catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.releasePayment =
    async (req, res) => {
        try {

            const { jobId } =
                req.params;

            const payment =
                await Payment.findOne({
                    job: jobId
                });

            if (!payment) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Payment not found"
                });
            }

            const job =
                await Job.findById(jobId);

            // only customer
            if (
                job.customer.toString()
                !== req.user.id
            ) {
                return res.status(403).json({
                    success: false,
                    message:
                        "Only customer can release payment"
                });
            }

            // job must be completed
            if (
                job.status !==
                "completed"
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Job not completed"
                });
            }

            // prevent duplicate release
            if (
                payment.status ===
                "released"
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Payment already released"
                });
            }

            payment.status =
                "released";

            await payment.save();

            let wallet =
                await Wallet.findOne({
                    user:
                    payment.artisan
                });

            if (!wallet) {

                wallet =
                    await Wallet.create({
                        user:
                        payment.artisan
                    });
            }

            wallet.balance +=
                payment.amount;

            wallet.totalEarned +=
                payment.amount;

            await wallet.save();


            job.status =
                "paid";

            await job.save();

            await sendNotification({
                user:
                job.assignedArtisan,

                title:
                    "Payment Released",

                message:
                    "Customer released payment",

                type:
                    "payment",
            });

            return res.status(200).json({
                success: true,
                message:
                    "Payment released successfully",
                data:
                payment,
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                message:
                error.message,
            });
        }
    };


exports.getPaymentHistory =
    async (req, res) => {
        try {

            const { status } =
                req.query;

            let filter = {};

            // customer sees payments made
            if (
                req.user.role ===
                "customer"
            ) {
                filter.customer =
                    req.user.id;
            }

            // artisan sees payments received
            if (
                req.user.role ===
                "artisan"
            ) {
                filter.artisan =
                    req.user.id;
            }

            //  status filter
            if (status) {
                filter.status =
                    status;
            }

            const payments =
                await Payment.find(
                    filter
                )
                    .populate(
                        "job",
                        "title category budget status"
                    )
                    .populate(
                        "customer",
                        "fullName email phone"
                    )
                    .populate(
                        "artisan",
                        "fullName email phone"
                    )
                    .sort({
                        createdAt: -1
                    });

            return res
                .status(200)
                .json({
                    success: true,
                    totalPayments:
                    payments.length,
                    data: payments,
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