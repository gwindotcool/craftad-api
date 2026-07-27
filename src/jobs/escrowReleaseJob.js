const cron = require("node-cron");
const Payment = require("../models/Payment");
const Job = require("../models/Job");
const Wallet = require("../models/Wallet");
const PlatformWallet = require("../models/PlatformWallet");
const { sendNotification } = require("../utils/notify");
const mongoose = require("mongoose");
const { createTransaction } = require("../services/transaction.service");

const releaseEscrowPayments = async () => {

    const now = new Date();

    const duePayments = await Payment.find({
        status: "held",
        autoReleaseAt: {$lte: now},
        isAutoReleased: false
    });

    for (const payment of duePayments) {
        const session = await mongoose.startSession();

        try {
            session.startTransaction();

            const job = await Job.findById(payment.job)
                .session(session);


            if (!job) {
                await session.abortTransaction();
                continue;
            }

            // skip if job not completed
            if (job.status !== "completed") {
                await session.abortTransaction();
                continue;
            }

            const PLATFORM_PERCENTAGE = 10;

            const platformFee =
                (payment.amount * PLATFORM_PERCENTAGE) / 100;

            const artisanAmount = payment.amount - platformFee;

            // update payment

            const releasedPayment =
                await Payment.findOneAndUpdate(
                    {
                        _id: payment._id,
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
                        new: true,
                        session
                    }
                );

            if (!releasedPayment) {
                await session.abortTransaction();
                continue;
            }

            // artisan wallet
            let wallet = await Wallet.findOne({user: releasedPayment.artisan})
                .session(session)

            if (!wallet) {
                wallet = new Wallet({user: releasedPayment.artisan});
            }

            const before = wallet.balance;

            wallet.balance += artisanAmount;
            wallet.totalEarned += artisanAmount;

            await wallet.save({ session });


            await createTransaction({

                user: releasedPayment.artisan,

                wallet: wallet._id,

                payment: payment._id,

                job: job._id,

                type: "earning",

                amount: artisanAmount,

                balanceBefore: before,

                balanceAfter: wallet.balance,

                description:
                    "Payment released",
                session,

            });


            // platform wallet
            let platformWallet =
                await PlatformWallet
                    .findOne()
                    .session(session);

            if (!platformWallet) {
                platformWallet =
                    new PlatformWallet({
                        totalEarnings: 0
                    });
            }

            platformWallet.totalEarnings += platformFee;

            await platformWallet.save({ session });

            await createTransaction({
                user: null,
                type: "platform_fee",
                amount: platformFee,
                description: "Marketplace commission",
                session,
            });


            await platformWallet.save({ session });

            // update job
            job.status = "paid";

            await job.save({ session });


            await session.commitTransaction();

            // notify artisan
            await sendNotification({
                user: releasedPayment.artisan,
                title: "Auto Payment Released",
                message: "Escrow automatically released after completion period",
                type: "payment",
            });

            // notify customer
            await sendNotification({
                user: job.customer,
                title: "Payment Released",
                message:
                    "Escrow payment was automatically released.",
                type: "payment",
            });

        } catch (error) {
            await session.abortTransaction();

            console.error("Escrow release error:", error.message);
        } finally {
            await session.endSession()
        }
    }
    console.log(`Escrow job ran: ${duePayments.length} payments processed`);

}

// run every hour
cron.schedule("0 * * * *", releaseEscrowPayments);

module.exports = releaseEscrowPayments;