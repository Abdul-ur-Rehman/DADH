const express = require("express");
const router = express.Router();
// const authController = require("../controllers/general-controller.js");
const consultationCategoryController = require("../controllers/consultation-category-controller.js");

router.get('/getAll', consultationCategoryController.getAllCategories);
router.get('/getOne/:id', consultationCategoryController.getcategoryById);
router.patch('/updateOneById/:id', consultationCategoryController.updateCategoryById);
router.post('/add', consultationCategoryController.addConsultationCategory);
router.delete('/deleteById/:id', consultationCategoryController.deleteConsultationCategory);
router.post('/getOneByKey', consultationCategoryController.getcategoryByKey);

module.exports = router;

// int a = 10