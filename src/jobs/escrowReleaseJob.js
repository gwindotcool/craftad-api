const cron = require("node-cron");
const Payment = require("../models/Payment");
const Job = require("../models/Job");
const Wallet = require("../models/Wallet");
const PlatformWallet = require("../models/PlatformWallet");
const { sendNotification } = require("../utils/notify");
const mongoose = require("mongoose");

const releaseEscrowPayments = async () => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const now = new Date();

        const duePayments = await Payment.find({
            status: "held",
            autoReleaseAt: { $lte: now },
            isAutoReleased: false
        });

        for (const payment of duePayments) {

            const job = await Job.findById(payment.job);

            if (!job) continue;

            // skip if job not completed
            if (job.status !== "completed") continue;

            const PLATFORM_PERCENTAGE = 10;

            const platformFee = (releasedPayment.amount * PLATFORM_PERCENTAGE) / 100;
            const artisanAmount = releasedPayment.amount - platformFee;

            // update payment

            const releasedPayment =
                await Payment.findOneAndUpdate(
                    {
                        _id: releasedPayment._id,
                        status: "held",
                        isAutoReleased: false
                    },
                    {
                        $set: {
                            status: "released",
                            isAutoReleased: true
                        }
                    },
                    {
                        new: true
                    }
                );

            if (!releasedPayment) continue;

            await releasedPayment.save();

            // artisan wallet
            let wallet = await Wallet.findOne({ user: releasedPayment.artisan });

            if (!wallet) {
                wallet = new Wallet({ user: releasedPayment.artisan });
            }

            wallet.balance += artisanAmount;
            wallet.totalEarned += artisanAmount;
            await wallet.save();

            // platform wallet
            let platformWallet = await PlatformWallet.findOne();

            if (!platformWallet) {
                platformWallet = new PlatformWallet({ totalEarnings: 0 });
            }

            platformWallet.totalEarnings += platformFee;
            await platformWallet.save();

            // update job
            job.status = "paid";
            await job.save();

            // notify artisan
            await sendNotification({
                user: releasedPayment.artisan,
                title: "Auto Payment Released",
                message: "Escrow automatically released after completion period",
                type: "payment",
            });

            // notify customer
            await sendNotification({
                user: payment.customer,
                title: "Payment Released",
                message:
                    "Escrow payment was automatically released.",
                type: "payment",
            });
        }
        await session.commitTransaction();


        console.log(`Escrow job ran: ${duePayments.length} payments processed`);

    } catch (error) {
        await session.abortTransaction();

        console.error("Escrow release error:", error.message);
    }finally {
        await session.endSession()
    }
};

// run every hour
cron.schedule("0 * * * *", releaseEscrowPayments);

module.exports = releaseEscrowPayments;