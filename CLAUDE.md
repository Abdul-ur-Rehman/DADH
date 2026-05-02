# CLAUDE.md

This file provides Claude Code project context for the DADH repository.

## Project Overview

DADH is a telemedicine platform for patients, doctors, and administrators. It supports patient consultation booking, doctor queue management, video/audio calls, Sendbird chat, AI-assisted clinical notes, prescriptions, certificates, billing, and admin operations.

The repository contains two independent apps:

- `dadh-frontend/` - React 18 CRA app.
- `dadh-backend/` - Node.js/Express API with MongoDB/Mongoose.

There is no separate committed Claude memory file in this repo. Persistent Claude guidance currently lives in this file, `.claude/docs/architectural_patterns.md`, `.claude/settings*.json`, and `.claude/skills/dadh-commit/SKILL.md`.

## Tech Stack

Backend:

- Node.js, Express 4, MongoDB/Mongoose 8.
- Socket.io dependency present.
- JWT auth with OTP flows.
- Zod validators through a shared route-level validator middleware.
- Security middleware: `helmet({ contentSecurityPolicy: false })`, JSON/urlencoded body limit of `1mb`, explicit CORS allowlist through `ALLOWED_ORIGINS`.
- External services: Twilio SMS, Resend email, Deepgram, Cohere AI, Tencent TRTC/COS, Firebase Admin.

Frontend:

- React 18, CRA/react-scripts, React Router v7.
- Redux + redux-saga for legacy layout/calendar/auth scaffolding.
- `AuthContext` exists, but current route protection is primarily based on localStorage flags.
- Tailwind v3 is added for migrated pages with preflight disabled.
- Legacy UI remains: Bootstrap 5, Reactstrap, MUI, mdbreact, legacy icon fonts.
- New UI shell/components live under `src/components/ui/`.
- Sendbird UIKit is still globally imported in `App.js`; migrated inbox pages use Sendbird SDK patterns.
- Tencent TRTC is used for call pages.
- i18next provides locale support.

## Repository Map

Backend (`dadh-backend/`):

- `index.js` - main API entrypoint. Loads `.env` before imports, validates `JWT_SECRET` and `URI`, applies security middleware, mounts routers, connects MongoDB, starts the server.
- `router/` - route definitions mounted from `index.js`.
- `controllers/` - domain logic, generally `try/catch` with `next(err)`.
- `models/` - Mongoose schemas for admin, doctor, patient, consultations, billing, invoices, medicines, notifications, templates.
- `middlewares/` - validator, global error handler, rate limiting.
- `validator/` - Zod auth schemas.
- `services/` - Deepgram and Tencent recording integrations.
- `utils/` - JWT, password helpers, SMS, Tencent user signature, recording download.
- `uploads/` - disk upload target, served at `/uploads`.

Frontend (`dadh-frontend/src/`):

- `App.js` - route rendering and global `SendbirdProvider`.
- `routes/allRoutes.js` - public/protected route tables.
- `routes/middleware/Authmiddleware.js` - role/session guard.
- `components/WithLayout.jsx` - chooses admin/doctor/patient layout behavior.
- `components/ui/` - migrated Tailwind component library and shared `AppLayout`.
- `components/AdminLayout/AdminAppLayout.jsx` - Phase 6 admin shell.
- `components/DoctorLayout/DoctorAppLayout.jsx` - Phase 5 doctor shell.
- `components/PatientLayout/PatientAppLayout.jsx` - Phase 4 patient shell.
- `pages/` - role-specific and legacy page components.
- `helpers/api_helper.js` - shared Axios instance, base URL from `REACT_APP_BACKEND_URL || "http://localhost:5001/api"`.
- `styles/tailwind.css` and `tailwind.config.js` - scoped Tailwind setup.
- `styles/theme.md` - design-token reference. Some values in this doc are older than the current teal config, so verify against `tailwind.config.js`.

## Current Frontend State

Migrated pages and shells:

- Phase 3: `DoctorLogin/DoctorLogin.js`.
- Phase 4 patient: `PatientLogin`, `PatientHome`, `PatientHistoryPage/PatientHistoryFull.jsx`, `PatientInboxPage/PatientInbox.js`, `PatientProfileAccount/PatientProfile.js`, `PatientLayout/PatientAppLayout.jsx`.
- Phase 5 doctor: `DoctorDashboard`, `DoctorConsultDetails/DoctorConsultDetailsNew.jsx`, `DoctorHistory/DoctorHistoryNew.jsx`, `DoctorBilling/DoctorBillingNew.jsx`, `DoctorSettings/DoctorSettings.jsx`, `DoctorInbox/DoctorInboxNew.jsx`, `DoctorLayout/DoctorAppLayout.jsx`.
- Phase 6 admin: `AdminLoginNew`, `AdminHomeDashboard`, `AdminDoctorsNew`, `AdminPatientsNew`, `AdminConsultationsNew`, `AdminSettingsNew`, `AdminLayout/AdminAppLayout.jsx`.

