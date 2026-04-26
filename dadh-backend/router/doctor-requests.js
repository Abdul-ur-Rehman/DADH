const express = require('express')
const router = express.Router()
const doctorRequestController = require('../controllers/doctor-requests-controller');


router.get('/getAll', doctorRequestController.getDoctorRequests);
router.get('/getOneById/:id',doctorRequestController.getDoctorRequestById);
router.patch('/approve-doctor/:id',doctorRequestController.approveDoctorRequestById);
router.patch("/toggleActive/:id", doctorRequestController.toggleActive);
router.delete("/deleteById/:id",doctorRequestController.deleteById);
router.get('/check-prescriber/:prescriberNumber',doctorRequestController.getCheckPrescriberNumber);
router.get('/check-provider/:providerNumber',doctorRequestController.getCheckProviderNumber);
router.patch('/update-doctor/:id',doctorRequestController.updateDoctorById);
router.get('/generatePrescriberNumber', doctorRequestController.generatePrescriberNumber);
router.get('/generateProviderNumber ', doctorRequestController.generateProviderNumber );



module.exports = router;