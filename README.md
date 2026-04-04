# Bitezo Admin

Bitezo Admin is a React + TypeScript dashboard for managing customers, users, employees, and dealers, with reporting tools and JWT-based authentication.

## Tech Stack

- React 19
- TypeScript
- Vite
- Redux Toolkit + React Redux
- React Router
- Axios
- Tailwind CSS
- Recharts
- jsPDF / ExcelJS / XLSX

## Core Features

- Authentication flow
  - Login
  - Forgot password
  - OTP verification
  - Reset password
  - Token refresh via Axios interceptor
- Customer management
  - Create, edit, list
  - Validation and formatting
- User management
  - Create and list users
- Employee management
  - Create, edit, delete
  - Dealer mapping
  - Filtered listing (`empName`, `dealerId`, `country`)
- Dealer management
  - Create, edit, list
- Reports
  - Customer reports
  - User reports
  - Export utilities (PDF/Excel)

## Project Structure

```text
src/
  components/
    common/
    layout/
  context/
    ToastContext.tsx
  features/
    auth/
    customer/
    dealer/
    employees/
    dashboard/
    reports/
    user/
  routes/
    AppRoutes.tsx
    ProtectedRoute.tsx
  store/
    store.ts
    authSlice.ts
    customerSlice.ts
    userSlice.ts
  utils/
    api.ts
```

## Environment Variables

Create a `.env` file in the project root:

```env
VITE_API_BASE_URL=http://84.255.173.131:8088
```

## Getting Started

1. Install dependencies

```bash
npm install
```

2. Run development server

```bash
npm run dev
```

3. Build for production

```bash
npm run build
```

4. Preview production build

```bash
npm run preview
```

## Available Scripts

- `npm run dev`: start Vite development server
- `npm run build`: TypeScript build + Vite production build
- `npm run lint`: run ESLint
- `npm run preview`: preview production build locally

## Routing Overview

Public routes:

- `/`
- `/forgot-password`
- `/verify-otp`
- `/reset-password`

Protected routes (under `/dashboard`):

- `/dashboard`
- `/dashboard/customers`
- `/dashboard/customers/create`
- `/dashboard/customers/edit/:id`
- `/dashboard/users`
- `/dashboard/user/create`
- `/dashboard/employees`
- `/dashboard/dealers`
- `/dashboard/customers-reports`
- `/dashboard/users-reports`

## API Layer Notes

- Centralized API client: `src/utils/api.ts`
- Bearer token is attached from Redux auth state
- On `401`, refresh token flow is attempted automatically
- If refresh fails, auth is cleared and user is redirected to login

## State Management

Global state is handled with Redux Toolkit:

- `auth`: access/refresh token + user session
- `customers`: customer list and loading/error state
- `users`: user list and loading/error state

Feature-level UI state (modals, local form state, temporary filters) is managed locally where appropriate.

## Development Notes

- Use typed models in each feature's `types.ts`
- Keep API calls in feature `services/`
- Prefer reusable UI from `components/common`
- Keep shared cross-feature logic in `utils/` and Redux slices

## License

Private project. Internal use only.
