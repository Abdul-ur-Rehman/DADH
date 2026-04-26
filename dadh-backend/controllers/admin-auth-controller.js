const Admin = require("../models/admin-model");
const comparePassword = require("../utils/compare-password");
const generateToken = require("../utils/generate-token");
const hashPassword = require("../utils/hash-password");
const Billing = require('../models/billing-model'); // ✅ Adjust path if needed



const getAllPaymentDocumentsForAdmin = async (req, res, next) => {
  try {
    const billings = await Billing.find()
      .populate({
        path: "patientId",
        select: "name",
      })
      .populate({
        path: "doctorId",
        select: "name",
      })
      .select("documentUrl status issued_at createdAt patientId doctorId")
      .lean();

    const result = billings
      .filter((b) => b.patientId && b.doctorId && b.documentUrl)
      .map((b) => ({
        id: b._id,
        date: b.issued_at || b.createdAt,
        doctorName: b.doctorId.name || "Unknown",
        patientName: b.patientId.name || "Unknown",
        documentUrl: b.documentUrl,
        status: b.status || "Pending",
      }));

    if (!result.length) {
      return res
        .status(200)
        .json({ state: true, message: "No documents found.", billings: [] });
    }

    res.status(200).json({
      state: true,
      total_documents: result.length,
      billings: result,
    });
  } catch (err) {
    next(err);
  }
};



const register = async (req, res, next) => {
  try {
    const {
      username,
      email,
      password, 
      level,
      isActive,
    } = req.body;

    // Check if email already exists
    const isEmailExist = await Admin.findOne({ email });
    if (isEmailExist) {
      return res.status(400).json({
        state: false,
        message: "Email already exists",
      });
    }

    // Hash the password
    const hashed_password = await hashPassword(password, next);

    // Create new admin with all fields
    const admin = new Admin({
      username,
      email,
      password: hashed_password,
      level,
      isActive,
    });

    // Save admin
    await admin.save();

    res.status(201).json({
      state: true,
      message: "Admin created successfully",
      data: admin,
    });
  } catch (err) {
    next(err);
  }
};


const deleteById = async (req, res) => {
  try {
    const deletedAdmin = await Admin.findByIdAndDelete(req.params.id);

    if (!deletedAdmin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    res.json({ message: 'Admin deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const updateById = async (req, res) => {
  try {
    const { username, email, level, isActive } = req.body; 

    const updatedAdmin = await Admin.findByIdAndUpdate(
      req.params.id,
      { username, email, level, isActive },
      { new: true }
    );

    if (!updatedAdmin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    res.json({ message: 'Admin updated successfully', admin: updatedAdmin });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const toggleActiveById = async (req, res) => {
  try {
    const { isActive } = req.body;

    const admin = await Admin.findByIdAndUpdate(
      req.params.id,
      { status: isActive }, // ✅ update `status`, not `isActive` if your model uses `status`
      { new: true }
    );

    if (!admin) {
      return res.status(404).json({ state: false, message: "Admin not found" });
    }

    res.status(200).json({ state: true, message: "Status updated", data: admin });
  } catch (error) {
    console.error(error);
    res.status(500).json({ state: false, message: "Error toggling status" });
  }
};





const getOne = async (req, res, next) => {
  try {
    const adminId = req.params.id;
    const admin = await Admin.findOne({ _id: adminId });
    if (!admin) {
      return res
        .status(400)
        .json({ state: false, message: "admin not found" });
    }
    res.status(200).json({
      state: true,
      data: admin,
    });
  } catch (error) {
    next(error);
  }
};
  const getAll = async (req, res, next) => {
  try {
    const admins = await Admin.find();

    if (!admins || admins.length === 0) {
      return res.status(404).json({
        state: false,
        message: "No admins found",
      });
    }

    res.status(200).json({
      state: true,
      data: admins,
    });
  } catch (error) {
    console.error("Error fetching admins:", error);
    res.status(500).json({
      state: false,
      message: "Server error while fetching admins",
    });
  }}

const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username });
    if (!admin) {
      console.log("admin", admin);
      return res.status(400).json({ state: false, message: "Admin not found" });
    }
    const isPasswordMatch = await comparePassword(
      password,
      admin.password,
      next
    );
    if (!isPasswordMatch) {
      return res
        .status(400)
        .json({ state: false, message: "Password is incorrect" });
    }
    const token = await generateToken(admin, next);
    res.status(200).json({
      state: true,
      message: "Login successful",
      token: token,
      data: admin,
      role: admin.role,
      level: admin.level,
    });
  } catch (err) {
    next(err);
  }
};


module.exports = {
  login,
  register,
  getAll,
  getOne,
  deleteById,
  toggleActiveById,
  updateById,
  getAllPaymentDocumentsForAdmin
};