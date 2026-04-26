const express = require('express');
const router = express.Router();
const medicineController = require('../controllers/medicine-controller');

router.post('/add-medicine', medicineController.addMedicine);
router.get('/getAll', medicineController.getAllMedicines);
// router.get('/:doctorId', medicineController.getMedicine);

module.exports = router;