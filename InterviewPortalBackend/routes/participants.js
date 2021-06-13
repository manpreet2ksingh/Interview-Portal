const express = require('express')
const router = express.Router();

const { getParticipantDetails,
        participantById,
        getAllParticipants,
        addParticipant } = require("../controllers/participants");

router.get("/participants",getAllParticipants)
router.post('/addParticipant',addParticipant);
router.get("/participants/:id",getParticipantDetails);

router.param("id",participantById);

module.exports = router