const Payment = require("../models/Payment");
const Job = require("../models/Job");
const { sendNotification } = require("../utils/notify");
const Wallet = require("../models/Wallet");
const PlatformWallet = require("../models/PlatformWallet");
const axios = require("axios");


exports.initializePayment =
    async (req, res) => {
        try {

            const { jobId } =
                req.params;

            const job =
                await Job.findById(jobId)
                    .populate("customer");

            if (!job) {
                return res.status(404)
                    .json({
                        success: false,
                        message:
                            "Job not found"
                    });
            }

            // only customer
            if (
                job.customer._id.toString()
                !== req.user.id
            ) {
                return res.status(403)
                    .json({
                        success: false,
                        message:
                            "Only customer can pay"
                    });
            }

            // must be completed
            if (
                job.status !==
                "completed"
            ) {
                return res.status(400)
                    .json({
                        success: false,
                        message:
                            "Job must be completed before payment"
                    });
            }

            // prevent duplicate payment
            const existingPayment =
                await Payment.findOne({
                    job: jobId
                });

            if (existingPayment) {
                return res.status(400)
                    .json({
                        success: false,
                        message:
                            "Payment already initialized"
                    });
            }

            // initialize paystack
            const response =
                await axios.post(
                    "https://api.paystack.co/transaction/initialize",
                    {
                        email:
                        job.customer.email,

                        amount:
                            job.budget * 100,

                        metadata: {
                            jobId:
                            job._id
                        }
                    },
                    {
                        headers: {
                            Authorization:
                                `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,

                            "Content-Type":
                                "application/json"
                        }
                    }
                );

            // get paystack reference
            const reference =
                response.data.data.reference;

            // SAVE PAYMENT
            const payment =
                await Payment.create({
                    job: jobId,

                    customer:
                    req.user.id,

                    artisan:
                    job.assignedArtisan,

                    amount:
                    job.budget,

                    status:
                        "held",

                    transactionId:
                    reference
                });

            return res.status(200)
                .json({
                    success: true,

                    paymentUrl:
                    response.data.data.authorization_url,

                    reference,

                    payment
                });

        } catch (error) {

            return res.status(500)
                .json({
                    success: false,
                    message:
                        error.response?.data ||
                        error.message
                });
        }
    };



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

            const PLATFORM_PERCENTAGE = 10;

            const platformFee =
                (payment.amount * PLATFORM_PERCENTAGE) / 100;

            const artisanAmount =
                payment.amount -
                platformFee;

            //Artisan wallet

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
                artisanAmount;

            wallet.totalEarned +=
                artisanAmount;

            await wallet.save();

            //platform wallet
            let platformWallet =
                await PlatformWallet.findOne();

            if (!platformWallet) {

                platformWallet =
                    await PlatformWallet.create({});
            }

            platformWallet.totalEarnings +=
                platformFee;

            await platformWallet.save();


            job.status = "paid";

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

                data: {
                    payment,

                    artisanAmount,

                    platformFee,
                }
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
exports.getPlatformEarnings =
    async (req, res) => {

        try {

            const wallet =
                await PlatformWallet
                    .findOne();

            return res.status(200)
                .json({
                    success: true,
                    data: wallet
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

exports.verifyPayment =
    async (req, res) => {
        try {

            const { reference } =
                req.params;

            // verify from paystack
            const response =
                await axios.get(
                    `https://api.paystack.co/transaction/verify/${reference}`,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                        },
                    }
                );

            const paymentData =
                response.data.data;

            // payment failed
            if (
                paymentData.status !==
                "success"
            ) {
                return res.status(400)
                    .json({
                        success: false,
                        message:
                            "Payment verification failed",
                    });
            }

            // find payment in DB
            const payment =
                await Payment.findOne({
                    transactionId:
                    reference,
                });

            if (!payment) {
                return res.status(404)
                    .json({
                        success: false,
                        message:
                            "Payment record not found",
                    });
            }

            // avoid duplicate verification
            if (
                payment.status ===
                "held"
            ) {
                return res.status(400)
                    .json({
                        success: false,
                        message:
                            "Payment already verified",
                    });
            }

            // update payment
            payment.status =
                "held";

            await payment.save();

            // update job
            const job =
                await Job.findById(
                    payment.job
                );

            job.status =
                "paid";

            await job.save();

            // notify artisan
            await sendNotification({
                user:
                payment.artisan,

                title:
                    "Payment Received",

                message:
                    "Customer has paid for the job",

                type:
                    "payment",
            });

            return res.status(200)
                .json({
                    success: true,
                    message:
                        "Payment verified successfully",

                    data:
                    payment,
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

