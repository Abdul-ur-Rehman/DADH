# Phase 5 — Doctor Portal Redesign

**Date:** 2026-04-28
**Branch:** dadh/phase1
**Status:** Approved for implementation

---

## 1. Scope

Redesign all doctor-facing pages to match the Phase 3/4 Tailwind design system (teal palette, `dadh-tw-root` scope, shadcn-style components). Add missing features: Settings page, soft status-complete validation, note-template UI, date-range filters on History, and chat attachments.

Pages in implementation order:
1. Doctor Dashboard (`/doctor`)
2. Consultation Details (`/doctor/consult/:id`)
3. Consult History (`/doctor/history`)
4. Billing page
5. Settings / My Account (`/doctor/settings`)
6. Doctor Inbox (`/doctor/inbox`)

Doctor OTP/login page is already done (Phase 3). Doctor Signup redesign is deferred to Phase 6.

---

## 2. Design System

Same tokens as Phase 4 patient pages. No new colors or fonts.

| Token | Value | Use |
|---|---|---|
| `primary` | `#0D7377` | Sidebar bg, buttons, active nav, focus rings |
| `accent` | `#14B8A6` | Hover states |
| `background` | `#FAFFFE` | Page background |
| `foreground` | `#111E1F` | Body text |
| `destructive` | `#EF4444` | Errors, end-consultation |
| `success` | `#22C55E` | Confirmed states |
| `border` | `#D1E8E8` | Card borders, dividers |

All new pages:
- Wrapped in `<div className="dadh-tw-root">`
- Use relative imports (no `@/` alias)
- Page folder path added to `tailwind.config.js → content`
- Colors via inline styles where Bootstrap conflicts (same fix as Phase 4)

---

## 3. Dashboard (`/doctor`)

### Layout
Three-column layout inside a full-height shell:
- **Left:** Fixed-width teal sidebar (`#0D7377`, 220px expanded)
- **Center:** Patient queue (flex-1)
- **Right:** Tabbed chat panel (280px fixed)

### Sidebar
- DADH logo + name at top
- Nav items: Dashboard, Inbox, History, Billing, Settings
- "Consult History" item shows an amber badge with count of pending certificate requests (existing logic from `SidebarContent.js` — port to new design)
- Doctor avatar + name + "Online" dot at bottom
- Sidebar is expanded by default; no collapse in Phase 5

### Patient Queue (center)
- Header: `"Good morning, Dr. [Name]"` with today's date on the right
- If active consultation exists: amber banner "You have an active consultation" + "Return to Consult" button
- Section title: "Patients Waiting (N)"
- Each patient row card:
  - Avatar (initials or photo) + patient name + consult type (Video/Audio/Chat) + wait time
  - First/top patient: teal border highlight (`border-primary`)
  - "Accept" button — teal for top patient, muted for others
- Empty state: "No patients waiting" with a small icon
- Polling: full data refresh every 5 seconds (existing logic)

### Chat Panel (right)
- Two tabs: **Clinical** (active consult chat) and **Dispatch** (admin/dispatch messages)
- Amber unread dot on the tab with new messages
- Active tab content: shows patient name + "Active consultation" sub-label, message bubbles, input bar with Send button
- No collapse toggle in Phase 5

---

## 4. Consultation Details (`/doctor/consult/:id`)

### Layout
Three-column layout (roughly 3:4:3 ratio):

**Column 1 — Patient Info**
- Avatar, name, age, gender
- Chief complaint
- Vitals (if available)
- Consultation type + start time

**Column 2 — Notes / Scribe**
- Tabs: Live Transcript | Clinical Notes | Templates
- **Live Transcript tab:** scrolling real-time transcript (existing Deepgram integration)
- **Clinical Notes tab:** rich textarea; auto-save indicator
- **Templates tab:** two sub-sections
  - *Snippets* — short text chips (e.g., "Patient denies chest pain") that insert into notes on click
  - *Structured Forms* — SOAP, Follow-up, Referral form templates; filling them populates the notes field

**Column 3 — Actions**
- Stop Consultation button (red, top)
- Post-stop state: green "Consultation stopped" banner + three action buttons: Certify | Bill | Go to Dashboard
- Certificate form (inline, shows when Certify clicked)
- Billing code picker (inline, shows when Bill clicked — replaces current modal)
- Video/audio controls (mute, camera, end call)

