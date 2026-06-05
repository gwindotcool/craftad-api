const Payment = require("../models/Payment");
const User = require("../models/User");
const Job = require("../models/Job");
const { sendNotification } = require("../utils/notify");

exports.makePayment = async (req, res) => {
    try {
        const { jobId } = req.params;
        const job = await Job.findById( jobId )
        if (!job) {
            return res.status(404).send({
                success: false,
                message: "Job not found."
            })
        }
        if (job.status !== "completed") {
            return res.status(400).send({
                success: false,
                message: "Job must be completed before payment"
            })
        }
        if (job.customer.toString() !== req.user.id) {
            return res.status(403).send({
                success: false,
                message: "Only customer can pay"
            })
        }
        const existingPayment = await Payment.findOne({job:jobId})
        if (!existingPayment) {
            return res.status(400).send({
                success: false,
                message: "Payment already made",
            })
        }
        const payment = await Payment.create({
            job: jobId,

            customer:req.user.id,

            artisan:job.assignedArtisan,

            amount:job.budget,

            status: "successful",

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
        return res.status(200).send({
            success: true,
            message: "Payment successful",
            data: payment,

        })

    }catch (error) {
        res.status(400).send({
            success: false,
            message: error.message
        })
    }
}