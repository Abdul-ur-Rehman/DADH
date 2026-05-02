# DADH Telemedicine — Production Roadmap

10-phase plan from current state (~40% complete vs. WGL Proposal v1.3) to production launch.

**Core principle:** every phase is independently shippable. After completing any phase, the app still works end-to-end and the change can be verified in isolation.

---

## Working Assumptions

| Decision | Default | Override? |
|---|---|---|
| Design system | Tailwind CSS + shadcn/ui | TBD |
| Visual direction | Healthcare-professional minimalism (clean whites, single accent — medical blue/teal, generous spacing) | TBD |
| Approach | Mobile-first (most patients on phones) | TBD |
| Framework | React + CRA (no Next.js migration) | — |
| Language | JavaScript (no TypeScript migration) | — |
| Replaces | The current MUI + Bootstrap + Reactstrap mix | — |

---

## Phase 1 — Code Stabilization *(1–1.5 weeks)*

**Goal:** Make every currently-claimed feature actually work. No new features. No UI changes.

**Scope:**
- Fix `API_URL=""` in `src/helpers/api_helper.js:8` → read from `process.env.REACT_APP_BACKEND_URL`
- Fix mis-wired routes: `/doctor/billing` and `/doctor/support` in `routes/allRoutes.js:212, 215` (currently render the LOGIN page)
- Move hardcoded values to `.env`:
  - Sendbird App ID (7 files)
  - Resend API key (`emailController.js:11`)
  - `localhost:5001` URL (`SidebarContent.js:79`)
- Fix two undefined model references that crash on call:
  - `Certificate` in `consultations-controller.js:1341`
  - `DoctorRequest` in `doctor-requests-controller.js:188`
- Add `documentUrl` + `status` fields to `billing-model.js` (admin payment grid expects them)
- Wire patient profile save (5 TODOs in `PatientProfile.js`) — local edits currently never POST to backend
- Spanish translation: replace Italian leakage (`"Nuova"` → `"Nuevo"`, `"Proyectos"` → `"Perfil"`)
- Stop returning OTP in login response body (`doctor-auth-controller.js:206–207`)
- Wire `notes-router.js` and `patient-details.js` in `index.js` (defined but never mounted)
- Remove `*.copy.js` backup files, orphan models, all `console.log` debug statements

**Acceptance:** Walk through patient signup → login → book → video → prescription → billing AND doctor signup → admin-approve → login → consult → end. Both flows succeed without crashes.

---

## Phase 2 — Security Hardening *(1.5 weeks)*

**Goal:** Lock the doors before users arrive. No UI work.

**Scope:**
- `express-rate-limit` on `/login`, `/verify-otp`, `/resend-otp`, `/register` (5 attempts / 15 min)
- `helmet` middleware for security headers
- Tighten CORS — replace `*` with explicit allowed origins
- Real Twilio SMS integration — replace placeholder creds, OTPs actually go to phones
- Field-level encryption for medical PII (Medicare number, DOB, conditions, medications) using `mongoose-field-encryption` or similar
- bcrypt salt rounds increase to ≥12
- JWT secret rotation strategy (separate dev/prod secrets)
- Add request body size limits (`express.json({ limit: "1mb" })`)
- Add `npm audit fix` pass + Snyk/Dependabot setup

**Acceptance:** Brute-force the login with 100 attempts → blocked after 5. SMS actually arrives. PII fields appear encrypted in raw MongoDB queries.

---

## Phase 3 — Design System Foundation *(2 weeks)*

**Goal:** Build the new UI library *without breaking any existing page*. Old pages keep working with old styling.

**Scope:**
- Install Tailwind CSS + configure with the chosen palette (e.g., primary blue `#0066FF`, neutrals, semantic colors)
- Install shadcn/ui CLI; scaffold core components: `Button`, `Input`, `Card`, `Modal`, `Table`, `Badge`, `Avatar`, `Toast`, `Sidebar`, `Form`
- Create `src/components/ui/` directory for new components — old `src/components/Common/` stays untouched
- Build a shared `AppLayout` skeleton (top nav + collapsible sidebar + content area) — modern, mobile-responsive
- Migrate ONE proof-of-concept page (Login) to the new system; verify it works end-to-end
- Set up Storybook (optional but recommended) for component preview
- Document design tokens (colors, spacing, typography) in `src/styles/theme.md`

