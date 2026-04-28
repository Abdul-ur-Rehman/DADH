# Phase 5 — Doctor Portal Redesign

**Date:** 2026-04-28
**Branch:** dadh/phase1
**Status:** Approved for implementation
**Reference:** `reference pictures/davinci.doctordoctor.com.au_*`

---

## 1. Scope

Redesign all doctor-facing pages to match the Phase 3/4 Tailwind design system (teal palette, `dadh-tw-root` scope, shadcn-style components). Add missing features: Settings page, soft status-complete validation, note-template UI, date-range filters on History, and chat attachments.

Pages in implementation order:
1. Doctor Dashboard (`/doctor`)
2. Consultation Details (`/doctor/consult/:id`)
3. Consult History (`/doctor/history`)
4. Billing page (`/doctor/billing`)
5. Settings / My Account (`/doctor/settings`)
6. Doctor Inbox (`/doctor/inbox`)

Doctor OTP/login page is already done (Phase 3). Doctor Signup redesign is deferred to Phase 6.

---

## 2. Design System

Same tokens as Phase 4 patient pages.

| Token | Value | Use |
|---|---|---|
| `primary` | `#0D7377` | Sidebar bg, buttons, active nav, focus rings |
| `accent` | `#14B8A6` | Hover states |
| `background` | `#FAFFFE` | Page background |
| `foreground` | `#111E1F` | Body text |
| `destructive` | `#EF4444` | Errors, end-consultation |
| `success` | `#22C55E` | Confirmed states |
| `border` | `#D1E8E8` | Card borders, dividers |
| `amber` | `#F59E0B` | Badges, warnings, unread dots |

All new pages:
- Wrapped in `<div className="dadh-tw-root">`
- Relative imports only (no `@/` alias)
- Page folder path added to `tailwind.config.js → content`
- Colors via inline styles where Bootstrap conflicts (same fix as Phase 4)

---

## 3. Dashboard (`/doctor`)

### Overall shell structure

```
┌─────────────────────────────────────────────────────┐
│  TOP STATS BAR (full width, above everything)        │
├──────────┬──────────────────────────┬───────────────┤
│ SIDEBAR  │  PATIENT QUEUE (center)  │  CHAT PANEL   │
│ (220px)  │  (flex-1)                │  (280px)      │
└──────────┴──────────────────────────┴───────────────┘
```

### Top Stats Bar
Full-width bar pinned above the three-column layout. Three sections:
- **Left:** Billings — `$X earned / $Y pending` (green text for earned, muted for pending)
- **Center:** Patients — `X today / Y total` (teal text)
- **Right:** Queue — `N` (amber/red text if >0) + "Search patient" input

### Sidebar (left, 220px, `#0D7377` background)
- DADH logo + name at top
- Nav items: Home, Inbox, Consult History, Billing, Settings, Logout
- Active item: white text + `rgba(255,255,255,0.2)` background pill
- "Consult History" item shows amber badge with count of pending certificate requests (existing polling logic from `SidebarContent.js`)
- **Online users list** at the bottom (below a divider): list of other online doctors with green/grey presence dot and their current queue count in parentheses
- Doctor avatar + name + "● Online" dot above online users list

### Patient Queue (center)
- Section heading: **"Patients Waiting"**
- Two tabs: **TELEHEALTH** | **HOME VISITS** (underline style, teal active)
- **"+ Add Consult"** button top-right of the tab bar (opens new consultation modal — search existing patient or enter mobile to create new)
- If active consultation exists: amber banner "You have an active consultation" + "Return to Consult" button (existing logic)

**Each patient row card:**
- **Communication mode icon** (left): microphone SVG = audio, chat bubble SVG = text chat, video camera SVG = video
- **Priority/Express/Specialist Available badges**: colored pill chips (amber = Priority, teal-outline = Express, purple-outline = Specialist Available) — shown when flagged
- **Patient name, age, gender** (bold, e.g. "Sammantha Arja, 35, Female")
- **Disease category + description** on second line (e.g. "Mental Health / Sleep / Headache: Patient feels dizzy and…") — truncated with ellipsis at ~100 chars
- **Wait time** (right-aligned, e.g. "3 hrs", "an hr")
- **Chevron arrow** (›) at far right — clicking the row navigates to consultation details
- Top/first patient in queue: teal left-border highlight + slightly elevated background (`#F0FDFA`)
- "Accept" button is NOT shown on the queue row — doctor enters consult by clicking the row/chevron

