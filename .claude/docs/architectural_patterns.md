# Architectural Patterns

Patterns that appear across multiple files in the DADH codebase.

---

## Backend

### Controller Response Shape
All controller responses use a consistent envelope: `{ state: boolean, message: string, data: object }`. Errors are passed to `next(err)` rather than returned directly.

- `dadh-backend/controllers/patient-auth-controller.js:107–174` — login returns `{ state, message, token, data: patient }`
- `dadh-backend/controllers/doctor-auth-controller.js:221–271` — verifyOtp mirrors the same shape
- `dadh-backend/controllers/consultations-controller.js:382–419` — addConsultation uses the same envelope

### Error Handling
All async controllers wrap logic in `try { ... } catch(err) { next(err); }`. Synchronous validation errors are returned directly with a status code, not forwarded to `next`.

- `dadh-backend/controllers/patient-auth-controller.js:31–84` — register with try-catch-next
- `dadh-backend/controllers/consultations-controller.js:100–149` — complex controller with the same pattern

### Validator Middleware Factory
A single middleware factory in `middlewares/validator-middleware.js:1–18` accepts a Zod schema and attaches it per-route. Applied at the router level, not globally.

- `dadh-backend/router/admin-router.js:11–12` — `router.post("/register", validator(signupSchema), ...)`
- `dadh-backend/router/doctor-auth-router.js:9–13` — all auth routes use this pattern

### Zod Schema Convention
Schemas live in `validator/`. Fields chain `.trim().min().max()` and use `required_error` for message customization. Enum and regex validations are also common.

- `dadh-backend/validator/doctor-signup-validator.js:1–71`
- `dadh-backend/validator/patient-signup-validator.js:1–65` — includes `z.regex(/^\d+$/)` for numeric fields

### Mongoose Schema Conventions
- All user models include `otp` + `otpExpiry` fields for the OTP auth flow.
- `status` is stored as a numeric enum (0 = inactive, 1 = active).
- **References between documents use plain strings, not `ObjectId` refs** — no Mongoose `.populate()` is used.
- Array fields default to `[]` (e.g., `{ type: Array, default: [] }`).
- `{ timestamps: true }` is present on some models but not all (inconsistency).

References:
- `dadh-backend/models/patient-model.js:3–103`
- `dadh-backend/models/doctor-model.js:3–43`
- `dadh-backend/models/consultations-model.js:38–72`

### JWT Generation
Centralized in `dadh-backend/utils/generate-token.js:3–12`. Called after OTP verification, never after password login alone. Token is included in the response body alongside `data: user`.

- `dadh-backend/controllers/patient-auth-controller.js:206` — `const token = await generateToken(patient, next)`
- `dadh-backend/controllers/doctor-auth-controller.js:250` — identical call site

### Router Mounting Convention
All routers mount under `/api/` in `dadh-backend/index.js:49–77`. Role-specific routers share the same prefix pattern: `/api/{role}/auth` and `/api/{role}`.

### File Upload Pattern
Multer uses disk storage with `Date.now() + originalname` filename strategy. Uploads stored in `dadh-backend/uploads/`. Served as static files at `/uploads`.

- `dadh-backend/router/uploadRouter.js:9–21`
- `dadh-backend/index.js:67–70`

---

## Frontend

### Axios Instance & HTTP Helpers
A single Axios instance with the base URL from `REACT_APP_BACKEND_URL` is created in `dadh-frontend/src/helpers/api_helper.js:10–12`. Helper functions (`get`, `post`, `put`, `del`) extract `.data` from the response before returning.

- `dadh-frontend/src/helpers/api_helper.js:10–41`
- Global `Authorization` header is set on the instance (line 14), not per-call.

### Redux + Saga Store Structure
Store uses `redux-saga` middleware. Reducers are domain-grouped via `combineReducers` (Layout, Login, Account, ForgetPassword, Profile, calendar).

- `dadh-frontend/src/store/index.js:1–14`
- `dadh-frontend/src/store/reducers.js:1–25`

Auth session state lives in `AuthContext` (`dadh-frontend/src/context/AuthContext.js` / `dadh-frontend/src/store/auth.js:149–217`), not Redux. Redux handles UI state (layout, calendar); context handles user identity.

