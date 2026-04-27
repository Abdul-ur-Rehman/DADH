# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DADH is a telemedicine platform that connects doctors, patients, and administrators. It supports video consultations, AI-assisted medical scribing, real-time chat, billing, and multi-language UI. The repo contains two independent apps: a React frontend (`dadh-frontend/`) and a Node.js/Express backend (`dadh-backend/`).

## Tech Stack

**Backend:** Node.js, Express 4, MongoDB/Mongoose 8, Socket.io, JWT auth with OTP via Twilio SMS, Zod validation
**External services:** Deepgram (speech-to-text), Cohere AI (medical scribe), Tencent TRTC (video), Tencent COS (recording storage), Resend (email), Firebase Admin

**Frontend:** React 18, React Router v7, Redux + Redux-Saga, Context API (auth state)
**UI (legacy pages):** MUI + Bootstrap 5/Reactstrap — keep until Phase 6 migration completes
**UI (new pages — Phase 3+):** Tailwind v3 + custom shadcn-style component library in `src/components/ui/`
**Real-time:** Sendbird UIKit v3 (chat), Tencent TRTC (video calls)
**i18n:** i18next, 5 locales (English, Greek, Italian, Russian, Spanish)
**Forms:** Formik + Yup in some pages; plain `useState` + validate-on-submit in others

## Key Directories

### Backend (`dadh-backend/`)

| Directory | Purpose |
|-----------|---------|
| `controllers/` | Business logic; one file per domain |
| `router/` | Express route definitions; 20+ routers mounted in `index.js:49–77` |
| `models/` | 15 Mongoose schemas (Patient, Doctor, Admin, Consultations, Billing family, etc.) |
| `middlewares/` | Validator factory (`validator-middleware.js`) + global error handler (`error-middleware.js`) |
| `validator/` | Zod schemas for auth endpoints, applied per-route |
| `utils/` | JWT generation (`generate-token.js`), bcrypt helpers, SMS utilities |
| `services/` | Deepgram and Tencent SDK wrappers |
| `uploads/` | Multer disk storage target; served statically at `/uploads` (`index.js:67`). Patient profile photos stored here via `PATCH /patient/auth/upload-photo/:patientId`. |

### Frontend (`dadh-frontend/src/`)

| Directory | Purpose |
|-----------|---------|
| `pages/` | 50+ page components, organized by role (`AdminLogin/`, `DoctorLogin/`, etc.) |
| `components/` | Shared UI + three role layout shells (`AdminLayout/`, `DoctorLayout/`, `PatientLayout/`) |
| `components/ui/` | **New (Phase 3)** — shadcn-style Tailwind components: Button, Input, Label, Card, FormField, Badge, Avatar, Table, Modal, Toast, AppLayout |
| `lib/utils.js` | **New (Phase 3)** — `cn()` helper: `twMerge(clsx(...inputs))` |
| `styles/tailwind.css` | **New (Phase 3)** — `@tailwind components/utilities` + `:root` CSS variables + `.dadh-tw-root` scoped reset |
| `styles/theme.md` | **New (Phase 3)** — design token reference (colors, typography, spacing, radius, shadows) |
| `routes/` | Centralized route definitions (`allRoutes.js`) + `Authmiddleware` guard |
| `store/` | Redux slices + sagas (layout, calendar, auth actions) |
| `context/` | `AuthContext` — session user identity, separate from Redux |
| `helpers/` | Single Axios instance + `get/post/put/del` helpers (`api_helper.js`) |
| `locales/` | Translation JSON files per language |

### Tailwind / Design System (Phase 3+)

**Color palette — "Modern Healthcare" teal:**
| Token | Hex | Use |
|---|---|---|
| `primary` | `#0D7377` | Dark teal — buttons, active nav, links, focus rings |
| `accent` | `#14B8A6` | Bright teal — hover states, ghost buttons |
| `destructive` | `#EF4444` | Red — errors, urgent CTAs |
| `success` | `#22C55E` | Green — confirmations, health states |
| `background` | `#FAFFFE` | Off-white with teal breath |
| `foreground` | `#111E1F` | Near-black body text |