`WithLayout.jsx` behavior:

- `/admin*` pages use their own `AdminAppLayout` internally; old `AdminLayout` is skipped.
- Most `/doctor*` pages use their own `DoctorAppLayout`; `/doctor/support` and `/doctor/support-card` still use old `DoctorLayout`.
- `/patient*` routes are wrapped by `PatientAppLayout`.

Important current route spellings in `allRoutes.js`:

- Admin: `/admin/home`, `/admin/consultations`, `/admin/inbox`, `/admin/doctor-requests/table`, `/admin/patient-details/table`, `/admin/settings`.
- Doctor: `/doctor`, `/doctor/inbox`, `/doctor/consult-history`, `/doctor/my-account`, `/doctor/settings`, `/doctor/billing`, `/doctor/start-consult/:id`, `/doctor/start-consult/:id/details`, `/doctor/start-consult/:id/details/video`, `/doctor/start-consult/:id/details/audio`.
- Patient: `/patient`, `/patient/inbox`, `/patient/history`, `/patient/profile`, `/patient/detail-form`.

Older plans/docs may mention camelCase route paths such as `/doctor/consultHistory` or `/admin/doctorRequests/table`. Treat `allRoutes.js` as source of truth.

## Design System Rules

Current Tailwind config:

- `preflight: false`; do not enable Tailwind base reset.
- Content scanning is explicitly scoped to `src/components/ui`, migrated page folders, and migrated layout folders.
- Current primary palette is teal:
  - `primary`: `#0D7377`
  - `accent`: `#14B8A6`
  - `background`: `#FAFFFE`
  - `foreground`: `#111E1F`
  - `border/input`: `#D1E8E8`
  - `success`: `#22C55E`
  - `destructive`: `#EF4444`

Rules for migrated pages:

- Wrap new Tailwind pages in `<div className="dadh-tw-root">`.
- Use relative imports; CRA is not configured for `@/` aliases.
- Add new page/layout paths to `tailwind.config.js` `content`.
- Keep Tailwind preflight disabled while legacy Bootstrap/MUI pages remain.
- Use inline styles for colors where Bootstrap utility classes may override Tailwind, especially anything resembling `bg-primary`.
- `lucide-react` is pinned to `0.475.0`; do not upgrade casually.
- Do not add `// eslint-disable-next-line react-hooks/exhaustive-deps`; that rule is not registered here and the comment can fail lint/build. Prefer `useRef` guard patterns for one-time async effects.

## Auth And LocalStorage

Route protection currently checks session flags, not just `userRole`:

- Patient session is valid when `isPatientLoggedIn === "true"` and `patientData` exists.
- Doctor session is valid when `isDoctorLoggedIn === "true"`.
- Admin session is valid when `isAdminLoggedIn === "true"`.

Common keys:

- `data` - doctor login data shape is usually `{ data: doctor }`; some legacy admin/doctor code also reads this.
- `patientData` - patient session object, usually wrapped as `{ data: patient }`.
- `adminData` - admin object from Phase 6 login.
- `userRole` - role string, still set by login pages but not sufficient for route access.
- `sendBirdUserId`, `sendBirdUserName` - chat/call identity.
- `consultationId`, `patientId`, `doctorId` - active consultation context.
- `consultPatientData` - raw patient object for doctor-side active consult context. Do not confuse this with `patientData`.
- `selectedCategory`, `CategoryDescription`, `teleHealthOptions` - patient booking flow scratch keys.
- `dadh_templates` - local template snippets used by doctor supporting-info UI.

When working in doctor consultation flows, preserve the key isolation between `patientData` and `consultPatientData`.

## Backend API Notes

Main mounts in `dadh-backend/index.js`:

- `/api/doctor/auth`
- `/api/admin/auth`
- `/api/patient/auth`
- `/api/consultationCategory`
- `/api/doctor`
- `/api/consultations`
- `/api/doctor-requests`
- `/api/billing`
- `/api/bill`
- `/api/user-sign`
- `/api/medicines`
- `/api/FamilyMembers`
- `/notification/sms`
- `/api/templates`
- `/uploads`
- `/api/upload-audio`
- `/api/recording/*`
- `/api/ai-scribe`
- `/api/transcribe-latest`

