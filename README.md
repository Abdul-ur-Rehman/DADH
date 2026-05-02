# 🏥 Dial A Home Doctor (DADH)

**Australian Telemedicine Platform** — A comprehensive healthcare solution enabling patients to book consultations with qualified doctors through real-time video/audio calls, integrated messaging, and complete medical record management.

![License](https://img.shields.io/badge/license-MIT-blue)
![Node](https://img.shields.io/badge/Node-v16+-green)
![React](https://img.shields.io/badge/React-18-61dafb)
![MongoDB](https://img.shields.io/badge/MongoDB-4.4+-13aa52)

---

## 📋 Project Overview

DADH is a full-stack telemedicine platform built for the Australian healthcare market. It connects patients, doctors, and administrators through a seamless digital platform that supports:

- **Patient Features:** Consultation booking, real-time doctor communication, prescription management, medical certificates, consultation history
- **Doctor Features:** Patient queue management, video/audio calls, clinical note-taking (AI-assisted), prescriptions, certificate issuance, billing management
- **Admin Features:** Doctor approval workflows, patient/doctor management, consultation oversight, billing code management, system configuration

### Key Capabilities
- 🎥 Real-time video/audio consultations (Tencent TRTC)
- 💬 Integrated chat messaging (Sendbird)
- 📝 AI-assisted clinical notes (Cohere AI)
- 📋 Digital prescriptions and medical certificates
- 💳 Comprehensive billing management
- 🔐 Secure JWT authentication with OTP
- 🌍 Multi-language support (i18next)
- 📱 Responsive design across all devices

---

## 🛠️ Technology Stack

### Frontend
- **React 18** — Modern UI framework with hooks and functional components
- **React Router v7** — Client-side routing and navigation
- **Redux + Redux-Saga** — State management for legacy scaffolding
- **Tailwind CSS v3** — Utility-first styling (preflight disabled)
- **Sendbird UIKit** — Real-time messaging and chat integration
- **Tencent TRTC** — Video and audio call capabilities
- **i18next** — Internationalization support
- **Lucide React** — Icon library (v0.475.0)
- **Bootstrap 5 + MUI** — Legacy UI components (gradual migration)

### Backend
- **Node.js + Express 4** — RESTful API server
- **MongoDB + Mongoose 8** — Document database with ODM
- **JWT** — Token-based authentication with OTP flows
- **Zod** — Schema validation at route level
- **Socket.io** — Real-time communication support
- **Helmet** — Security middleware for HTTP headers
- **Twilio** — SMS notifications
- **Resend** — Email service
- **Deepgram** — Audio transcription
- **Cohere AI** — AI-assisted clinical note generation
- **Firebase Admin** — Backend services integration
- **mongoose-field-encryption** — Encrypted patient data fields (address, zipCode, notes)

---

## 📁 Project Structure

```
DADH/
├── dadh-frontend/          # React 18 CRA application
│   ├── public/
│   ├── src/
│   │   ├── pages/          # Role-specific pages (Admin, Doctor, Patient)
│   │   ├── components/     # Reusable UI components and layouts
│   │   ├── routes/         # Route definitions and middleware
│   │   ├── helpers/        # API utilities and helpers
│   │   ├── styles/         # Tailwind config and global styles
│   │   ├── context/        # React Context providers
│   │   └── App.js          # Main app component
│   └── package.json
│
├── dadh-backend/           # Node.js/Express API
│   ├── router/             # Route definitions
│   ├── controllers/        # Business logic handlers
│   ├── models/             # Mongoose schemas
│   ├── middlewares/        # Validators and error handlers
│   ├── services/           # External integrations
│   ├── utils/              # Helper functions
│   ├── uploads/            # File storage directory
│   ├── index.js            # Server entry point
│   └── package.json
│
├── CLAUDE.md               # Project development guidelines
└── README.md               # This file
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v16 or higher
- **npm** or **yarn** package manager
- **MongoDB** v4.4+ (local or cloud instance)
- **Git** for version control

### Environment Setup

#### 1. Clone the Repository
```bash
git clone https://github.com/your-org/DADH.git
cd DADH
```

#### 2. Backend Configuration

```bash
cd dadh-backend
npm install

# Create .env file with required variables
cat > .env << EOF
# Server
PORT=5001
NODE_ENV=development

# Database
URI=mongodb://localhost:27017/dadh_project

# JWT Authentication
JWT_SECRET=your-secret-key-here-minimum-32-characters
JWT_EXPIRES_IN=7d

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5000

# Encryption (for patient data fields)
ENCRYPTION_KEY=your-encryption-key-32-chars-min
ENCRYPTION_SIGNING_KEY=your-signing-key-32-chars-min

# SMS Service (Twilio)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE=+61XXXXXXXXX

# Email Service (Resend)
RESEND_API_KEY=your-resend-api-key

# AI & Audio Services
DEEPGRAM_API_KEY=your-deepgram-api-key
COHERE_API_KEY=your-cohere-api-key

# Tencent TRTC (Video Calls)
TENCENT_SECRET_ID=your-tencent-secret-id
TENCENT_SECRET_KEY=your-tencent-secret-key
TENCENT_APP_ID=your-tencent-app-id
TRTC_SECRET_KEY=your-trtc-secret-key
SDKAppID=your-sdk-app-id
SECRET_KEY=your-secret-key
EXPIRE_TIME=86400
TENCENT_BUCKET=your-tencent-bucket
TENCENT_REGION=ap-sydney

# Firebase
FIREBASE_PROJECT_ID=your-firebase-project
FIREBASE_PRIVATE_KEY=your-firebase-private-key
FIREBASE_CLIENT_EMAIL=your-firebase-email
EOF

# Start backend server
npm start
```

The backend server will start on **http://localhost:5001**

#### 3. Frontend Configuration

```bash
cd ../dadh-frontend
npm install

# Create .env file with required variables
cat > .env << EOF
# API Configuration
REACT_APP_BACKEND_URL=http://localhost:5001/api

# Sendbird Chat Configuration
REACT_APP_SENDBIRD_APP_ID=your-sendbird-app-id

# Firebase Configuration (optional for legacy features)
REACT_APP_FIREBASE_API_KEY=your-firebase-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-auth-domain
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-storage-bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id

# Default Auth Method
REACT_APP_DEFAULTAUTH=firebase
EOF

# Start frontend development server
npm start
```

The frontend application will open on **http://localhost:3000**

---

## 📝 Available Commands

### Backend Commands

```bash
cd dadh-backend

# Start development server
npm start

# Database validation happens automatically on startup
# Server listens on http://localhost:5001
# API documentation: http://localhost:5001/api
```

### Frontend Commands

```bash
cd dadh-frontend

# Start development server with hot reload
npm start

# Create production build
npm run build

# Run test suite
npm test

# Run ESLint
npm run lint

# Eject configuration (⚠️ irreversible)
npm run eject
```

---

## 🔌 API Routes

### Authentication
- `POST /api/doctor/auth/login` — Doctor login
- `POST /api/admin/auth/login` — Admin login
- `POST /api/patient/auth/login` — Patient login
- `POST /doctor/auth/verify-otp` — OTP verification
- `POST /api/patient/auth/logout` — Logout

### Consultations
- `GET /api/consultations/getAll` — Get all consultations
- `GET /api/consultations/getOneById/:id` — Get single consultation
- `POST /api/consultations/create` — Create consultation
- `PATCH /api/consultations/assignDoctor` — Assign doctor
- `PATCH /api/consultations/update/:id` — Update consultation
- `POST /api/billing/end/consultation/:id` — End consultation
- `PATCH /api/consultations/requeuePatient` — Requeue patient

### Doctor Management
- `GET /api/doctor-requests/getAll` — List all doctor requests
- `PATCH /api/doctor-requests/approve-doctor/:id` — Approve doctor
- `PATCH /api/doctor-requests/toggleActive/:id` — Activate/deactivate doctor
- `PATCH /api/doctor-requests/update-doctor/:id` — Update doctor profile

### Patient Management
- `GET /api/patient/auth/getAll` — List all patients
- `GET /api/patient/auth/getOneById/:id` — Get patient details
- `PATCH /api/patient/auth/update/:id` — Update patient profile
- `PATCH /api/patient/auth/upload-photo/:id` — Upload patient photo

### Billing
- `GET /api/billing/getAllBilling` — Get all billing codes
- `POST /api/billing/add` — Add billing code
- `PATCH /api/billing/updateOne/:id` — Update billing code
- `DELETE /api/billing/deleteById/:id` — Delete billing code
- `PATCH /api/consultations/billing/:id` — Add billing to consultation

### Additional Endpoints
- `GET /api/consultationCategory/getAll` — Get consultation categories
- `GET /api/medicines` — Get medicine database
- `GET /api/templates/:doctorId` — Get clinical templates
- `POST /api/ai-scribe` — AI note generation
- `GET /uploads/:filename` — Download file

---

## 👥 User Roles

### 👨‍⚕️ Doctor
**Login:** `http://localhost:3000/doctor/login`

Access to:
- Patient queue management
- Consultation details and history
- Video/audio call interface
- Prescription management
- Certificate issuance
- Billing code selection
- Patient messaging
- Clinical notes with AI assistance

### 🏥 Admin
**Login:** `http://localhost:3000/admin/login`

Access to:
- Doctor request approvals and management
- Doctor activation/deactivation
- Patient management and search
- Consultation oversight
- Billing code configuration
- System settings and configuration

### 👤 Patient
**Login:** `http://localhost:3000/patient/login`

Access to:
- Consultation booking
- View available doctors
- Video/audio calls
- Chat with assigned doctor
- Prescription history
- Medical certificates
- Consultation history
- Profile and account settings

---

## 🔐 Security Features

- **JWT Authentication** — Token-based auth with configurable expiry
- **OTP Verification** — SMS-based one-time password for sensitive operations
- **Field Encryption** — Patient sensitive data encrypted at database level
- **Helmet Security** — HTTP security headers middleware
- **CORS Validation** — Explicit origin whitelist
- **Rate Limiting** — Prevent brute force attacks
- **Zod Validation** — Schema validation on all routes
- **Password Hashing** — bcrypt for secure password storage

---

## 📊 Database Models

### Core Models
- **Patient** — Patient profiles with encrypted address/zipCode
- **Doctor** — Doctor profiles with credentials and signature
- **Consultation** — Consultation records with encrypted notes
- **Billing** — Billing codes and rates
- **Prescription** — Prescription records
- **Certificate** — Medical certificates
- **Invoice** — Billing invoices

---

## 🐛 Troubleshooting

### Backend Connection Issues
```bash
# Check MongoDB connection
# Verify URI in .env matches running MongoDB instance
# Common: mongodb://localhost:27017/dadh_project

# Check port availability
lsof -i :5001  # Verify port 5001 is free
```

### Frontend Not Loading
```bash
# Clear cache and node_modules
cd dadh-frontend
rm -rf node_modules package-lock.json
npm install
npm start
```

### API Requests Failing
```bash
# Verify backend is running
curl http://localhost:5001/api/health

# Check CORS configuration in .env
# Ensure REACT_APP_BACKEND_URL is correct in frontend .env

# Verify JWT_SECRET is set (minimum 32 characters)
```

### Sendbird Chat Not Working
```bash
# Verify REACT_APP_SENDBIRD_APP_ID is set in frontend .env
# Check Sendbird dashboard for valid app configuration
# Ensure sendBirdUserId is stored in localStorage after login
```

---

## 📚 Development Guidelines

For detailed development guidelines, patterns, and conventions, refer to:
- **CLAUDE.md** — Project development context and architecture patterns
- **`.claude/docs/architectural_patterns.md`** — Detailed codebase patterns
- **`.claude/skills/dadh-commit/SKILL.md`** — Git commit workflow

---

## 🔄 Deployment

### Frontend Build
```bash
cd dadh-frontend
npm run build

# Production build output in ./build/
# Can be served with any static server
```

### Backend Deployment
```bash
cd dadh-backend

# Set NODE_ENV=production
export NODE_ENV=production

# Ensure all environment variables are configured
npm start

# Consider using process managers like PM2
pm2 start index.js --name "dadh-backend"
```

### Environment Checklist
- [ ] All required environment variables configured
- [ ] MongoDB URI points to production database
- [ ] JWT_SECRET is strong and unique (32+ characters)
- [ ] CORS ALLOWED_ORIGINS configured for production domain
- [ ] Twilio, Resend, and other 3rd party keys validated
- [ ] Encryption keys properly secured and backed up
- [ ] HTTPS enabled on production
- [ ] Rate limiting configured appropriately

---

## 📄 License

This project is licensed under the MIT License — see LICENSE file for details.

---

## 📞 Support & Contact

For issues, feature requests, or questions:
1. Check existing issues in the repository
2. Refer to CLAUDE.md for development context
3. Review API documentation in backend code
4. Check Sendbird, Tencent TRTC, and Deepgram documentation for service-specific issues

---

## 🎯 Roadmap

- [ ] Enhanced prescription management UI
- [ ] Prescription delivery integration
- [ ] Insurance claim management
- [ ] Expanded reporting and analytics
- [ ] Mobile app (React Native)
- [ ] Telemedicine platform federation
- [ ] Enhanced AI diagnostic assistance

---

## ✅ Current Status

**Active Development** — Phase 6 (Admin Portal) complete. Phase 5 (Doctor Portal) and Phase 4 (Patient Portal) in refinement.

### Recent Fixes
- ✅ Mongoose `.lean()` applied to all queries to bypass encryption hooks
- ✅ Sendbird dynamic imports for Safari compatibility
- ✅ Dashboard enrichment pattern with immediate rendering
- ✅ Patient approval workflow implementation
- ✅ Billing code selection with 12-hour lock
- ✅ Stop Consultation and Requeue Patient functionality

---

## 👨‍💻 Development Team

Built with ❤️ for Australian healthcare.

---

**Last Updated:** May 2, 2026
**Node.js Version:** v16+
**React Version:** 18.x
**MongoDB Version:** 4.4+

For the latest development updates and current work, check the git commit history and CLAUDE.md.