- Empty state: icon + "No patients waiting" centered message

- Polling: full data refresh every 5 seconds (existing `fetchData` logic)

### Chat Panel (right, 280px)
- Two tabs: **CLINICAL** | **DISPATCHER**
- Amber unread dot on tab with new messages
- **CLINICAL tab**: shows the active patient's name + "Active consultation" sub-label; chat bubbles (doctor teal right-aligned, patient white left-aligned); input bar with Send button
- **DISPATCHER tab**: shows admin/dispatch group messages; same bubble layout
- No collapse toggle in Phase 5

---

## 4. Consultation Details (`/doctor/consult/:id`)

### Navigation
- **"← Back to all patients"** link at very top (navigates to `/doctor`)

### Layout: three sections stacked

```
┌──────────────────────────────────────────────────────┐
│ PATIENT HEADER CARD (full width)                      │
├─────────────────────────────┬────────────────────────┤
│ SUPPORTING INFO (left ~45%) │ PATIENT NOTES (~55%)   │
├─────────────────────────────┴────────────────────────┤
│ CHAT HISTORY panel (right column, full height)        │
└──────────────────────────────────────────────────────┘
```

Actually a two-column layout at the content level:
- **Left ~65%:** Patient header card + Supporting Info + Patient Notes (stacked vertically)
- **Right ~35%:** Chat history (full height, sticky)

### Patient Header Card
- Patient name (linked/underlined), age, gender, phone number
- **"+ Add family"** button top-right
- **Action icon row** — 5 circular icon buttons with label below:
  - 💊 **Prescribe** → opens Prescribe modal
  - 📋 **Refer** → opens Refer modal
  - 🔬 **Investigate** → opens Investigate modal
  - 📄 **Certify** → opens Certificate form modal
  - 💰 **Bill** → opens Billing code modal
- Below action icons: two fields side by side — **Address** (read-only) | **Allergies** (read-only, e.g. "NKDA")

### Supporting Information Panel
Expandable accordion sections:
- **Templates** → (click to expand: text snippet library)
- **Results** → (click to expand: uploaded results/attachments)
- **Conditions** — lists existing conditions with "+ Add New" button
- **Medications** — lists existing medications with date + "+ Add New" button

### Patient Notes Panel
- Section heading: **"Patient notes"** + **"AI Scribe"** button (top-right, teal text link)
- Large textarea for free-text clinical notes
- AI Scribe: clicking starts/stops Deepgram transcription and populates notes (existing integration)

### Stop Consultation (top of left column, above patient header)
- **Stop** button (red, prominent) visible while consultation is active
- After stop: green banner "Consultation stopped. Please certify and/or bill before leaving."
- Post-stop: the 5 action icon buttons (Prescribe/Refer/Investigate/Certify/Bill) remain active
- **"Go to Dashboard"** button as secondary action after stop
- Soft validation: if Certify and Bill both untouched after stop, show amber dismissible warning: "This consultation has incomplete items. They will be flagged in History."

### Chat History Panel (right column)
- Heading: **"Chat history"**
- "Your consult has started" separator at top
- **Patient intake data cards** (shown at top of chat): Date of birth, Symptom or Condition, Additional information, Allergies, Consultation type requested — displayed as structured info cards, not chat bubbles
- Live chat messages below (doctor name + bubble, patient name + bubble)
- Prescriptions issued appear as chat bubble cards with medication name/dose
- "Dr [Name] has ended the consult" footer message after stop

### Action Modals

**Prescribe modal:**
- Search: Product Name / Active Ingredient toggle + search input (MIMS integrated)
- Fields: Dose, Quantity, Frequency (dropdown), Duration (dropdown), Instructions (optional textarea)
- "Include brand name on script" checkbox
- Primary button: **Prescribe**

**Refer modal:**
- Search: "Specialist name or category" input with magnifier
- "Referral message" textarea + **"AI Generate"** button (auto-generates referral letter)
- Primary button: **Refer**

**Investigate modal:**
- "Investigation type" dropdown (Radiology, Pathology, etc.)
- Two textareas: Investigations | Note
- Primary button: **Order**

**Certify modal:** (existing certificate form, restyled)

