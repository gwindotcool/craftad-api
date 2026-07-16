const Transaction =
    require("../models/Transaction");


exports.getTransactions =
    async(req,res)=>{

        try{


            const transactions =
                await Transaction.find({
                    user:req.user.id
                })
                    .sort({
                        createdAt:-1
                    });


            res.json({

                success:true,

                data:transactions

            });


        }catch(error){

            res.status(500).json({

                success:false,

                message:error.message

            });

        }

    };