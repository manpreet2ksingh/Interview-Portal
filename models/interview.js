const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema(
    {
        topic: {
            type: String,
            trim: true,
            required:true,
            maxlength: 32
        },
        participants:[
            {
                name:String,
                email:String
            }
        ],
        date:{
            type:String,
            required:true
        },
        timeSlot:{
            start:String,
            end:String
        }
    },
    { timestamps: true }
)

module.exports = mongoose.model("Interview",interviewSchema)