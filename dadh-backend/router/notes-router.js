// backend/routes/note.js
const router = require('express').Router();
const Consultation = require('../models/Consultation');   // Mongoose model

// PATCH  /api/consultations/AIScribeNote/add
router.patch('/AIScribeNote/add', async (req, res, next) => {
  try {
    const { consultationId, AIScribeNote } = req.body;
    if (!consultationId || !AIScribeNote?.trim()) {
      return res.status(400).json({ state: false, message: 'Missing fields' });
    }

    const updated = await Consultation.findByIdAndUpdate(
      consultationId,
      { AIScribeNote },
      { new: true }
    );

    // push live line to socket room (optional)
    req.app.get('io').to(consultationId).emit('transcriptLine', AIScribeNote);

    return res.json({ state: true, message: 'Scribe note saved', data: updated });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