**Critical rules for new pages:**
1. Wrap every new page in `<div className="dadh-tw-root">` to opt into the scoped font/reset.
2. Use **relative imports** for UI components — no `@/` path aliases (CRA doesn't support them without CRACO).
3. After creating a new page folder, **add its path to `tailwind.config.js` → `content` array** so Tailwind scans it.
4. Do NOT use `@layer base` in CSS — Tailwind base (`@tailwind base`) is disabled to preserve Bootstrap/MUI pages.
5. Define Tailwind colors as **hardcoded hex values** in `tailwind.config.js`, not as `hsl(var(...))` — CSS variable references are not resolved correctly by Tailwind's JIT generator.
6. `lucide-react` is pinned to `^0.475.0` — do not upgrade to 1.x (ESM `.mjs` files break CRA's source-map-loader).
7. `postcss-loader` must be installed as a project dependency (not just bundled inside react-scripts) when using a custom `postcss.config.js`.

**Migrated pages (using new design system):**
- `src/pages/DoctorLogin/DoctorLogin.js` ✅ — Phase 3 proof-of-concept
- `src/pages/PatientLogin/PatientLogin.js` ✅ — Phase 4
- `src/pages/PatientHome/PatientHome.js` ✅ — Phase 4; sub-components: `ActiveConsultCard`, `RecentHistoryTable`, `CertificateModal`, `IncomingCallBanner`
- `src/pages/PatientHistoryPage/PatientHistoryFull.jsx` ✅ — Phase 4; reuses PatientHome sub-components
- `src/pages/PatientInboxPage/PatientInbox.js` ✅ — Phase 4; custom Sendbird UI (no UIKit visual components), consultation-based conversation list
- `src/pages/PatientProfileAccount/PatientProfile.js` ✅ — Phase 4; photo upload via `PATCH /patient/auth/upload-photo/:patientId`

**Patient layout shell (Phase 4):**
- `src/components/PatientLayout/PatientAppLayout.jsx` — wraps `AppLayout` with patient nav items (Home, Inbox, History, Profile) and a "Book Consultation" button in the header. Nav routes: `/patient`, `/patient/inbox`, `/patient/history`, `/patient/profile`.

**Bootstrap / Tailwind color conflict:**
Bootstrap's `.bg-primary { background-color: #0d6efd !important }` overrides Tailwind color utilities. Fix: use **inline styles** for all colors in `AppLayout.jsx` and new pages — never rely on Tailwind color class names where Bootstrap is still loaded.

**ESLint note:**
The `eslint-plugin-react-hooks` rule `react-hooks/exhaustive-deps` is **not registered** in this project's ESLint config. Never add `// eslint-disable-next-line react-hooks/exhaustive-deps` — it causes build failures. Use a `useRef` flag instead to avoid adding state to `useEffect` deps when one-time logic is needed.

## Commands

### Backend (`dadh-backend/`)
```
yarn start    # Starts Express server on port 5001
```

### Frontend (`dadh-frontend/`)
```
yarn start    # Dev server on port 3000; proxies /api → localhost:5001 (setupProxy.js)
yarn build    # Production build
yarn test     # Run tests
yarn lint     # ESLint
```

## Environment

Both apps require `.env` files (not committed to git).

**Backend key vars:** `PORT`, `URI` (MongoDB connection string), `JWT_SECRET`, `JWT_EXPIRES_IN`, `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `RESEND_API_KEY`, `DEEPGRAM_API_KEY`, `COHERE_API_KEY`, `SDKAppID` + `SECRET_KEY` (Tencent TRTC), `TENCENT_SECRET_ID`, `TENCENT_SECRET_KEY`, `TENCENT_BUCKET`, `TENCENT_REGION`, `TRTC_SECRET_KEY`

**Frontend key vars:** `REACT_APP_BACKEND_URL` (defaults to `http://localhost:5001/api`), `REACT_APP_DEFAULTAUTH`, Firebase config as `REACT_APP_*`

## Additional Documentation

Check these files when relevant:

- `.claude/docs/architectural_patterns.md` — backend and frontend patterns with file:line references: controller response envelope, error handling convention, Zod validator placement, Mongoose schema conventions (string refs instead of ObjectId, OTP fields, status enums), JWT flow, Axios helper pattern, Redux/Context split, `allowedRoles` route guard, three-role auth flow, form state pattern, new UI component system
- `src/styles/theme.md` — full design token reference for Phase 3+ pages (colors, typography, spacing, shadows, breakpoints, usage examples)
