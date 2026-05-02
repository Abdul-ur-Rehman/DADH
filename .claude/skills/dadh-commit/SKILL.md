---
name: dadh-commit
description: Commit changes scoped strictly to the dadh-frontend/ and dadh-backend/ directories of the DADH telemedicine project. Excludes Claude-related files at the repo root (.claude/, CLAUDE.md, ROADMAP.md, MEMORY.md, "reference pictures/", any other top-level docs). Writes a meaningful conventional commit message. Does NOT add Claude as a co-author. Does NOT push. Use when the user says "commit", "commit the changes", "commit phase X", "git commit", or after a logical chunk of work has been completed and verified.
---

# DADH Commit Skill

Use this skill to commit code changes in the DADH project. The repo at `D:\DADH-Code` contains two product directories (`dadh-frontend/`, `dadh-backend/`) plus various Claude-only files at the root that must never be committed.

## Hard rules

1. **Only stage files inside `dadh-frontend/` or `dadh-backend/`.** Nothing else.
2. **Never stage** any of these (even if modified):
   - `.claude/` directory and everything under it
   - `CLAUDE.md`
   - `ROADMAP.md`
   - `MEMORY.md`
   - `reference pictures/` directory
   - Any `.md` file at the repo root
   - `.env` files (already in `.gitignore` but verify)
   - Any new top-level file or directory not under `dadh-frontend/` / `dadh-backend/`
3. **Commit message:** conventional style, meaningful, describes the *why* not just the *what*. Group related changes. Use a short title (≤72 chars) + a body when needed.
4. **No `Co-Authored-By: Claude`** line. No "🤖 Generated with Claude Code" footer. Plain commit only.
5. **Do not push** — only commit. The user pushes themselves.
6. **Do not amend** previous commits. Always create a new commit.
7. **Never use `--no-verify`** to skip hooks. If a hook fails, fix the underlying issue first.

## Procedure

### Step 1 — Survey the changes
Run these in parallel:
- `git status --short` (in `D:/DADH-Code`)
- `git diff --stat dadh-frontend/ dadh-backend/`
- `git log --oneline -5` (to match repo's commit-message style)

### Step 2 — Stage only the allowed scope
Use exactly:
```
git add dadh-frontend/ dadh-backend/
```
This adds modifications, new files, AND deletions inside those two directories. It will NOT pick up anything outside them.

### Step 3 — Verify the staged set is clean
Run:
```
git diff --cached --name-only
```
Every line of output MUST start with `dadh-frontend/` or `dadh-backend/`. If anything else appears (e.g. a `CLAUDE.md` that got modified, or a stray top-level file), `git restore --staged <path>` to unstage it before continuing.

### Step 4 — Draft the commit message
Look at what was actually changed and write a message that explains the rationale. Format:

```
<type>(<scope>): <short imperative summary>

<optional body — bullet points, paragraphs, or both>
```

Common `<type>` values: `feat`, `fix`, `chore`, `refactor`, `docs`, `test`, `style`, `perf`.
Common `<scope>` values: `backend`, `frontend`, `both`, or a specific area (`auth`, `consultations`, `admin-portal`, etc.).

If the work spans many areas (e.g. a whole phase), use `chore(both): phase N — <short summary>` with a body listing the major areas touched.

### Step 5 — Commit
Pass the message via a HEREDOC to preserve formatting. **No Co-Authored-By line. No tool footer.**

```bash
git commit -m "$(cat <<'EOF'
<your full message here>
EOF
)"
```

### Step 6 — Verify
- Run `git log -1 --stat` and confirm:
  - The message looks right
  - Only `dadh-frontend/*` and `dadh-backend/*` paths appear in the file list
  - No `Co-Authored-By` line appears in `git log -1`
- Run `git status` and confirm the working tree shows only untracked Claude/root files (which is the expected state).

### Step 7 — Report
Tell the user concisely:
- Commit SHA (short)
- One-line summary of the message
- File count and a one-line breakdown (e.g. "23 files: 18 modified, 5 deleted, 2 added")
- Confirm nothing outside `dadh-frontend/` or `dadh-backend/` was committed

Do NOT push. Do NOT offer to push unless the user asks.

## Example messages

For a phase completion:
```
chore(both): phase 1 — stabilize existing code

Backend:
- Fix undefined Certificate / DoctorRequest model references
- Add documentUrl + status to billing model (admin payment grid)
- Move Resend API key from source to env
- Remove OTP from login response (security)
- Fix updatePatientById missing 'address' destructure
- Delete 4 backup .copy.js, 2 dead orphan routers, 4 unused models
- Remove debug console.logs

Frontend:
- Read API_URL from REACT_APP_BACKEND_URL (was empty string)
- Move Sendbird App ID to env across 7 files
- Remove hardcoded localhost:5001 from doctor sidebar
- Wire patient profile save to PATCH /api/patient/auth/update/:id
- Fix doctor /billing and /support routes (were rendering login page)
- Replace 6 Veltrix template logos with DADH brand logo
- Fix Italian leakage in Spanish translations
- Remove debug console.logs

Add seed-test-doctor.js / seed-test-users.js scripts.
```

For a small fix:
```
fix(frontend): wire patient profile save to backend

PatientProfile.js had 5 unwired TODOs that updated local state only.
Now PATCHes /api/patient/auth/update/:patientId with edited fields.
Includes loading state and basic error feedback.
```

For a new feature:
```
feat(backend): add doctor approval workflow

New 'pending' status on doctor signup. Login is gated until admin
approves via the doctor-requests endpoint. Adds approve/reject
controllers and email notification on approval.
```

## What NOT to do

- ❌ `git add .` — picks up Claude files at root
- ❌ `git add -A` — same problem
- ❌ `git add --all` — same problem
- ❌ Including `🤖 Generated with Claude Code` or `Co-Authored-By: Claude` footers
- ❌ Pushing the commit
- ❌ Amending previous commits
- ❌ Force-pushing
- ❌ Bypassing pre-commit hooks with `--no-verify`
- ❌ Committing `.env` files even if they appear modified (`git restore --staged` them)