**Bill modal:** (existing billing code picker, restyled — no longer ends consultation, only saves codes)

### Status-Complete Validation (soft)
- No hard blocking.
- After stop, if cert not issued AND no billing code: amber dismissible warning (see above).
- In Consult History, rows with missing cert or billing show amber "⚠ Incomplete" badge.

---

## 5. Consult History (`/doctor/history`)

- Full-width table
- Columns: Patient | Date | Type | Duration | Status | Certificate | Billing | Actions
- **Date-range filter:** From / To date pickers; default = last 30 days
- **Search:** filter by patient name (text input)
- **Status filter:** dropdown — All / Completed / Incomplete
- Amber "⚠ Incomplete" badge on rows missing cert or billing
- Amber "📋 Certificate Requested" badge on rows where patient requested cert but none issued
- Actions: View | Issue Certificate | Add Billing

---

## 6. Billing Page (`/doctor/billing`)

- Summary stat cards: billed this month, total revenue, pending items
- Table: patient, date, consult type, billing codes, amount, status
- "Add billing code" per unbilled row
- No new backend endpoints; uses existing billing routes

---

## 7. Settings / My Account (`/doctor/settings`)

New page — does not currently exist.

Sections:
- **Profile:** name, email, phone, specialty, profile photo upload
- **Availability:** online/offline toggle; working hours
- **Notifications:** toggles for new patient alerts, certificate requests
- **Security:** change password (current + new + confirm)

Backend: reuse or extend `PATCH /doctor/auth/update/:id`.

---

## 8. Doctor Inbox (`/doctor/inbox`)

Port existing inbox to new Tailwind design.

- Split panel: conversation list (left) + active chat (right)
- Sendbird v4 SDK (no UIKit), `GroupChannelHandler` for real-time
- File attachments: image + document upload via Sendbird file message API
- Auto-resize textarea (`overflowY: "hidden"`, container focus ring — same pattern as PatientInbox)
- Consultation-based conversation filtering

---

## 9. Routing & Navigation

New/changed routes in `allRoutes.js`:
- `/doctor/settings` → `DoctorSettings` (new page)
- Dashboard, History, Billing, Inbox routes swap to new page components in-place

Doctor layout shell: `DoctorAppLayout.jsx` (mirrors `PatientAppLayout.jsx`) — wraps `AppLayout` with doctor nav items.

---

## 10. What Is NOT in Phase 5

- Doctor Signup/Register page → Phase 6
- Admin portal pages → Phase 6+
- Chat panel collapse toggle → deferred
- Doctor Signup hybrid flow → deferred
- New backend features beyond Settings page fields

---

## 11. File Checklist

### New files
- `src/pages/DoctorDashboard/DoctorDashboard.jsx`
- `src/pages/DoctorDashboard/components/PatientQueueRow.jsx`
- `src/pages/DoctorDashboard/components/ChatPanel.jsx`
- `src/pages/DoctorDashboard/components/TopStatsBar.jsx`
- `src/pages/DoctorDashboard/components/OnlineUsersList.jsx`
- `src/pages/DoctorConsultDetails/DoctorConsultDetailsNew.jsx`
- `src/pages/DoctorConsultDetails/components/PatientHeaderCard.jsx`
- `src/pages/DoctorConsultDetails/components/ActionIconRow.jsx`
- `src/pages/DoctorConsultDetails/components/SupportingInfoPanel.jsx`
- `src/pages/DoctorConsultDetails/components/PatientNotesPanel.jsx`
- `src/pages/DoctorConsultDetails/components/ChatHistoryPanel.jsx`
- `src/pages/DoctorConsultDetails/modals/PrescribeModal.jsx`
- `src/pages/DoctorConsultDetails/modals/ReferModal.jsx`
- `src/pages/DoctorConsultDetails/modals/InvestigateModal.jsx`
- `src/pages/DoctorHistory/DoctorHistoryNew.jsx`
- `src/pages/DoctorBilling/DoctorBillingNew.jsx`
- `src/pages/DoctorSettings/DoctorSettings.jsx`
- `src/pages/DoctorInbox/DoctorInboxNew.jsx`
- `src/components/DoctorLayout/DoctorAppLayout.jsx`

### Modified files
- `src/routes/allRoutes.js` — add `/doctor/settings`, swap page components
- `tailwind.config.js` — add new page paths to `content` array
