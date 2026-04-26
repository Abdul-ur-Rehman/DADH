const express = require("express");
const router = express.Router();
const { saveTemplate, getTemplatesByDoctor } = require("../controllers/TempleateNotecontroller");

// POST /api/templates
router.post("/savetemplate", saveTemplate);

// GET /api/templates/:doctorId
router.get("/:doctorId", getTemplatesByDoctor);

module.exports = router;
