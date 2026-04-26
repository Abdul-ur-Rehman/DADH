const Doctor = require("../models/doctor-model");

const getDoctorRequests = async (req, res, next) => {
  try {
    const doctors = await Doctor.find();
    res.status(200).json({ state: true, data: doctors });
  } catch (err) {
    next(err);
  }
};

const getDoctorRequestById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const doctor = await Doctor.findById({ _id: id });
    if (!doctor) {
      return res
        .status(404)
        .json({ state: false, message: "Doctor not found" });
    }
    return res.status(200).json({ state: true, data: doctor });
  } catch (err) {
    next(err);
  }
};


const updateDoctorApproval = async (req, res, next) => {
  try {
    const id = req.params.id;
    const doctor = await Doctor.findByIdAndUpdate(
      id,
      { isActive: true },
      { new: true } // Returns the updated document
    );

    if (!doctor) {
      return res.status(404).json({ state: false, message: "Doctor not found" });
    }

    return res.status(200).json({ state: true, message: "Doctor approved successfully", data: doctor });
  } catch (err) {
    next(err);
  }
};

const generatePrescriberNumber = async (req, res, next) => {

  try {
    const doctor = await Doctor.findOne().sort({ _id: -1 });
    if (!doctor) {
      return res
        .status(500)
        .json({ state: false, message: "some error occurred" });
    }
    let prescriberNumber = Number(doctor.prescriberNumber) + 1;
    return res.status(200).json({
      prescriberNumber: prescriberNumber
    })
  } catch (error) {
    next(error);
  }
};
const generateProviderNumber = async (req, res, next) => {

  try {
    const doctor = await Doctor.findOne().sort({ _id: -1 });
    if (!doctor) {
      return res
        .status(500)
        .json({ state: false, message: "some error occurred" });
    }
    let providerNumber = Number(doctor.providerNumber) + 1;
    return res.status(200).json({
      providerNumber: providerNumber
    })
  } catch (error) {
    next(error);
  }
};

const updateDoctorById = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!id) {
      return res.status(400).json({ success: false, message: 'Doctor ID is required' });
    }

    // Check if prescriberNumber is being updated and is already used
    if (updateData.prescriberNumber) {
      const existingPrescriber = await Doctor.findOne({
        prescriberNumber: updateData.prescriberNumber,
        _id: { $ne: id }, // Exclude the doctor being updated
      });

      if (existingPrescriber) {
        return res.status(409).json({
          success: false,
          message: 'Prescriber number is already in use by another doctor',
        });
      }
    }

    // Check if providerNumber is being updated and is already used
    if (updateData.providerNumber) {
      const existingProvider = await Doctor.findOne({
        providerNumber: updateData.providerNumber,
        _id: { $ne: id }, // Exclude the doctor being updated
      });

      if (existingProvider) {
        return res.status(409).json({
          success: false,
          message: 'Provider number is already in use by another doctor',
        });
      }
    }

    const updatedDoctor = await Doctor.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedDoctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    return res.status(200).json({ success: true, message: 'Doctor updated successfully', data: updatedDoctor });
  } catch (error) {
    console.error('Error updating doctor:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};


const getCheckPrescriberNumber = async (req, res) => {
  try {
    const { prescriberNumber } = req.params; // Extract the prescriberNumber from the URL parameter

    // Check if a doctor already exists with the given prescriber number
    const existingDoctor = await Doctor.findOne({ prescriberNumber });

    if (existingDoctor) {
      // If a doctor with the given prescriber number exists, return a message
      return res.status(400).json({
        success: false,
        message: 'Prescriber number already exists',
      });
    }

    // If no doctor exists with the given prescriber number, return available
    res.status(200).json({
      success: true,
      message: 'Prescriber number is available',
    });
  } catch (error) {
    console.error('Error checking prescriber number:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

const getCheckProviderNumber = async (req, res) => {
  try {
    const { providerNumber } = req.params;

    const existingDoctor = await Doctor.findOne({ providerNumber });

    if (existingDoctor) {
      return res.status(400).json({
        success: false,
        message: 'Provider number already exists',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Provider number is available',
    });
  } catch (error) {
    console.error('Error checking provider number:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
  const getActiveDoctorRequestById = async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;

  try {
    const updated = await DoctorRequest.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    );
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const deleteById = async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndDelete(req.params.id);

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.status(200).json({ message: "Doctor deleted successfully" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


const toggleActive = async (req, res) => {
  try {
    const { status } = req.body;
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    res.status(200).json({ message: "Doctor status updated", data: doctor });
  } catch (error) {
    res.status(500).json({ message: "Error updating doctor status", error });
  }
};



const approveDoctorRequestById = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!id) {
      return res.status(400).json({ success: false, message: 'Doctor ID is required' });
    }

    // Check if prescriberNumber already exists in another doctor
    const existPrescriber = await Doctor.findOne({
      prescriberNumber: updateData.prescriberNumber,
      _id: { $ne: id } // Exclude current doctor by ID
    });

    if (existPrescriber && updateData.prescriberNumber) {
      return res.status(400).json({
        success: false,
        message: 'prescriberNumber already exists',
      });
    }

    // Check if providerNumber already exists in another doctor
    const existProvider = await Doctor.findOne({
      providerNumber: updateData.providerNumber,
      _id: { $ne: id } // Exclude current doctor by ID
    });

    if (existProvider && updateData.providerNumber) {
      return res.status(400).json({
        success: false,
        message: 'providerNumber already exists',
      });
    }

    // Update the doctor and approve
    const updatedDoctor = await Doctor.findByIdAndUpdate(
      id,
      { ...updateData, isActive: true }, // Make sure to includehere
      { new: true }
    ).select(
      'name surname email phone city state doctorType qualification isActive isSignatureProvided signature startDate isHomeVisit workType isOnline isConsulting activeConsultationId consultedPatients prescriberNumber providerNumber'
    );

    if (!updatedDoctor) {
      return res.status(404).json({ success: false, message: 'Doctor request not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Doctor request approved successfully',
      data: updatedDoctor,
    });
  } catch (error) {
    console.error('Error updating doctor request:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};



module.exports = {
  toggleActive,
  getDoctorRequests,
  getDoctorRequestById,
  updateDoctorById,
  generatePrescriberNumber,
  updateDoctorApproval,
  approveDoctorRequestById,
  getCheckPrescriberNumber,
  generateProviderNumber,
  getCheckProviderNumber,
  getActiveDoctorRequestById,
  deleteById
};