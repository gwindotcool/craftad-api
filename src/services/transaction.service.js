const Transaction = require("../models/Transaction");


exports.createTransaction = async({

                                      user,
                                      type,
                                      amount,
                                      direction,
                                      description,
                                      job,
                                      session

                                  })=>{


    const transaction =
        await Transaction.create(
            [
                {
                    user,
                    type,
                    amount,
                    direction,
                    description,
                    job,
                    reference:
                        "TX-" + Date.now()
                }
            ],
            {
                session
            });


    return transaction[0];

};