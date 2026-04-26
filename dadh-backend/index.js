const express = require("express");
const app = express();
const path = require("path");
// const resend = require("resend");
const authDoctorRouter = require('./router/doctor-auth-router');
const adminRouter = require('./router/admin-router');
const patientRouter = require('./router/patient-router');
// const fetchRouter = require('./router/fetch-routes')
const cors = require("cors");
const connectDB = require("./config/db-connect");
const errorMiddleware = require('./middlewares/error-middleware');
const consultationCategoryRouter = require('./router/consultation-category-router');
const consultationsRouter = require('./router/consultations-router');
const doctorRequestRouter = require('./router/doctor-requests');
const doctorRouter = require('./router/doctor-router');
const billingRouter = require('./router/billing-router');
// const invoiceRouter = require('./router/invoice-router');
const chatRouter = require('./router/chat-router');
const billRouter = require('./router/bill-router');
const medicineRouter = require('./router/medicine-router');
const smsRouter = require('./router/smsRouter')
// import fetch, { Headers, Response, Request } from "node-fetch";
const templateRoutes = require("./router/templateRoutes");
const uploadRoutes = require("./router/uploadRouter");
const aiScribeRouter = require("./router/aiScribeRouter");
const recordingRoutes = require("./router/recordingRoutes");
const transcribeRoutes = require("./services/deepgramService");



// import('node-fetch').then(({ Headers }) => {
//   global.Headers = Headers;
// });

require("dotenv").config();

app.use(express.json());
app.use(cors({ origin: "*"})); 
const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:3000','http://localhost:3001','http://localhost:5174', 'https://c8d735a545f3.ngrok-free.app'],
  methods: "POST, PUT, DELETE, GET, PATCH, HEAD",
  credentials: true,
};
app.use(cors(corsOptions));


//middleware allow to use json data

app.use('/api/doctor/auth', authDoctorRouter);
app.use('/api/admin/auth', adminRouter);
app.use('/api/patient/auth', patientRouter);
// app.use('/api/fetch', fetchRouter);
app.use('/api/consultationCategory', consultationCategoryRouter);
app.use('/api/doctor', doctorRouter);
app.use('/api/consultations', consultationsRouter);
app.use('/api/doctor-requests', doctorRequestRouter);
app.use('/api/billing', billingRouter);
app.use('/api/bill', billRouter);
// app.use('/api/invoice', invoiceRouter);
app.use('/api/user-sign', chatRouter);
app.use('/api/medicines', medicineRouter)
app.use('/api/FamilyMembers', patientRouter);
app.use('/notification/sms',smsRouter);
app.use("/api/templates", templateRoutes);

// ✅ Serve static files from uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Use upload routes
app.use("/api/upload-audio", uploadRoutes);

app.use("/api", recordingRoutes);

app.use("/api/ai-scribe", aiScribeRouter);
// ✅ Import Transcribe Routes

app.use("/api/transcribe-latest", transcribeRoutes);



app.use(errorMiddleware);
// app.use(errorMiddleware)

connectDB().then(() => {
  app.listen(process.env.PORT, () =>
    console.log(`Server is running on port http://localhost:${process.env.PORT}`)
  );
});
