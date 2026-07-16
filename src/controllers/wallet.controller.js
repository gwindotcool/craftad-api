const Wallet = require("../models/Wallet");
const Withdrawal = require("../models/Withdrawal");
const mongoose = require("mongoose");

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

        if (!amount || isNaN(amount) || Number(amount) <= 0) {
            return res.status(400).json({
                success:false,
                message:"Invalid withdrawal amount"
            });
        }

        const wallet = await Wallet.findOne({
            user: req.user.id
        });

        if (!wallet) {
            return res.status(404).json({
                success: false,
                message: "Wallet not found"
            });
        }

        const availableBalance =
            wallet.balance -
            wallet.pendingWithdrawals;

        if (availableBalance < amount) {
            return res.status(400).json({
                success: false,
                message: "Insufficient balance"
            });
        }

        wallet.pendingWithdrawals += amount;

        await wallet.save();

        await createTransaction({

            user: artisan._id,

            type:"earning",

            amount,

            direction:"credit",

            description:
                "Payment received for completed job",

            job:job._id,

            session

        });


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
        const session = await mongoose.startSession();

        try {
            session.startTransaction();

            const {
                withdrawalId
            } = req.params;

            const withdrawal =
                await Withdrawal.findById(
                    withdrawalId
                ).session(session);

            if (!withdrawal) {
                await session.abortTransaction();

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
                await session.abortTransaction();

                return res.status(400).json({
                    success: false,
                    message:
                        "Already approved"
                });
            }

            if (
                withdrawal.status !== "pending"
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Withdrawal already processed"
                });
            }

            const wallet =
                await Wallet.findOne({
                    user:
                    withdrawal.user
                }).session(session);

            if (!wallet) {
                await session.abortTransaction();

                return res.status(404).json({
                    success: false,
                    message: "Wallet not found"
                });
            }

            // deduct money now
            if (wallet.balance < withdrawal.amount) {

                await session.abortTransaction();

                return res.status(400).json({
                    success:false,
                    message:"Insufficient wallet balance"
                });
            }

            if(wallet.pendingWithdrawals < withdrawal.amount){

                console.log(
                    "Wallet pending withdrawal mismatch",
                    {
                        walletPending: wallet.pendingWithdrawals,
                        withdrawalAmount: withdrawal.amount
                    }
                );
            }
            wallet.balance -= withdrawal.amount;

            wallet.pendingWithdrawals = Math.max(
                0,
                wallet.pendingWithdrawals - withdrawal.amount
            );

            wallet.totalWithdrawn += withdrawal.amount;
            await createTransaction({

                user:withdrawal.user,

                type:"withdrawal",

                amount:withdrawal.amount,

                direction:"debit",

                description:
                    "Withdrawal approved",

                session

            });

            await wallet.save({session});

            // mark successful
            withdrawal.status = "successful";

            await withdrawal.save({session});

            await session.commitTransaction();

            return res.status(200).json({
                success: true,
                message:
                    "Withdrawal approved",

                data:
                withdrawal
            });

        } catch(error) {
            console.log("APPROVE WITHDRAWAL ERROR:", error);

            await session.abortTransaction();
            return res.status(500).json({
                success: false,
                message:
                error.message
            });
        }finally {

            await session.endSession();    }
    };

exports.rejectWithdrawal =
    async (req, res) => {
        const session =
            await mongoose.startSession();

    try {
        session.startTransaction();

        const withdrawal =
            await Withdrawal.findById(
                req.params.withdrawalId
            ).session(session);

        if (!withdrawal) {
            await session.abortTransaction();

            return res.status(404).json({
                success: false,
                message: "Withdrawal not found"
            });
        }

        if (withdrawal.status !== "pending") {
            await session.abortTransaction();

            return res.status(400).json({
                success: false,
                message: "Withdrawal already processed"
            });
        }

        const wallet =
            await Wallet.findOne({
                user: withdrawal.user
            }).session(session);

        if (!wallet) {
            await session.abortTransaction();

            return res.status(404).json({
                success: false,
                message: "Wallet not found"
            });
        }

        wallet.pendingWithdrawals -= withdrawal.amount;

        await wallet.save({session})

        withdrawal.status =
            "rejected";

        await withdrawal.save({session});

        await session.commitTransaction();

        return res.status(200).json({
            success: true,
            message: "Withdrawal rejected"
        });
    }catch(error) {
        await session.abortTransaction();

        return res.status(500).json({
            success: false,
            message: error.message
        })
    } finally {
        await session.endSession();
    }
    };

exports.getWithdrawalHistory = async (req,res)=>{
    try {

        const filter = {};

        if(req.user.role !== "admin"){
            filter.user = req.user.id;
        }


        if(req.query.status){
            filter.status = req.query.status;
        }


        const withdrawals =
            await Withdrawal.find(filter)
                .populate(
                    "user",
                    "fullName email phone"
                )
                .sort({
                    createdAt:-1
                });


        res.status(200).json({
            success:true,
            totalWithdrawals:withdrawals.length,
            data:withdrawals
        });


    } catch(error){

        res.status(500).json({
            success:false,
            message:error.message
        });

    }
};

exports.getAllWithdrawals = async (req,res)=>{
    try{

        const withdrawals = await Withdrawal.find()
            .populate(
                "user",
                "fullName email phone"
            )
            .sort({
                createdAt:-1
            });

        return res.status(200).json({
            success:true,
            total:withdrawals.length,
            data:withdrawals
        });

    }catch(error){

        return res.status(500).json({
            success:false,
            message:error.message
        });

    }
}