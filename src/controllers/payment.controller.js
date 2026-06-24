const crypto = require("crypto");
const Payment = require("../models/Payment");
const Job = require("../models/Job");
const { sendNotification } = require("../utils/notify");
const Wallet = require("../models/Wallet");
const PlatformWallet = require("../models/PlatformWallet");
const axios = require("axios");
const mongoose = require("mongoose");


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

            const AUTO_RELEASE_DAYS = 7;

            const autoReleaseAt = new Date();
            autoReleaseAt.setDate(autoReleaseAt.getDate() + AUTO_RELEASE_DAYS);

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
                        "pending",

                    transactionId:
                    reference,
                    autoReleaseAt
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


exports.releasePayment = async (req, res) => {

    const session =
        await mongoose.startSession();

    session.startTransaction();

    try {

        const { jobId } =
            req.params;

        const job = await Job.findById(jobId)
            .session(session);

        if (!job) {
            await session.abortTransaction();

            return res.status(404).json({
                success:false,
                message:"Job not found"
            });
        }

        // only customer
        if (!job.customer || job.customer.toString() !== req.user.id) {
            await session.abortTransaction();

            return res.status(403).json({
                success: false,
                message:
                    "Only customer can release payment"
            });
        }

        if (job.status !== "completed") {
            await session.abortTransaction();

            return res.status(400).json({
                success:false,
                message:"Job not completed"
            });
        }

        const releasedPayment =
            await Payment.findOneAndUpdate(
                {
                    job: jobId,
                    status:"held"
                },
                {
                    $set: {
                        status: "released",
                        releasedAt: new Date()
                    }
                },
                {
                    new:true,
                    session
                }
            );

        if (!releasedPayment) {
            await session.abortTransaction();

            return res.status(400).json({
                success: false,
                message: "Payment not found, already released, or not yet verified"
            });
        }

        const PLATFORM_PERCENTAGE = 10;

        const platformFee =
            (releasedPayment.amount *
                PLATFORM_PERCENTAGE) / 100;

        const artisanAmount =
            releasedPayment.amount -
            platformFee;


        // artisan wallet
        let wallet =
            await Wallet.findOne({
                user:
                releasedPayment.artisan
            }).session(session);

        if (!wallet) {
            wallet =
                new Wallet({
                    user: releasedPayment.artisan
                });
        }

        wallet.balance +=
            artisanAmount;

        wallet.totalEarned +=
            artisanAmount;

        await wallet.save({
            session
        });

        // platform wallet
        let platformWallet =
            await PlatformWallet
                .findOne()
                .session(session);

        if (!platformWallet) {

            platformWallet =
                new PlatformWallet({
                    totalEarnings:0
                });
        }

        platformWallet.totalEarnings +=
            platformFee;

        await platformWallet.save({
            session
        });

        // update job
        job.status = "paid";

        await job.save({
            session
        });

        // commit everything
        await session.commitTransaction();

        // send notification AFTER commit
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

            data:{
                payment: releasedPayment,
                artisanAmount,
                platformFee
            }
        });

    } catch (error) {

        await session.abortTransaction();

        return res.status(500).json({
            success: false,
            message:
            error.message,
        });

    } finally {

        await session.endSession();    }
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

            let wallet =
                await PlatformWallet
                    .findOne();

            if(!wallet){
                wallet =
                    await PlatformWallet.create({
                        totalEarnings:0
                    });
            }

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
//
// exports.verifyPayment =
//     async (req, res) => {
//         try {
//
//             const { reference } =
//                 req.params;
//
//             // verify from paystack
//             const response =
//                 await axios.get(
//                     `https://api.paystack.co/transaction/verify/${reference}`,
//                     {
//                         headers: {
//                             Authorization:
//                                 `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
//                         },
//                     }
//                 );
//
//             const paymentData =
//                 response.data.data;
//
//             // payment failed
//             if (
//                 paymentData.status !==
//                 "success"
//             ) {
//                 return res.status(400)
//                     .json({
//                         success: false,
//                         message:
//                             "Payment verification failed",
//                     });
//             }
//
//             // find payment in DB
//             const payment =
//                 await Payment.findOne({
//                     transactionId:
//                     reference,
//                 });
//
//             if (!payment) {
//                 return res.status(404)
//                     .json({
//                         success: false,
//                         message:
//                             "Payment record not found",
//                     });
//             }
//
//             // avoid duplicate verification
//             if (
//                 payment.status ===
//                 "held"
//             ) {
//                 return res.status(400)
//                     .json({
//                         success: false,
//                         message:
//                             "Payment already verified",
//                     });
//             }
//
//
//             if(payment.status === "released"){
//                 return res.status(400).json({
//                     success:false,
//                     message:"Payment already released"
//                 });
//             }
//
//             await Payment.findOneAndUpdate(
//                 {
//                     transactionId:reference,
//                     status:"pending"
//                 },
//                 {
//                     $set:{
//                         status:"held"
//                     }
//                 },
//                 { new: true}
//             );
//
//             // notify artisan
//             await sendNotification({
//                 user:
//                 payment.artisan,
//
//                 title:
//                     "Payment Received",
//
//                 message:
//                     "Customer has paid for the job",
//
//                 type:
//                     "payment",
//             });
//
//             return res.status(200)
//                 .json({
//                     success: true,
//                     message:
//                         "Payment verified successfully",
//
//                     data:
//                     payment,
//                 });
//
//         } catch (error) {
//
//             return res.status(500)
//                 .json({
//                     success: false,
//                     message:
//                     error.message,
//                 });
//         }
//     };

exports.paystackWebhook = async (req, res) => {
    try {

        // Verify Paystack signature
        const hash = crypto
            .createHmac(
                "sha512",
                process.env.PAYSTACK_SECRET_KEY
            )
            .update(req.rawBody)
            .digest("hex");

        if (
            hash !== req.headers["x-paystack-signature"]
        ) {
            return res.status(401).json({
                success: false,
                message: "Invalid signature"
            });
        }

        const event = req.body;

        // Ignore events we don't care about
        if (event.event !== "charge.success") {
            return res.status(200).json({
                success: true,
                message: "Event ignored"
            });
        }

        const reference =
            event.data.reference;

        // Find payment
        const payment =
            await Payment.findOne({
                transactionId: reference
            });

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: "Payment not found"
            });
        }

        // Prevent duplicate processing
        if (
            payment.status === "held" ||
            payment.status === "released"
        ) {
            return res.status(200).json({
                success: true,
                message: "Payment already processed"
            });
        }

// Move payment into escrow
        payment.status = "held";

// Auto-release after 7 days
        payment.autoReleaseAt = new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000
        );

        await payment.save();

        // Update job if necessary
        const job =
            await Job.findById(payment.job);

        if (job) {
            await job.save();
        }

        // Notify artisan
        await sendNotification({
            user: payment.artisan,
            title: "Payment Received",
            message:
                "Customer has paid. Funds are held in escrow.",
            type: "payment"
        });

        return res.status(200).json({
            success: true,
            message: "Webhook processed successfully"
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