**Acceptance:** Login page is fully redesigned. Every other page in the app still works exactly as before. No regressions in existing flows.

---

## Phase 4 — Patient Portal Redesign + Missing Features *(2.5 weeks)*

**Goal:** Patient-facing pages get the modern UI + finish the spec items.

**Scope:**
- **Redesign all patient pages** with new design system: signup, login, OTP, home/dashboard, profile, consultation booking flow (`ConsultationCategorySelector` + `PatientStep2`), consultation history, certificates view
- **Add** chat attachment upload (Sendbird supports natively, just wire UI)
- **Add** "Request Certificate" button — new endpoint + patient action that flags consultation
- **Replace** mock data on patient home with real API calls
- Fix incoming-call banner UX (current is SweetAlert with 3s polling — replace with proper toast + Socket.io)

**Acceptance:** A patient can sign up, log in, book a consultation, video-call, request a certificate, view prescription, and download it — all on the new UI, on mobile and desktop.

---

## Phase 5 — Doctor Portal Redesign + Missing Features *(3 weeks)*

**Goal:** Doctor pages on new UI + finish doctor spec items.

**Scope:**
- **Redesign** doctor signup (now with file upload for license/credentials), login, OTP, dashboard (queue), consultation page, billing, settings, history
- **Add** Multer-backed document upload at signup (license PDF, ID, qualification certs)
- **Add** Doctor settings/preferences page (telehealth toggle, home-visit toggle, notification prefs)
- **Add** Status-complete validation: block "Mark Complete" until certificate + prescription + billing code all submitted (modal blocker + backend check)
- **Add** Note templates UI (backend `templateRoutes.js` already exists, just wire frontend)
- **Add** 1-year and custom date-range filters for consultation history
- **Add** Chat attachments (parallel to patient side)

**Acceptance:** Doctor signs up with documents → admin approves → logs in → sees patient queue → conducts consult → adds cert + rx + bill → marks complete (and is blocked if any are missing). Templates work. Custom date filters work.

---

## Phase 6 — Admin Portal Redesign + Critical Features *(3 weeks)*

**Goal:** Admin gets full operational control + new UI.

**Scope:**
- **Redesign** admin dashboard, doctor management, patient management, billing, login
- **Add** Doctor approval workflow: signup creates `pending` status, admin sees pending queue, approves/rejects with notes, only-then can doctor log in
- **Add** Settings/preferences management page (system-wide config: consultation categories, billing codes, medicines)
- **Add** Real analytics dashboard with actual counts: total doctors, patients, consultations, revenue. Time-series charts for daily/weekly/monthly. Replace hardcoded "1,685 / 52,368 / 15.8" mock cards in `AdminHome.js:34–66`
- **Add** Logs viewer page with date filters (last 7d / 30d / 1y / custom range)
- **Add** Payment doc download — single doc, multi-select bulk download (zip), download-all
- **Add** Admin can prescribe a doctor's prescriber/provider number during approval (currently no UI)

**Acceptance:** Admin can: approve a pending doctor, see real metrics on dashboard, filter logs by date, bulk-download payment docs, and configure consultation categories — all with new UI.

---

## Phase 7 — Real-Time & Push Notifications *(2 weeks)*

**Goal:** Calls and chat work properly even when the app isn't in focus.

**Scope:**
- Wire FCM (Firebase Cloud Messaging) via existing `firebase-admin` dep — backend sends push when consultation starts or doctor calls
- Service worker registration on frontend for web push
- Browser Notification API permission flow at first login
- Replace 3-second polling in `PatientHome.js` with Socket.io live events (Socket.io is already in deps but unused)
- Auto chat persistence: localStorage cache of unsent messages + reconnect logic
- "Doctor calling" full-screen overlay on patient side (instead of SweetAlert)
- "Patient joined" notification on doctor side

**Acceptance:** Patient closes browser tab → doctor calls → push notification appears on phone/desktop → clicking it opens call screen. Chat survives accidental refresh with no message loss.

---

## Phase 8 — Support Tickets + Audit Logging *(2 weeks)*

**Goal:** Operations and compliance.

