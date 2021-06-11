const express = require('express')
const router = express.Router();

const { scheduleInterview,getUpcomingInterviews} = require("../controllers/interviews.js");

router.post("/scheduleInterview",scheduleInterview)
router.get("/upcomingInterviews",getUpcomingInterviews)

module.exports = router