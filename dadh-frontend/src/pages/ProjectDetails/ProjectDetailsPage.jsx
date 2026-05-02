import React from 'react';
import './ProjectDetailsPage.css';

export default function ProjectDetailsPage() {
  return (
    <div className="project-details-container">
      <header className="project-header">
        <img src="/logo.svg" alt="DADH Logo" className="project-logo" />
        <h1>Dial A Home Doctor (DADH)</h1>
        <p className="tagline">Australian Telemedicine Platform</p>
      </header>

      <main className="project-content">
        {/* Project Description */}
        <section className="section">
          <h2>📋 Project Overview</h2>
          <p>
            DADH is a comprehensive telemedicine platform designed for the Australian healthcare market.
            It enables patients to book consultations with doctors, facilitates real-time communication via
            video/audio calls and chat, supports prescription management, certificate generation, and
            provides administrative tools for managing doctors, patients, and billing.
          </p>
          <p className="highlights">
            <strong>Key Features:</strong> Patient consultation booking • Doctor queue management •
            Real-time video/audio calls • Integrated chat messaging • AI-assisted clinical notes •
            Electronic prescriptions • Medical certificates • Billing management • Admin dashboard
          </p>
        </section>

        {/* Technology Stack */}
        <section className="section">
          <h2>🛠️ Technology Stack</h2>

          <div className="tech-section">
            <h3>Frontend</h3>
            <ul>
              <li><strong>React 18</strong> - UI framework with functional components and hooks</li>
              <li><strong>React Router v7</strong> - Client-side routing and navigation</li>
              <li><strong>Redux + Redux-Saga</strong> - State management for legacy scaffolding</li>
              <li><strong>Tailwind CSS v3</strong> - Utility-first styling (preflight disabled)</li>
              <li><strong>Sendbird UIKit</strong> - Real-time messaging and chat integration</li>
              <li><strong>Tencent TRTC</strong> - Video and audio call capabilities</li>
              <li><strong>i18next</strong> - Internationalization support</li>
              <li><strong>Bootstrap 5 + MUI</strong> - Legacy UI components</li>
              <li><strong>Lucide React</strong> - Icon library (v0.475.0)</li>
            </ul>
          </div>

          <div className="tech-section">
            <h3>Backend</h3>
            <ul>
              <li><strong>Node.js + Express 4</strong> - RESTful API server</li>
              <li><strong>MongoDB + Mongoose 8</strong> - Document database with ODM</li>
              <li><strong>JWT</strong> - Authentication with OTP flows</li>
              <li><strong>Zod</strong> - Schema validation at route level</li>
              <li><strong>Socket.io</strong> - Real-time communication support</li>
              <li><strong>Helmet</strong> - Security middleware</li>
              <li><strong>Twilio</strong> - SMS notifications</li>
              <li><strong>Resend</strong> - Email service</li>
              <li><strong>Deepgram</strong> - Audio transcription</li>
              <li><strong>Cohere AI</strong> - AI-assisted note generation</li>
              <li><strong>Firebase Admin</strong> - Backend services</li>
              <li><strong>mongoose-field-encryption</strong> - Encrypted patient data fields</li>
            </ul>
          </div>
        </section>

        {/* Project Structure */}
        <section className="section">
          <h2>📁 Project Structure</h2>
          <div className="structure">
            <p><strong>Repository:</strong> Two independent applications in one monorepo</p>
            <ul>
              <li><code>dadh-frontend/</code> - React 18 CRA application</li>
              <li><code>dadh-backend/</code> - Node.js/Express API with MongoDB</li>
            </ul>

            <p className="mt-4"><strong>Backend Directory Structure:</strong></p>
            <ul>
              <li><code>router/</code> - Route definitions</li>
              <li><code>controllers/</code> - Business logic handlers</li>
              <li><code>models/</code> - Mongoose schemas</li>
              <li><code>middlewares/</code> - Validators and error handlers</li>
              <li><code>services/</code> - External integrations (Deepgram, Tencent)</li>
              <li><code>utils/</code> - Helper functions</li>
              <li><code>uploads/</code> - File storage directory</li>
            </ul>

            <p className="mt-4"><strong>Frontend Directory Structure:</strong></p>
            <ul>
              <li><code>src/pages/</code> - Page components for each role (Admin, Doctor, Patient)</li>
              <li><code>src/components/</code> - Reusable UI components and layouts</li>
              <li><code>src/routes/</code> - Route definitions and middleware</li>
              <li><code>src/styles/</code> - Tailwind configuration and global styles</li>
              <li><code>src/helpers/</code> - API calls and utility functions</li>
            </ul>
          </div>
        </section>

        {/* Dependencies */}
        <section className="section">
          <h2>📦 Dependencies</h2>

          <div className="dependencies-section">
            <h3>System Requirements</h3>
            <ul>
              <li><strong>Node.js:</strong> v16 or higher</li>
              <li><strong>npm/yarn:</strong> Package manager</li>
              <li><strong>MongoDB:</strong> Local or cloud instance (v4.4+)</li>
              <li><strong>Git:</strong> Version control</li>
            </ul>
          </div>

          <div className="dependencies-section">
            <h3>Environment Variables</h3>
            <p><strong>Backend (.env):</strong></p>
            <ul>
              <li><code>JWT_SECRET</code> - Minimum 32 characters for token signing</li>
              <li><code>URI</code> - MongoDB connection string</li>
              <li><code>ALLOWED_ORIGINS</code> - CORS whitelist (comma-separated)</li>
              <li><code>TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE</code> - SMS service</li>
              <li><code>RESEND_API_KEY</code> - Email service</li>
              <li><code>DEEPGRAM_API_KEY</code> - Audio transcription</li>
              <li><code>COHERE_API_KEY</code> - AI services</li>
              <li><code>TENCENT_*</code> - Video/audio call configuration</li>
              <li><code>ENCRYPTION_KEY, ENCRYPTION_SIGNING_KEY</code> - Field encryption</li>
            </ul>

            <p className="mt-2"><strong>Frontend (.env):</strong></p>
            <ul>
              <li><code>REACT_APP_BACKEND_URL</code> - Backend API endpoint (default: http://localhost:5001/api)</li>
              <li><code>REACT_APP_SENDBIRD_APP_ID</code> - Chat service configuration</li>
              <li><code>REACT_APP_*</code> - Firebase and other service keys</li>
            </ul>
          </div>
        </section>

        {/* Setup & Run Instructions */}
        <section className="section">
          <h2>🚀 How to Run</h2>

          <div className="setup-section">
            <h3>1️⃣ Clone the Repository</h3>
            <code className="code-block">
              git clone {"<repository-url>"}<br />
              cd DADH
            </code>
          </div>

          <div className="setup-section">
            <h3>2️⃣ Backend Setup</h3>
            <code className="code-block">
              cd dadh-backend<br />
              npm install<br />
              # Create .env file with required variables<br />
              npm start
            </code>
            <p>Server starts on <code>http://localhost:5001</code></p>
          </div>

          <div className="setup-section">
            <h3>3️⃣ Frontend Setup</h3>
            <code className="code-block">
              cd ../dadh-frontend<br />
              npm install<br />
              # Create .env file with required variables<br />
              npm start
            </code>
            <p>Application opens on <code>http://localhost:3000</code></p>
          </div>

          <div className="setup-section">
            <h3>4️⃣ Build for Production</h3>
            <code className="code-block">
              # Frontend<br />
              cd dadh-frontend<br />
              npm run build<br />
              <br />
              # Backend runs with<br />
              npm start
            </code>
          </div>
        </section>

        {/* Available Scripts */}
        <section className="section">
          <h2>📝 Available Commands</h2>

          <div className="commands-section">
            <h3>Backend Commands</h3>
            <ul>
              <li><code>npm start</code> - Start development server</li>
              <li>Database: MongoDB connection validated on startup</li>
              <li>Security: Helmet middleware, CORS validation, rate limiting</li>
            </ul>
          </div>

          <div className="commands-section">
            <h3>Frontend Commands</h3>
            <ul>
              <li><code>npm start</code> - Start development server (port 3000)</li>
              <li><code>npm run build</code> - Create production build</li>
              <li><code>npm test</code> - Run test suite</li>
              <li><code>npm run lint</code> - Run ESLint</li>
            </ul>
          </div>
        </section>

        {/* Roles */}
        <section className="section">
          <h2>👥 User Roles</h2>
          <div className="roles-grid">
            <div className="role-card">
              <h3>👨‍⚕️ Doctor</h3>
              <p>View patient queue, accept consultations, video/audio calls, prescribe medications, issue certificates, manage billing</p>
              <p className="login-route">Login: <code>/doctor/login</code></p>
            </div>
            <div className="role-card">
              <h3>🏥 Admin</h3>
              <p>Manage doctors (approve/block), manage patients, view consultations, handle billing codes and settings</p>
              <p className="login-route">Login: <code>/admin/login</code></p>
            </div>
            <div className="role-card">
              <h3>👤 Patient</h3>
              <p>Book consultations, video/audio calls, chat with doctors, view history, request certificates, manage profile</p>
              <p className="login-route">Login: <code>/patient/login</code></p>
            </div>
          </div>
        </section>

        {/* API Routes */}
        <section className="section">
          <h2>🔌 Main API Routes</h2>
          <code className="code-block">
            /api/doctor/auth - Doctor authentication<br />
            /api/admin/auth - Admin authentication<br />
            /api/patient/auth - Patient authentication<br />
            /api/consultations - Consultation management<br />
            /api/doctor-requests - Doctor requests & approvals<br />
            /api/billing - Billing codes & management<br />
            /api/doctor - Doctor profile & info<br />
            /api/medicines - Prescription database<br />
            /api/templates - Clinical note templates<br />
            /uploads - File storage endpoint
          </code>
        </section>

        {/* Next Steps */}
        <section className="section">
          <h2>📌 Next Steps</h2>
          <ol>
            <li>Configure <code>.env</code> files for both frontend and backend</li>
            <li>Ensure MongoDB is running and accessible</li>
            <li>Start the backend server first</li>
            <li>Start the frontend application</li>
            <li>Navigate to <code>http://localhost:3000</code> and use role-specific login pages</li>
          </ol>
        </section>

        {/* Links */}
        <section className="section footer-section">
          <h2>🔗 Quick Links</h2>
          <div className="links-grid">
            <a href="/doctor/login" className="btn btn-primary">Doctor Login</a>
            <a href="/admin/login" className="btn btn-primary">Admin Login</a>
            <a href="/patient/login" className="btn btn-primary">Patient Login</a>
          </div>
        </section>
      </main>

      <footer className="project-footer">
        <p>Dial A Home Doctor - Australian Telemedicine Platform</p>
      </footer>
    </div>
  );
}
