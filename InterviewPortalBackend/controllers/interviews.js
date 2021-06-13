const Participant = require('../models/participants');
const Interview   = require('../models/interview') 
dateformat = require('dateformat')

async function checkConflict(temp,date,slot)
{
    var conflictCheck = false;
    for(var i=0;i<temp.length;i++)
    {
        const p = await Participant.find({"email":temp[i].email});
        // console.log(p);
            var pschedule = p[0].interviews; // pschedule - participant schedule
            for(var j=0;j<pschedule.length;j++)
            {
                if(pschedule[j].date == date)
                {
                    var booked = pschedule[j].slot;
                    // console.log(booked);
                    // console.log(booked.length);
                    for(var k=0;k<booked.length;k++)
                    {
                        if((slot.start>=booked[k].start && slot.start<=booked[k].end) ||
                           (slot.end>=booked[k].start && slot.end<=booked[k].end))
                        {
                            conflictCheck = true;
                            break;
                        }
                    }
                    break;
                }
            }
    }
    if(conflictCheck)
        return true;
    return false;
}

async function updateParticipantsData(email,date,slot)
{
    const p = await Participant.find({"email":email});
    var t = p[0].interviews;
    var check = false; // to check if date already exists or not
    for(var j=0;j<t.length;j++)
    {
        if(t[j].date == date)
        {
            check = true;
            t[j].slot.push(slot);
            break;
        }
    }
    if(check)
    {
        await Participant.updateOne({"email":email},{
            $set:{
                interviews:t
            }
        });
    }
    else
    {
        var obj = {
            date:date,
            slot:[{
                start:slot.start,
                end:slot.end
            }]
        }
        await Participant.updateOne({"email":email},{
            $push:{
                interviews:obj
            }
        });
    }
}

exports.interviewById = (req,res,next,id)=>{
        Interview.findById(id).exec((error,p)=>{
            if(error)
            {
                return res.status(400).json({
                    error:"Error"
                })
            }
            req.profile = p;
            next();
        });
}

exports.scheduleInterview = async (req,res)=>{
    const data = req.body;
    // data - topic,array(p{name,email}),date,slot{start,end}
    // p - participants

    var temp = data.p; // temporary array of participants selected for interview 

    if(temp.length < 2)
    {
        return res.status(400).json({
            error:"Minimum Number of Participants must be 2"
        })
    }

    var date = data.date;
    var slot = data.slot;
   
    var conflictCheck = await checkConflict(temp,date,slot);

    // conflict check - false; then update 
    // 1.) interviews collections
    // 2.) participants scheduled interviews data
    
    if(conflictCheck)
    {
        return res.status(400).json({
            error:"Participant interview time already scheduled"
        })
    }
    else
    {
        for(var i=0;i<temp.length;i++)
        {
            await updateParticipantsData(temp[i].email,date,slot);
        }  
        // updating interview collection
        await Interview.create(data);
        return res.status(200).json({
            success:"Participants interview scheduled successfully"
        })
    }
}

function updateString(d)
{
    s="";
    for(var i=0;i<d.length;i++)
    {
        if(d[i]!='-' && d[i]!=':')
            s = s + d[i]
    }
    return s;
}

exports.getUpcomingInterviews = async (req,res)=>{
    var d = dateformat(new Date(),"yyyy-mm-dd hh:MM");

    s = updateString(d);
    var date = s.substr(0,8);
    var time = s.substr(9);

    const upcomingInterviews = await Interview.find({$or:[
        {date:{$gt:date}},
        {$and:[
            {date:date},
            {"timeSlot.start":{$gt:time}}
        ]}
    ]},{createdAt:0,updatedAt:0,__v:0});
    return res.json(upcomingInterviews);
}

exports.editInterview = async (req,res)=>{

    const data = req.body;
    // data - topic,array(p{name,email}),date,slot{start,end}
    // p - participants

    var temp = data.p; // temporary array of participants selected 
                       // for interview 

    const response = await Interview.find({_id:req.profile._id});
        // console.log("Response ",response);
        var previousDate = response[0].date;
        var previousSlot = response[0].slot;

        var previousParticipantsList = response[0].p;
        var updatedParticipantsList  = temp;

        for(var k=0;k<previousParticipantsList.length;k++)
        {
            var email = previousParticipantsList[k].email;
            const x = await Participant.find({email:email}); // returns array
            for(var j=0;j<x[0].interviews.length;j++)
            {
                if(x[0].interviews[j].date == previousDate)
                {
                    var bookedSlots = x[0].interviews[j].slot;
                    for(var t=0;t<bookedSlots.length;t++)
                    {
                        if((bookedSlots[t].start == previousSlot.start) && 
                            bookedSlots[t].end == previousSlot.end)
                        {
                            // console.log("DONE");
                            bookedSlots.splice(t,1);
                            break;
                        }
                    }
                    x[0].interviews[j].slot = bookedSlots;
                    break;
                }
            }
            await Participant.updateOne({email:email},{
                $set:{interviews:x[0].interviews}
            })
        }

    if(temp.length < 2)
    {
        return res.status(400).json({
            error:"Minimum Number of Participants must be 2"
        })
    }

    var date = data.date;
    var slot = data.slot;
   
    var conflictCheck = await checkConflict(temp,date,slot);
    if(conflictCheck)
    {
        for(var k=0;k<previousParticipantsList.length;k++)
        {
            var email = previousParticipantsList[k].email;
            await updateParticipantsData(email,previousDate,previousSlot);
        }
        return res.status(400).json({
            error:"Participant interview time already scheduled"
        })
    }
    else
    {
        for(var k=0;k<updatedParticipantsList.length;k++)
        {
            var email = updatedParticipantsList[k].email;
            await updateParticipantsData(email,date,slot);
        }

        await Interview.findOneAndUpdate({_id:req.profile._id},
            {$set:{
                     date:date,
                     slot:slot,
                     p:temp,
                     topic:data.topic,
                 }
            }
        )
        return res.status(200).json({
            success:"Interview updated successfully"
        })
    }

}
