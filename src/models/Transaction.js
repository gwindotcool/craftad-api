const mongoose = require("mongoose");


const transactionSchema = new mongoose.Schema({

    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },


    type:{
        type:String,
        enum:[
            "earning",
            "withdrawal",
            "payment",
            "refund"
        ],
        required:true
    },


    amount:{
        type:Number,
        required:true,
        min:0
    },


    direction:{
        type:String,
        enum:[
            "credit",
            "debit"
        ],
        required:true
    },


    status:{
        type:String,
        enum:[
            "pending",
            "successful",
            "failed"
        ],
        default:"successful"
    },


    reference:{
        type:String,
        unique:true
    },


    description:{
        type:String
    },


    job:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Job"
    }


},{
    timestamps:true
});



module.exports =
    mongoose.model(
        "Transaction",
        transactionSchema
    );