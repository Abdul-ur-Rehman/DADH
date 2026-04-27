# DADH Design Tokens

Reference for the Tailwind v3 + shadcn-style HSL theme used by Phase 4-6 page redesigns. Source of truth: `src/styles/tailwind.css` and `tailwind.config.js`.

> All tokens are exposed as Tailwind utility classes (`bg-primary`, `text-foreground`, etc.) backed by CSS variables prefixed `--dadh-` so they don't collide with Bootstrap, Reactstrap, MUI, or mdbreact.

---

## 1. Brand colors

| Token | HSL (`--dadh-*`) | Hex | Use case |
|---|---|---|---|
| `primary` | `222 84% 40%` | `#1E40AF` | Deep brand blue (DIAL A HOME DOCTOR text). Default CTA buttons, active nav, links. |
| `primary-foreground` | `0 0% 100%` | `#FFFFFF` | Text/icon on `bg-primary`. |
| `destructive` | `0 72% 51%` | `#DC2626` | Coral red from logo phone receiver. Use for **errors** and the **after-hours-urgency CTA** (e.g. "Call a doctor now"). Do NOT use it for generic delete buttons unless the action is genuinely destructive. |
| `destructive-foreground` | `0 0% 100%` | `#FFFFFF` | Text on `bg-destructive`. |
| `success` | `158 64% 39%` | `#10B981` | Health/positive confirmations (booking confirmed, prescription sent). Not a primary CTA color. |
| `success-foreground` | `0 0% 100%` | `#FFFFFF` | Text on `bg-success`. |
| `secondary` | `210 20% 96%` | `#F1F5F9` | Subtle neutral fill. Secondary buttons, chip backgrounds. |
| `secondary-foreground` | `222 47% 11%` | `#0F172A` | Text on `bg-secondary`. |
| `muted` | `210 20% 96%` | `#F1F5F9` | Same as secondary; backdrop for sidebars, hover rows, disabled fills. |
| `muted-foreground` | `215 14% 45%` | `#64748B` | Helper text, captions, placeholder copy. |
| `accent` | `210 20% 96%` | `#F1F5F9` | Hover/active state for menu items, ghost buttons. |
| `accent-foreground` | `222 47% 11%` | `#0F172A` | Text on `bg-accent`. |
| `background` | `0 0% 100%` | `#FFFFFF` | Page background. |
| `foreground` | `222 47% 11%` | `#0F172A` | Default body text color. |
| `card` | `0 0% 100%` | `#FFFFFF` | Card surface. |
| `card-foreground` | `222 47% 11%` | `#0F172A` | Text inside cards. |
| `border` | `214 16% 90%` | `#E2E8F0` | Card edges, dividers, table rules. |
| `input` | `214 16% 90%` | `#E2E8F0` | Form-control borders. |
| `ring` | `222 84% 40%` | `#1E40AF` | Focus ring (matches primary). Used via `focus-visible:ring-2 ring-ring`. |

**Semantic guidance**

- Reserve `bg-destructive` for the "urgent / after-hours / call now" CTA — it is the brand's emergency signal.
- Use `bg-primary` for the dominant per-screen action; never put two primary buttons in the same view.
- Confirmation/health states → `success`. Neutral info → `muted` + `muted-foreground`.

---

## 2. Typography

- **Font family**: `Inter, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif` (utility: `font-sans`). Inter is applied automatically inside `.dadh-tw-root`.
- **Body color**: `text-foreground` (default inside `.dadh-tw-root`).
- **Helper / secondary text**: `text-muted-foreground`.

| Class | Size / line-height | Use |
|---|---|---|
| `text-xs` | 12 / 16 | Field hints, badges. |
| `text-sm` | 14 / 20 | Form labels, table cells, buttons. |
| `text-base` | 16 / 24 | Body copy (default). |
| `text-lg` | 18 / 28 | Card titles, large form labels. |
| `text-xl` | 20 / 28 | Section headings. |
| `text-2xl` | 24 / 32 | Page subtitles. |
| `text-3xl` | 30 / 36 | Page hero / login title. |

**Weights**: `font-normal` (body), `font-medium` (labels, table headers), `font-semibold` (card titles, buttons), `font-bold` (page H1 only). Avoid `font-extrabold`/`font-black`.

**Line-height**: rely on Tailwind defaults above. For paragraph text use `leading-relaxed` (1.625); for dense data tables use `leading-tight` (1.25).

---

## 3. Spacing

Tailwind default scale: `1`=4px, `2`=8px, `3`=12px, `4`=16px, `6`=24px, `8`=32px, `12`=48px.