High-use endpoints:

- Doctor requests/admin doctors: `GET /doctor-requests/getAll`, `PATCH /doctor-requests/approve-doctor/:id`, `PATCH /doctor-requests/toggleActive/:id`, `DELETE /doctor-requests/deleteById/:id`, `PATCH /doctor-requests/update-doctor/:id`.
- Patients: `GET /patient/auth/getAll`, `GET /patient/auth/getOneById/:id`, `PATCH /patient/auth/update/:patientId`, `PATCH /patient/auth/upload-photo/:patientId`, `PATCH /patient/auth/toggleActive/:id`.
- Consultations: `GET /consultations/getAll`, `GET /consultations/getConsultations`, `GET /consultations/getOneById/:id`, `PATCH /consultations/assignDoctor`, `PUT /consultations/update/:consultationId`, `PATCH /consultations/certification/add`, `PATCH /consultations/prescribtion/add/:id`, `PATCH /consultations/billing/:id`, `GET /consultations/incompleteBillings/:id`.
- Billing codes: current router exposes `GET /billing/getAllBilling`, `POST /billing/add`, `POST /billing/updateOne/:id`, `DELETE /billing/deleteById/:id`. Some Phase 6 docs mention `POST /billing/create` or `PATCH /billing/updateById/:id`; verify against router before using.
- Categories: `GET /consultationCategory/getAll`, `POST /consultationCategory/add`, `PATCH /consultationCategory/updateOneById/:id`, `DELETE /consultationCategory/deleteById/:id`, `POST /consultationCategory/getOneByKey`.
- Templates: `POST /templates/savetemplate`, `GET /templates/:doctorId`.

Controller response shape is generally `{ state, message, data }`, though auth endpoints may also include `token`.

## Commands

Backend:

```bash
cd dadh-backend
yarn start
```

The backend `test` script is a placeholder that exits with an error.

Frontend:

```bash
cd dadh-frontend
yarn start
yarn build
yarn test
yarn lint
```

`yarn build` is the main verification command for frontend changes. Use targeted runtime checks as needed for pages that depend on real env/services.

## Environment

Backend `.env`:

- Required at startup: `JWT_SECRET` at least 32 chars, `URI`.
- CORS: `ALLOWED_ORIGINS` comma-separated. Browser requests without an allowed origin will be rejected.
- Auth/security: `JWT_EXPIRES_IN`, `ENCRYPTION_KEY`, `ENCRYPTION_SIGNING_KEY`.
- Twilio: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE`.
- Email: `RESEND_API_KEY`.
- AI/audio/video/storage: `DEEPGRAM_API_KEY`, `COHERE_API_KEY`, `SDKAppID`, `SECRET_KEY`, `EXPIRE_TIME`, `TENCENT_SECRET_ID`, `TENCENT_SECRET_KEY`, `TENCENT_BUCKET`, `TENCENT_REGION`, `TENCENT_APP_ID`, `TRTC_SECRET_KEY`.

Frontend `.env`:

- `REACT_APP_BACKEND_URL`, default fallback is `http://localhost:5001/api`.
- `REACT_APP_SENDBIRD_APP_ID`.
- `REACT_APP_DEFAULTAUTH` still appears in legacy Redux auth sagas.
- Firebase `REACT_APP_*` values may be needed by legacy firebase helper code.

## Graphify

This repository has a Graphify knowledge graph in `graphify-out/`.

Rules:

- Before answering architecture or codebase questions, read `graphify-out/GRAPH_REPORT.md`.
- If `graphify-out/wiki/index.md` exists, prefer the wiki over raw graph files.
- For cross-module questions, prefer graph queries such as `graphify query "<question>"`, `graphify path "<A>" "<B>"`, or `graphify explain "<concept>"` when available.
- After modifying code files, run `graphify update .` to refresh the graph. Documentation-only changes do not require a graph update.

Current graph highlights:

- Corpus: 472 files, 1738 nodes, 1703 edges.
- Core hubs include `DADH Backend (Node.js/Express)`, `DADH Frontend (React CRA)`, route/helper functions, and the DADH roadmap.
- Graph communities identify backend domains, new UI component system, Phase 4 patient pages, Phase 5 doctor pages, Phase 6 admin pages, legacy template/chart pages, and reference screenshot patterns.

