require('dotenv').config();
const express = require('express')
const app = express()
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')

const participantRoutes = require('./routes/participants')
const interviewRoutes = require('./routes/interview')

app.use(cors())
app.use(morgan('dev'))
app.use(bodyParser.json());

app.use("/api",participantRoutes)
app.use("/api",interviewRoutes)

mongoose.connect(
    process.env.MONGO_URI,
    {
        useNewUrlParser:true,
        useUnifiedTopology:true}
    )
    .then(()=>console.log("DB connected"))
    .catch(error=>console.log(error))

app.get("/",(req,res)=>{
    res.send("Hello");
})


const PORT = process.env.PORT || 3000

app.listen(PORT,()=>{
    console.log(`Server is up and running on PORT ${PORT}`);
})
