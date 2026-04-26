const mongoose = require("mongoose");

const consultationDoctorNotesSchema = new mongoose.Schema({
  consultationId:{
    type: mongoose.Schema.Types.ObjectId,
    ref:'Consultation'
  },
  doctorNote:{
    type: String,
    trim: true
  }
},
  {
    timestamps: true,
  }
);
const ConsultationDoctorNotes = new mongoose.model("ConsultationDoctorNotes", consultationDoctorNotesSchema);
module.exports = ConsultationDoctorNotes;
