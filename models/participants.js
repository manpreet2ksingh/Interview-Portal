const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
            required:true,
            maxlength: 32
        },
        email: {
            type: String,
            trim: true,
            required:true,
            unique: true
        },
        contact:{
            type: Number,
            required:true,
            maxlength:10
        },
        interviews:[
            {
                date: String,
                slot:[{
                    start:{
                        type:String,
                        required:true,
                        maxLength:4
                    },
                    end:{
                        type:String,
                        required:true,
                        maxLength:4
                    }
                }]
            }
        ]
    },
    { timestamps: true }
)


module.exports = mongoose.model("Participant",participantSchema)