## Additional Claude Docs

- `.claude/docs/architectural_patterns.md` - detailed codebase patterns with file references. Useful, but some line numbers may drift.
- `.claude/skills/dadh-commit/SKILL.md` - commit workflow. It only stages `dadh-frontend/` and `dadh-backend/`, never root docs or `.claude/`.
- `.claude/settings.json` - enabled Claude plugins and a Graphify reminder hook.
- `.claude/settings.local.json` - local permissions and GitHub plugin enablement.
- `docs/superpowers/plans/2026-04-28-phase5-doctor-portal.md` - Phase 5 plan; useful for intent, but current route names should be verified in code.
- `docs/superpowers/plans/2026-04-29-phase6-admin-portal.md` - Phase 6 plan; useful for intent, but verify endpoint names against backend routers.
- `ROADMAP.md` - broader product roadmap.

## Working Guidelines

- Prefer existing patterns over new abstractions.
- For backend changes, update the router, controller, model, and validator layers consistently.
- For frontend migrated pages, use the existing `AppLayout`, scoped Tailwind setup, and inline-color convention.
- Keep legacy pages working; do not remove Bootstrap/MUI/Reactstrap imports until the whole affected surface is migrated.
- Do not commit root docs, `.claude/`, `.superpowers/`, `graphify-out/`, or reference pictures unless explicitly requested.
- The worktree may be dirty. Do not revert unrelated changes.

## Observed Coding Pattern

The recent Claude Sonnet 4.6 work follows a pragmatic migration pattern rather than a full rewrite:

- Build new role surfaces beside legacy pages, then swap routes in `allRoutes.js`.
- Keep page-level components self-contained, with small local helper components inside the same file when the feature is tightly scoped.
- Use `DoctorAppLayout`, `AdminAppLayout`, `PatientAppLayout`, and shared `AppLayout` as the migrated shell pattern.
- Use explicit inline styles for migrated screens to avoid Bootstrap/Tailwind class conflicts.
- Use `useState`, `useEffect`, `useRef`, local `BASE_URL`, and direct `fetch` calls in migrated pages instead of introducing new data-fetching abstractions.
- Guard async effects with `isMountedRef` or local cancellation flags.
- Update localStorage after profile/session changes and dispatch small custom events such as `doctorProfileUpdated` and `patientProfileUpdated` so layouts refresh immediately.
- Preserve existing backend response envelopes and add narrow backend fields/routes only for the current UI need.
- Prefer additive backend changes: new schema fields, one controller method, one router mount, then consume it from the migrated page.
- Keep current route spelling and localStorage key behavior as source of truth, even when older plans use different names.

Current implementation style examples:

- Doctor settings adds inline profile photo resize-to-base64, signature canvas/upload, and saves through `PATCH /doctor-requests/update-doctor/:id`.
- Patient profile updates `patientData` in localStorage and emits `patientProfileUpdated`.
- Doctor billing uses a local modal, fetches `/billing/getAllBilling`, saves selected code IDs through `PATCH /consultations/billing/:id`, and respects a 12-hour `billingLockedAt` window.
- Doctor history computes completion from billing plus certificate requirement state, and opens an inline certificate modal when needed.
- Consultation booking carries `requiresMedicalCertificate` through frontend booking into the consultation model.

## Last Observed Claude Task

Last committed task:

- `b5d65d9 feat(phase6): wire all admin routes to Phase 6 redesigned pages`
- The preceding commits were the Phase 6 admin portal build: `AdminAppLayout`, admin login, dashboard, doctors, patients, consultations, settings, then route wiring.

Last uncommitted task inferred from file timestamps and diffs:

- A post-Phase 6 polish/integration pass across doctor, patient, and backend flows.
- Main focus areas:
  - Doctor profile photo and signature support.
  - Doctor approval gating (`isApproved`, default disabled status, approved doctors get `status: 1`).
  - Certificate requirement flow from patient booking to doctor history/consultation.
  - Doctor billing code editing with 12-hour lock via `billingLockedAt`.
  - Patient layout/profile refresh and preventing new bookings while an active consultation exists.
  - Expanded doctor consult detail/chat/history/billing behavior and replacement of old certificate/billing modals with new `CertifyConsultModal.jsx` and `BillingConsultModal.jsx`.

The working tree contains many uncommitted product changes in both `dadh-frontend/` and `dadh-backend/`, plus root documentation changes. Do not treat the last commit as the full current state.
