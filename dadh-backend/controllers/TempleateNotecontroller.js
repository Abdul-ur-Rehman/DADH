const Template = require("../models/TemplateNotes"); // ✅ same name as exported model

// ✅ Save Template
const saveTemplate = async (req, res, next) => {
  try {
    const { name, content, doctorId } = req.body;

    if (!name || !content || !doctorId) {
      return res.status(400).json({
        state: false,
        message: "Name, content, and doctorId are required",
      });
    }

    // Check for existing template with same name and doctorId
    const existingTemplate = await Template.findOne({ name, doctorId });
    if (existingTemplate) {
      return res.status(400).json({
        state: false,
        message: "Template with the same name already exists.",
      });
    }

    const newTemplate = new Template({ name, content, doctorId });
    await newTemplate.save();

    return res.status(201).json({
      state: true,
      message: "Template saved successfully",
      data: newTemplate,
    });
  } catch (err) {
    console.error("Error saving template:", err);
    next(err);
  }
};


// ✅ Get All Templates for a Doctor (string based)
const getTemplatesByDoctor = async (req, res, next) => {
  try {
    const { doctorId } = req.params;

    if (!doctorId) {
      return res.status(400).json({
        state: false,
        message: "doctorId is required",
      });
    }

    // ✅ No ObjectId check because doctorId is string
    const templates = await Template.find({ doctorId }).sort({ createdAt: -1 });

    return res.status(200).json({
      state: true,
      count: templates.length,
      message: "Templates fetched successfully",
      data: templates,
    });
  } catch (err) {
    next(err);
  }
};




module.exports = { saveTemplate, getTemplatesByDoctor };
