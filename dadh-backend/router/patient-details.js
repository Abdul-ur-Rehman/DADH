const express = require('express')
const router = express.Router()
const PatientDetailstController = require('../controllers/petient-details-controller');


router.get('/getAll', PatientDetailstController.getPatientDetails);
router.get('/getOneById/:id',PatientDetailstController.getPatientDetailsById);


module.exports = router;
