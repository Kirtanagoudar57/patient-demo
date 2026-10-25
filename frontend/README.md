# CarePoint – Patient Management Dashboard (frontend)

A React + TypeScript dashboard for the existing FastAPI patient-management API.
It reuses the backend's JWT authentication and only calls endpoints that already exist.

**Stack:** React 18 · TypeScript · Vite 6 · Tailwind CSS 4 · React Router 6 · Axios ·
React Hook Form + Zod · Recharts · Lucide icons.

---

## Quick start

```bash
# 1) Start the FastAPI backend (from the backend project root)
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000

# 2) In another terminal, start the frontend
cd frontend
cp .env.example .env        # optional, the defaults work out of the box
npm install
npm run dev                 # http://localhost:5173
```

Production build: `npm run build` (output in `dist/`), preview it with `npm run preview`.

## Environment variables

| Variable | Default | Purpose |
|---|---|---|
| `VITE_API_BASE_URL` | `/api` | Base URL the browser uses for API calls. |
| `VITE_PROXY_TARGET` | `http://127.0.0.1:8000` | Where the Vite dev server forwards `/api/*` requests. |

Only `VITE_*` variables reach the browser. Never put secrets in them.

### CORS: why the default is `/api`

The backend doesn't configure `CORSMiddleware`, so a browser page on `localhost:5173`
**cannot** call `http://127.0.0.1:8000` directly. With the default settings, the browser calls
`/api/...` on its own origin and the Vite dev server forwards the request to FastAPI
(`/api/auth/login` → `http://127.0.0.1:8000/auth/login`). No backend change is needed.

