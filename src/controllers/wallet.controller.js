const Wallet = require("../models/Wallet");
const Withdrawal = require("../models/Withdrawal");

exports.getMyWallet =
    async (req, res) => {
        try {

            let wallet =
                await Wallet.findOne({
                    user:
                    req.user.id
                });

            // create wallet if none exists
            if (!wallet) {

                wallet =
                    await Wallet.create({
                        user:
                        req.user.id
                    });
            }

            return res.status(200).json({
                success: true,
                data: wallet,
            });

        } catch (error) {

            return res.status(500).json({
                success: false,
                message:
                error.message
            });
        }
    };

exports.withdrawFunds = async (req, res) => {
    try {

        const { amount, bankName, accountNumber, accountName } = req.body;

        const wallet = await Wallet.findOne({
            user: req.user.id
        });

        if (!wallet) {
            return res.status(404).json({
                success: false,
                message: "Wallet not found"
            });
        }

        if (wallet.balance < amount) {
            return res.status(400).json({
                success: false,
                message: "Insufficient balance"
            });
        }


        const withdrawal = await Withdrawal.create({
            user: req.user.id,
            amount,
            bankName,
            accountNumber,
            accountName,
            status: "pending"
        });

        return res.status(200).json({
            success: true,
            message: "Withdrawal requested successfully",
            data: withdrawal
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
exports.approveWithdrawal =
    async (req, res) => {

        try {

            const {
                withdrawalId
            } = req.params;

            const withdrawal =
                await Withdrawal.findById(
                    withdrawalId
                );

            if (!withdrawal) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Withdrawal not found"
                });
            }

            // stop duplicate approval
            if (
                withdrawal.status ===
                "successful"
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Already approved"
                });
            }

            const wallet =
                await Wallet.findOne({
                    user:
                    withdrawal.user
                });

            // deduct money now
            wallet.balance -=
                withdrawal.amount;

            wallet.totalWithdrawn +=
                withdrawal.amount;

            await wallet.save();

            // mark successful
            withdrawal.status =
                "successful";

            await withdrawal.save();

            return res.status(200).json({
                success: true,
                message:
                    "Withdrawal approved",

                data:
                withdrawal
            });

        } catch(error) {

            return res.status(500).json({
                success: false,
                message:
                error.message
            });
        }
    };
exports.getWithdrawalHistory =
    async (req, res) => {

        try {

            let filter = {};

            // artisan sees only theirs
            if (
                req.user.role ===
                "artisan"
            ) {
                filter.user =
                    req.user.id;
            }

            // optional status filter
            const { status } =
                req.query;

            if (status) {
                filter.status =
                    status;
            }

            const withdrawals =
                await Withdrawal.find(
                    filter
                )
                    .populate(
                        "user",
                        "fullName email phone"
                    )
                    .sort({
                        createdAt: -1
                    });

            return res.status(200).json({
                success: true,

                totalWithdrawals:
                withdrawals.length,

                data:
                withdrawals
            });

        } catch(error) {

            return res.status(500).json({
                success: false,
                message:
                error.message
            });
        }
    };