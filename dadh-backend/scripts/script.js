const mongoose = require('mongoose');
const ConsultationModel = require('../models/consultations-model');
const connectDB = require("../config/db-connect");
const DoctorModel = require('../models/doctor-model');
const PatientModel = require('../models/patient-model');
const ConsultationCategoryModel = require('../models/consultation-category-model');
const Consultation = require('../models/consultations-model');
const Doctor = require('../models/doctor-model');
const Patient = require('../models/patient-model');
// const Invoices = require('../models/invoices-model');


connectDB().then(async () => {
/* DELETE ALL */
// try {
//   const result = await ConsultationModel.deleteMany({});
//   console.log("Deleted " + result.deletedCount + " Documents");

// } catch (err) {
//   console.error('Error Delete documents:', err);
// } finally {
//   // Close the database connection
//   mongoose.connection.close();
// }

// try {
//   const result = await PatientModel.deleteMany({});
//   console.log("Deleted " + result.deletedCount + " Documents");

// } catch (err) {
//   console.error('Error Delete documents:', err);
// } finally {
//   // Close the database connection
//   mongoose.connection.close();
// }

/* Update ALL */

  // try {
  //   const result = await Patient.deleteMany();
  //   console.log(`${result.Patient} delete updated `);
  // } catch (err) {
  //   console.error('Error deleting documents:', err);
  // } finally {
  //   mongoose.connection.close();
  // }

 try {
    const result = await Consultation.deleteMany();
    console.log(`${result.Consultation} delete updated `);
  } catch (err) {
    console.error('Error deleting documents:', err);
  } finally {
    mongoose.connection.close();
  }

  //  try {
  //   const result = await Invoices.deleteMany();
  //   console.log(`${result.Invoices} delete updated `);
  // } catch (err) {
  //   console.error('Error deleting documents:', err);
  // } finally {
  //   mongoose.connection.close();
  // }

  //   try {
  //   const result = await Doctor.deleteMany();
  //   console.log(`${result.modifiedCount} records updated `);
  // } catch (err) {
  //   console.error('Error updating documents:', err);
  // } finally {
  //   mongoose.connection.close();
  // }

  /* DELETE BASE ON CRITERIA*/
//   try {
//     const result = await ConsultationCategoryModel.deleteMany( { key: "test" } );
//     console.log("Deleted " + result.deletedCount + " Documents");
//   } catch (err) {
//     console.error('Error deleting documents:', err);
//   } finally {
//     mongoose.connection.close();
//   }
 });