### Protected Routes (`allowedRoles` Pattern)
Route objects in `allRoutes.js` carry an `allowedRoles: string[]` property. `Authmiddleware` checks localStorage role against this array and redirects to `/unauthorized` on mismatch.

- `dadh-frontend/src/routes/allRoutes.js:169–248` — route definitions with `allowedRoles`
- `dadh-frontend/src/routes/middleware/Authmiddleware.js:5–26` — guard implementation

### Three-Role Auth Flow (Frontend)
1. Three separate login pages → role-specific backend endpoints.
2. On success: JWT + user object + role string stored in `localStorage`.
3. `Authmiddleware` reads role from localStorage on every protected route render.
4. `AuthContext` provides user data to components via `useAuth()`.

### Form Pattern
Forms use a plain `useState` object (not Formik in many pages). A single `handleInput` function spreads the field update and clears errors. Validation runs on submit, not on change.

- `dadh-frontend/src/pages/AdminLogin/AdminLoginForm.js:22–98`
- `dadh-frontend/src/pages/DoctorLogin/DoctorLogin.js:27–55`

Pattern: `const [formData, setFormData] = useState({ field: "" })` → separate `errors` state → validate on submit → call API → store result in localStorage.

### i18n Setup
Language resources loaded from JSON files in `dadh-frontend/src/locales/`. Language preference read from localStorage on init. Flat key structure (no dot notation).

- `dadh-frontend/src/i18n.js:1–48`

---

## New UI Component System (Phase 3+)

### Component Library Location
All new UI components live in `dadh-frontend/src/components/ui/`. Do NOT add new components to `src/components/Common/` (legacy). Available components:

| File | Exports |
|---|---|
| `Button.jsx` | `Button`, `buttonVariants` — cva variants: default, destructive, outline, secondary, ghost, link |
| `Input.jsx` | `Input` |
| `Label.jsx` | `Label` |
| `Card.jsx` | `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter` |
| `FormField.jsx` | `FormField` — wraps Label + Input slot + error/helper text |
| `Badge.jsx` | `Badge`, `badgeVariants` — variants: default, secondary, destructive, success, outline, muted |
| `Avatar.jsx` | `Avatar`, `AvatarImage`, `AvatarFallback` |
| `Table.jsx` | `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`, `TableCaption` |
| `Modal.jsx` | `Modal`, `ModalHeader`, `ModalTitle`, `ModalDescription`, `ModalBody`, `ModalFooter`, `ModalClose` |
| `Toast.jsx` | `ToastProvider`, `useToast`, `Toaster` |
| `AppLayout.jsx` | `AppLayout` — sidebar + topbar shell, accepts `navItems`, `user`, `onLogout` props |

### cn() Utility
`dadh-frontend/src/lib/utils.js` exports `cn(...inputs)` — a `twMerge(clsx(...))` wrapper for conditional class composition. Use for all conditional Tailwind classes.

### Page Wrapper Requirement
Every new page **must** be wrapped in `<div className="dadh-tw-root">` as the outermost element. This opts into the scoped CSS reset (box-sizing, Inter font, foreground color, antialiasing). Without it, the page inherits whatever Bootstrap/MUI styles are active.

### Import Convention
Use relative paths — no `@/` aliases:
```js
import Button from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { cn } from "../../lib/utils";
```

### Adding a New Migrated Page
1. Create the page folder under `src/pages/`.
2. Add the path to `tailwind.config.js` → `content` array: `"./src/pages/YourPage/**/*.{js,jsx}"`.
3. Wrap the page JSX in `<div className="dadh-tw-root">`.
4. Import components from `../../components/ui/` using relative paths.

### Tailwind Config Color Rule
Colors in `tailwind.config.js` are **hardcoded hex values** — NOT `hsl(var(--dadh-*))`. Tailwind's JIT cannot resolve CSS variable references at compile time, causing utilities like `bg-primary` to produce incorrect output. If you change the palette, update both `tailwind.config.js` (hex values) AND `tailwind.css` (CSS variables).

### Migrated Pages
- `src/pages/DoctorLogin/DoctorLogin.js` — Phase 3 proof-of-concept. Two-column layout with animated panel + header. All Firebase/localStorage logic preserved.