| Pattern | Class | Where |
|---|---|---|
| Card interior padding | `p-4` (or `p-6` for large) | `Card` content area. |
| Form-field stack | `space-y-1.5` | Between `Label` and `Input`. |
| Field-to-field stack | `space-y-4` | Inside a form. |
| Section stack | `space-y-6` | Between unrelated form sections / page chunks. |
| Inline gap | `gap-2` / `gap-4` | Flex/grid rows of buttons or chips. |

---

## 4. Border radius

Defined via `--dadh-radius: 0.5rem` and derived utilities:

| Class | Value | Use |
|---|---|---|
| `rounded-sm` | `calc(0.5rem - 4px)` = 4px | Small inputs, badges. |
| `rounded-md` | `calc(0.5rem - 2px)` = 6px | **Buttons**, inputs, selects. |
| `rounded-lg` | `0.5rem` = 8px | **Cards**, modals, popovers. |
| `rounded-full` | full | Avatars, status dots, pill chips. |

Standard radius is `lg` (0.5rem). Do not introduce arbitrary radii — change `--dadh-radius` if a global tweak is needed.

---

## 5. Shadows

| Class | Use |
|---|---|
| `shadow-sm` | Cards, raised tiles. Default elevation. |
| `shadow-md` | Popovers, dropdowns, menus. |
| `shadow-lg` | Modals, dialogs. Use sparingly. |
| `shadow-xl` / `shadow-2xl` | Avoid. |

Modern aesthetic favors `border` + soft elevation over heavy drop shadows. Combine `border border-border shadow-sm` for the standard card look.

---

## 6. Breakpoints

Container is centered with `1rem` padding, capped per breakpoint:

| Prefix | Min width |
|---|---|
| `sm:` | 640px |
| `md:` | 768px |
| `lg:` | 1024px |
| `xl:` | 1280px |
| `2xl:` | 1400px |

**Mobile-first guidance**

- Design baseline at 360px width, layer responsive utilities up.
- Sidebars collapse below `md` (use a hamburger / off-canvas).
- Two-column auth pages stack below `md` (`grid md:grid-cols-2`).
- Use `container mx-auto` for centered page wrappers.

---

## 7. Constraints / do-nots

- **Tailwind preflight is DISABLED** (`corePlugins.preflight: false`) so legacy Bootstrap/Reactstrap/MUI/mdbreact pages keep their styling. Do not re-enable it.
- New components MUST NOT depend on the preflight reset (no assumption that headings have zero margin, lists have no bullets, etc.). Apply explicit utilities.
- **Wrap every new page** in `<div className="dadh-tw-root">…</div>` to opt into the scoped reset (`box-sizing`, Inter font, foreground color, antialiasing, neutral form-control styles).
- **Path aliases (`@/components/...`) are NOT configured** — use relative imports (`../../components/ui/Button`).
- Tailwind only scans `src/components/ui/**` and migrated page folders (currently `src/pages/DoctorLogin/**`). Add new page paths to `tailwind.config.js#content` as you migrate them.
- During migration, **do not remove Bootstrap/Reactstrap imports** from any file until ALL pages using them are migrated. Final cleanup is Phase 6.
- All CSS variables are prefixed `--dadh-*`. Don't reference plain `--primary` or `--background` — they don't exist.

---

## 8. Using the components

Import paths are relative. Use `cn` to conditionally compose class strings.

```jsx
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Label from "../../components/ui/Label";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import FormField from "../../components/ui/FormField";
import { cn } from "../../components/ui/utils";
```

**Complete login-form snippet**

```jsx
export default function DoctorLogin() {
  return (
    <div className="dadh-tw-root min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-sm">
        <CardHeader className="space-y-1.5">
          <CardTitle className="text-2xl font-bold">Doctor sign in</CardTitle>
          <p className="text-sm text-muted-foreground">
            Access your DIAL A HOME DOCTOR dashboard.
          </p>
        </CardHeader>

        <CardContent>
          <form className="space-y-4">
            <FormField>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@clinic.com.au" />
            </FormField>

            <FormField>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" />
            </FormField>

            <Button type="submit" className="w-full">
              Sign in
            </Button>

            <Button type="button" variant="destructive" className="w-full">
              After-hours urgent call
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
```

`cn` example for conditional classes:

```jsx
<Button className={cn("w-full", isLoading && "opacity-60 pointer-events-none")}>
  {isLoading ? "Signing in…" : "Sign in"}
</Button>
```
