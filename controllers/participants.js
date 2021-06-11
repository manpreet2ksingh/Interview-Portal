const Participant = require('../models/participants');

exports.participantById = (req,res,next,id)=>{
    Participant.findById(id).exec((error,p)=>{
        if(error)
        {
            res.status(400).json({
                error:'Error'
            })
        }
        req.profile = p;
        next();
    })
}


exports.getAllParticipants = (req,res)=>{
    Participant.find().exec((error,p)=>{
        if(error)
        {
            res.status(400).json({
                error:'Error'
            })
        }
        res.json(p)
    })
}

exports.addParticipant = (req,res)=>{
    const p = new Participant(req.body);  
    p.save((error,pt)=>{
        if(error)
        {
            return res.status(400).json({
                error:"Error"
            })
        }
        res.json({pt})
    })
}

exports.getParticipantDetails = (req,res)=>{
    if(req.profile!=undefined)
    {
        Participant.findById(req.profile._id).exec((error,p)=>{
            if(error)
            {
                return res.status(400).json({
                    error:"Error"
                })
            }
            res.json(p)
        })
    }
    else
    {
        return res.status(400).json({
            error:"Participant not in database"
        })
    }
}