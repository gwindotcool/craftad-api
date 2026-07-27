const crypto = require("crypto");
const Transaction = require("../models/Transaction");

exports.createTransaction = async ({
         user,
         wallet,
         payment,
         withdrawal,
         job,
         type,
         amount,
         balanceBefore = 0,
         balanceAfter = 0,
         status = "successful",
         description = "",
         session = null,
     }) => {

    const transaction = {
        user,
        wallet,
        payment,
        withdrawal,
        job,
        type,
        amount,
        balanceBefore,
        balanceAfter,
        status,
        description,
        reference: `TXN-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`,
    };

    const docs = await Transaction.create(
        [transaction],
        { session }
    );

    return docs[0];
};