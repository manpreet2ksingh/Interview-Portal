const Participant = require('../models/participants');
const Interview   = require('../models/interview') 
dateformat = require('dateformat')

exports.scheduleInterview = (req,res)=>{
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

    var conflictCheck = false;
    var date = data.date;
    var slot = data.slot;
    for(var i=0;i<temp.length;i++)
    {
        Participant.find({"email":temp[i].email}).exec((error,p)=>{
            if(error)
            {
                res.status(400).json({
                    error:'Error'
                })
            }

            var pschedule = p[0].interviews; // pschedule - participant schedule
            for(var j=0;j<pschedule.length;j++)
            {
                if(pschedule[j].date == date)
                {
                    var booked = pschedule[j].slot;
                    for(var k=0;k<booked.length;k++)
                    {
                        if((slot.start>=booked[i].start && slot.start<=booked[i].end) ||
                           (slot.end>=booked[i].start && slot.end<=booked[i].end))
                        {
                            conflictCheck = true;
                            break;
                        }
                    }
                    break;
                }
            }
        })
    }

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
    {   return res.status(200).json({
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

exports.getUpcomingInterviews = (req,res)=>{
    var d = dateformat(new Date(),"yyyy-mm-dd hh:MM");

    s = updateString(d);
    var date = s.substr(0,8);
    var time = s.substr(9);

    // Interview.find().exec((error,data)=>{
    //     if(error)
    //     {
    //         return res.status(400).json({
    //             error:"Error finding interviews"
    //         })
    //     }
    //     return res.json(data);
    // })

    // Interview.find({$or:[
    //     {date:{$gt:date}},
    //     {$and:[
    //         {date:{$e:date}},
    //         {"timeSlot.start":{$gt:time}}
    //     ]}
    // ]},(error,data)=>{
    //     if(error)
    //     {
    //         return res.status(400).json({
    //             error:"Error finding interviews"
    //         })
    //     }
    //     return res.json(data);
    // })
    Interview.find({date:{$gt:date}},
    (error,data)=>{
        if(error)
        {
            return res.status(400).json({
                error:"Error finding interviews"
            })
        }
        return res.json(data);
    })
}