**Scope:**
- New `Ticket` model (subject, description, attachments, status: open/in-progress/resolved, priority, role, userId)
- Patient + doctor "Contact Support" form with attachment upload
- Admin support inbox page with filter, search, status updates, replies
- Email notifications on ticket creation/reply via Resend
- Install Winston logging across all controllers (replace remaining `console.log`s)
- New `AuditLog` collection + middleware that records: login events, OTP attempts, consultation lifecycle (created, assigned, paused, completed, referred), doctor approvals, admin actions
- Audit log viewer accessible to admin only (paginated, filterable by user/action/date)

**Acceptance:** A patient submits a ticket → admin sees it in inbox → replies → patient gets email. Every login + status change appears in audit log within 1 second.

---

## Phase 9 — Infrastructure, CI/CD & Backups *(2 weeks)*

**Goal:** Production deployment pipeline. App can be deployed by anyone with one command.

**Scope:**
- Dockerfile for backend + frontend
- `docker-compose.yml` for local dev (backend + frontend + MongoDB)
- Multi-env configs: `.env.development`, `.env.staging`, `.env.production`
- GitHub Actions pipeline: lint → test → build → deploy on push to main/staging
- Daily MongoDB backups (Atlas auto-backup OR cron + `mongodump` → S3, with 30-day retention)
- HTTPS via Let's Encrypt + nginx reverse proxy
- Health check endpoints: `/healthz` (basic), `/readyz` (deep — checks DB, Sendbird, Tencent)
- Sentry integration for error monitoring (frontend + backend)
- VPS provisioning per the proposal — could be DigitalOcean / Hetzner / AWS Lightsail
- Domain + SSL setup
- Production environment variable management (1Password / Vault / AWS Secrets Manager)

**Acceptance:** Push commit to staging branch → CI runs tests → deploys to staging URL within 10 min. MongoDB backup runs daily and is restorable.

---

## Phase 10 — QA, Testing & Production Launch *(2.5 weeks)*

**Goal:** Bug-free launch.

**Scope:**
- Backend unit tests with Jest: every controller's happy + error paths (target ≥60% coverage on controllers)
- Frontend component tests with React Testing Library on critical flows (login, booking, consult)
- Playwright E2E tests for: patient booking → consult → billing flow + doctor approval → consult → complete flow
- Mobile responsiveness audit on iPhone, Android, tablet sizes (Chrome DevTools + real-device testing)
- Performance pass: code-splitting, image optimization, MongoDB indexes on frequent queries (`patientId`, `doctorId`, `isCompleted`)
- Vulnerability assessment per the proposal — OWASP ZAP scan + manual pen test
- Bug bash (internal team or QA contractor)
- Production deployment + smoke tests
- After-Development Documentation per proposal Deliverable-6

**Acceptance:** All E2E tests green. Pen test report has zero critical/high findings. Production URL live and serving real users.

---

## Total Estimated Effort

| Phase | Weeks | Cumulative |
|---|---|---|
| 1 — Stabilize | 1.5 | 1.5 |
| 2 — Security | 1.5 | 3 |
| 3 — Design system | 2 | 5 |
| 4 — Patient redesign | 2.5 | 7.5 |
| 5 — Doctor redesign | 3 | 10.5 |
| 6 — Admin redesign | 3 | 13.5 |
| 7 — Push & realtime | 2 | 15.5 |
| 8 — Tickets & audit | 2 | 17.5 |
| 9 — Infra & CI/CD | 2 | 19.5 |
| 10 — QA & launch | 2.5 | 22 |

**~22 weeks (5–6 months)** for a small team (2 backend + 2 frontend + 1 QA + 1 designer for first 2 months). Faster with more parallelism, slower if it's a solo dev.

---

## Independence Proof — Stop Anywhere

| If you ship after... | What you'd have |
|---|---|
| Phase 1 | Working app with old UI but no broken features |
| Phase 2 | Same, but safe to put in front of real users |
| Phase 3 | Same + a redesigned login page (proof of new UI direction) |
| Phase 4 | Patients see new UI, doctors/admins still on old |
| Phase 5 | Patients + doctors on new UI |
| Phase 6 | Whole app on new UI + all spec features done |
| Phase 7 | + Reliable real-time experience |
| Phase 8 | + Support workflow + compliance trail |
| Phase 9 | + Production deployment infrastructure |
| Phase 10 | Launchable to real paying users |

You could ship to a **small private beta after Phase 6**. Phases 7–10 are about polish, scale, and trust.
