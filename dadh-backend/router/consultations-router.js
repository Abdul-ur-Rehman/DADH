const express = require("express");
const router = express.Router();
const consultationsController = require('../controllers/consultations-controller') 


router.put('/update/:consultationId',consultationsController.updateConsultation);
router.get("/getAll",consultationsController.getAllConsultations);
router.get("/getConsultations",consultationsController.getConsultations);
router.get("/referrals/:doctorId", consultationsController.getReferralsForDoctor);
router.post("/add",consultationsController.addConsultation);
router.get("/history/:patientId",consultationsController.getHistoryPatient); 
router.get("/getConsulationByPatient/:id",consultationsController.getConsultationByPatient);
router.get("/getConsulationByDoctor/:id",consultationsController.getConsultationByDoctor);

router.get('/callStatusByPatient/:id', consultationsController.getConsultationCallStatusByPatient);

router.get("/getBillingsByDoctorId/:doctorId", consultationsController.getBillingsByDoctorId);
router.get("/getOneById/:id", consultationsController.getOneById);
router.patch("/assignDoctor", consultationsController.assignConsultToDoctor);
router.patch("/getActiveConsultationByPatient", consultationsController.getActiveConsultationByPatient); 
router.patch("/referDoctor", consultationsController.referDoctor);
router.patch("/investigation/add", consultationsController.addInvestigateion);
router.patch("/certification/add", consultationsController.addCertification);
router.get("/patientCertificate/:consultationId",consultationsController.getCertifications);
router.patch("/prescribtion/add/:id", consultationsController.addPrescribtion);
router.patch("/pause/:id", consultationsController.pauseConsultation);
router.patch("/requeuePatient", consultationsController.requeuePatient);
router.patch("/AIScribeNote/add", consultationsController.addScribeNote);
router.get("/get/AIScribeNote/:id", consultationsController.getAIScribeNote);
router.patch("/medication/add", consultationsController.addMedication);
router.post("/medications/getAll", consultationsController.getMedications);
router.post("/medication/getOneByIndex", consultationsController.getMedicationByIndex);
router.patch("/medication/update/:index", consultationsController.updateMedicationByIndex);
router.delete("/medication/delete/:index", consultationsController.deleteMedicationByIndex);
router.patch("/condition/add", consultationsController.addCondition);
router.post("/conditions/getAll", consultationsController.getConditions);
router.post("/condition/getOneByIndex", consultationsController.getConditionByIndex);
router.patch("/condition/update/:index", consultationsController.updateConditionByIndex);
router.delete("/condition/delete/:index", consultationsController.deleteConditionByIndex);

router.get("/getTotalDoctorConsultationsToday/:id", consultationsController.getTotalDoctorConsultationsToday);
// router.get("/getDoctorConsultationStats", consultationsController.getDoctorConsultationStats);
router.get("/totalPatientsByConsultation/:id", consultationsController.totalPatientsByConsultation);
router.get("/totalCurrentDayConsultationsCount/:id", consultationsController.TotalCurrentDayConsultationsCount);
router.get("/lastSevenDaysConsultations/:id", consultationsController.getLast7DaysConsultations);
router.get("/incompleteBillings/:id", consultationsController.getIncompleteBillingConsultations);
router.get("/checkIsDuplicate", consultationsController.checkIsDuplicate);
router.get("/doctor/:id/notes", consultationsController.getNotesByDoctorId);

module.exports = router;