To call FastAPI directly instead (`VITE_API_BASE_URL=http://127.0.0.1:8000`), or when deploying
the built app on a different origin, add this to `app/main.py` (not done for you):

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["Authorization", "Content-Type"],
)
```

Bearer tokens are sent in a header (not cookies), so `allow_credentials` isn't required.

## Backend endpoints used

| Method & path | Used by | Notes |
|---|---|---|
| `POST /auth/register` | Signup page, "Create user" dialog | JSON `{username, email, password}` → `201 {message}`; `409` if taken. |
| `POST /auth/login` | Login page | **Form-encoded** `username`, `password` (OAuth2PasswordRequestForm) → `{access_token, token_type}`. |
| `GET /patients` | Patients table, dashboard stats | Query: `name`, `gender`, `age`, `skip`, `limit` (1–100). Bearer token required. |
| `GET /patients/{id}` | Patient details page | `404` → "Patient not found" state. |
| `POST /patients` | "Add patient" | `409` if the ID exists. Requires a client-chosen `id`. |
| `PUT /patients/{id}` | "Edit patient" | Full replacement of editable fields. |
| `DELETE /patients/{id}` | Delete (with confirmation) | |

### How authentication works

1. Login posts form data to `/auth/login` and receives a JWT in the response body.
2. The token is stored in `localStorage` and sent as `Authorization: Bearer <token>` by the
   Axios interceptor in `src/services/api.ts`.
3. The token's `sub` (username) and `exp` are read for display and to log out automatically
   when it expires (30 minutes by default on the backend).
4. Any `401` from a protected endpoint logs the user out and returns them to `/login`,
   with a "session expired" message. `/auth/*` calls are excluded, so a wrong password can't
   cause a redirect loop.
5. Logout clears the token in the browser (the backend has no logout endpoint; JWTs are stateless).

Route guards only improve the experience. **FastAPI's `get_current_user` dependency is what
actually protects patient data.**

> **Security note:** because the backend returns the token in the JSON body and reads it from
> the `Authorization` header, it must be stored where JavaScript can read it. HttpOnly cookies
> would be safer against XSS but need backend changes (set the cookie on login, read it in
> `get_current_user`, add CSRF protection and a logout endpoint that clears it).

## Pages

| Route | What it does |
|---|---|
| `/login`, `/signup` | Sign in / register (validation, show/hide password, server errors). |
| `/dashboard` | Totals, adults/minors, conditions, age-group line chart, top-conditions bar chart, gender breakdown, latest records, quick actions. All computed from `GET /patients`. |
| `/patients` | Search by name, filter by gender/exact age, pagination, sorting, create/edit/delete. |
| `/patients/:id` | Patient details with edit and delete. |
| `/users` | Create users via `/auth/register`; explains the missing listing endpoints. |
| `/profile` | Username and session expiry from the token. |
| `/settings` | Rows per page and sidebar preference (saved in this browser only), sign out. |
| `*` | 404 page. |

## Backend limitations the UI works around

These features need endpoints that **don't exist yet**. The UI says so instead of inventing data:

| Missing endpoint | Would enable |
|---|---|
| `GET /users`, `GET/PUT/DELETE /users/{id}` (+ admin role) | Real user management table with search, edit and delete. |
| `GET /auth/me`, `PUT /auth/me` | Showing email, editing the profile. |
| `PUT /auth/password` | Changing the password from Settings. |
| `POST /auth/logout` (+ token revocation) | Server-side logout before the token expires. |
| `GET /patients/stats` or a `total` count | Dashboard numbers without downloading every patient; "Page X of Y". |
| `created_at` on patients, an activity log | Trends over time and a real "recent activity" feed. |
| A `sort` query parameter | Server-side sorting (today sorting applies to the current page). |
| Address columns in `PatientDB` | Saving addresses (the API currently always returns `"Unknown"`). |
| `GET /notifications` | The notification bell. |

Other notes from reading the backend:
- `POST /patients` requires the client to choose a unique `id`; an auto-increment ID would be friendlier.
- The schema requires `address`, which isn't stored; the frontend sends the same placeholder the API returns.

## Project structure

```
src/
├── components/
│   ├── auth/        RouteGuards (ProtectedRoute, PublicOnlyRoute)
│   ├── dashboard/   StatCard, Charts
│   ├── forms/       PatientForm(+Dialog), RegisterForm, PasswordField
│   ├── layout/      Sidebar, Topbar, Breadcrumbs, UserMenu, NotificationsMenu, Avatar
│   ├── tables/      PatientsTable
│   └── ui/          Button, FormField, Card, Modal, ConfirmDialog, Skeleton, States, Badge…
├── context/         AuthContext, ToastContext, PreferencesContext
├── hooks/           useAuth, useToast, usePreferences, useAsync, useDebouncedValue, useClickOutside
├── layouts/         DashboardLayout, AuthLayout
├── lib/             validation (zod), jwt, tokenStorage, navigation, cn
├── pages/           Login, Signup, Dashboard, Patients, PatientDetails, Users, Profile, Settings, NotFound
├── services/        api (Axios client), authService, patientService, dashboardService
└── types/           auth, patient
```

**Customizing the look:** brand colors are defined once in `src/index.css` (`--color-brand-*`);
navigation items live in `src/lib/navigation.ts`.

## Manual testing checklist

- [ ] Visiting `/dashboard` while signed out redirects to `/login`.
- [ ] Wrong password shows "Incorrect username or password" (no redirect loop).
- [ ] Signup: mismatched passwords and invalid email are caught; an existing username shows the 409 message.
- [ ] After signing up you can sign in, and land on the page you originally requested.
- [ ] Dashboard shows real counts; with zero patients it shows an empty state.
- [ ] Patients: name search, gender and age filters, Next/Previous, column sorting.
- [ ] Create a minor without a guardian → "Guardian required for minors."; duplicate ID → 409 message on the ID field.
- [ ] Edit and delete (with confirmation) show success toasts and refresh the list.
- [ ] `/patients/99999` shows "Patient not found"; `/nonexistent` shows the 404 page.
- [ ] Delete the token in DevTools (or wait for it to expire) → next action returns to login with "session expired".
- [ ] Stop the backend → pages show "Cannot reach the server" with a retry button.
- [ ] Sidebar collapses on desktop and becomes a drawer on mobile; layout works at phone width.
- [ ] Sign out from the user menu returns to `/login`.