### Status-Complete Validation (soft)
- No hard blocking on stop.
- After stop, if certificate has not been issued and no billing code saved, show a dismissible amber warning: "This consultation has incomplete items. They will be flagged in History."
- In Consult History, consultations with missing cert or billing show an amber "⚠ Incomplete" badge.

---

## 5. Consult History (`/doctor/history`)

- Full-width table (replaces current card layout if applicable)
- Columns: Patient | Date | Type | Duration | Status | Certificate | Billing | Actions
- **Date-range filter:** date picker with From / To inputs; defaults to last 30 days
- **Search:** filter by patient name
- **Status filter:** dropdown — All / Completed / Incomplete
- Each row: "⚠ Incomplete" amber badge if cert or billing missing (soft validation)
- "📋 Certificate Requested" amber badge if patient requested cert (existing logic, ported to new design)
- Actions column: View | Issue Certificate | Add Billing

---

## 6. Billing Page

- Summary cards at top: total consultations billed this month, total revenue, pending items
- Table: same structure as History but filtered to billing-relevant columns
- "Add billing code" action per row for unbilled consultations
- No new backend endpoints needed; uses existing billing routes

---

## 7. Settings / My Account (`/doctor/settings`)

New page — does not currently exist.

Sections:
- **Profile:** name, email, phone, specialty, profile photo upload (same pattern as patient photo upload)
- **Availability:** toggle online/offline status; set working hours
- **Notifications:** toggles for new patient alerts, certificate requests
- **Security:** change password form (current password + new + confirm)

Backend: reuse existing `PATCH /doctor/auth/update/:id` or equivalent. If endpoint doesn't cover all fields, add what's needed in Phase 5 scope.

---

## 8. Doctor Inbox (`/doctor/inbox`)

Port the existing doctor inbox to the new Tailwind design system.

Features:
- Conversation list (left panel) + active chat (right panel) — same split-panel pattern as PatientInbox
- Sendbird v4 SDK (no UIKit), `GroupChannelHandler` for real-time events
- File attachments: image and document upload via Sendbird file message API
- Auto-resize textarea input (same fix applied in PatientInbox — `overflowY: "hidden"`, container-level focus ring)
- Consultation-based conversation list (filter by consultation ID)

---

## 9. Routing & Navigation

New routes to add in `allRoutes.js`:
- `/doctor/settings` → `DoctorSettings` (new)
- Existing routes stay the same; pages are replaced in-place

Doctor layout shell: create `DoctorAppLayout.jsx` (mirrors `PatientAppLayout.jsx`) wrapping `AppLayout` with doctor nav items and a "Go Online" toggle in the header.

---

## 10. What Is NOT in Phase 5

- Doctor Signup/Register page redesign → Phase 6
- Doctor OTP page → already done (Phase 3)
- Admin portal pages → Phase 6+
- Any new backend features beyond what's needed to support the Settings page fields
- Chat panel collapse/expand toggle → deferred

---

## 11. File Checklist

### New files
- `src/pages/DoctorDashboard/DoctorDashboard.jsx` (replaces DoctorHome)
- `src/pages/DoctorDashboard/components/PatientQueueCard.jsx`
- `src/pages/DoctorDashboard/components/ChatPanel.jsx`
- `src/pages/DoctorConsultDetails/DoctorConsultDetailsNew.jsx` (replaces existing)
- `src/pages/DoctorConsultDetails/components/PatientInfoColumn.jsx`
- `src/pages/DoctorConsultDetails/components/NotesColumn.jsx`
- `src/pages/DoctorConsultDetails/components/ActionsColumn.jsx`
- `src/pages/DoctorConsultDetails/components/TemplatePanel.jsx`
- `src/pages/DoctorHistory/DoctorHistoryNew.jsx`
- `src/pages/DoctorBilling/DoctorBillingNew.jsx`
- `src/pages/DoctorSettings/DoctorSettings.jsx` (new)
- `src/pages/DoctorInbox/DoctorInboxNew.jsx`
- `src/components/DoctorLayout/DoctorAppLayout.jsx`

### Modified files
- `src/routes/allRoutes.js` — add `/doctor/settings`, swap page components
- `tailwind.config.js` — add new page paths to `content` array
