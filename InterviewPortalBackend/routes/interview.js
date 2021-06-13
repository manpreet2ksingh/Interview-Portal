const express = require('express')
const router = express.Router();

const { scheduleInterview,
        getUpcomingInterviews,
        interviewById,
        editInterview} = require("../controllers/interviews.js");

router.post("/scheduleInterview",scheduleInterview)
router.post("/editInterview/:id",editInterview)
router.get("/upcomingInterviews",getUpcomingInterviews)

router.param("id",interviewById);

module.exports = router