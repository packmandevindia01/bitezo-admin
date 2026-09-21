# Project Rules — bitezo-admin
# Central Super-Admin & Management Dashboard

## Tech Stack
- **Frontend Framework:** React 19 (`^19.2.4`), React DOM 19, TypeScript (`~5.9.3`), Vite 8
- **Styling:** Tailwind CSS v4 (`@tailwindcss/vite` + `tailwindcss` v4.2.2)
- **State Management:** Redux Toolkit (`@reduxjs/toolkit` `^2.11.2`, `react-redux` `^9.2.0`) with `store.ts` (`authSlice`, `customerSlice`, `userSlice`)
- **Routing:** React Router v7 (`react-router-dom` `^7.13.1`) with `Approutes.tsx` and `ProtectedRoute.tsx`
- **HTTP Client:** Axios centralized in `src/utils/api.ts` with JWT Bearer token request interceptor and automatic 401 refresh token interceptor (`/api/auth/refresh`)
- **Visualizations & Charts:** Recharts (`^3.8.0`) for sales and purchase analytics
- **Reports & Export Engines:** `jspdf`, `jspdf-autotable`, `exceljs`, `xlsx`, `xlsx-js-style`
- **Validation & Internationalization:** `libphonenumber-js` for phone numbers and custom regex validators in `src/utils/validators.ts`
- **Icons:** `lucide-react` (`^0.577.0`)
- **Context & Alerts:** `ToastContext` (`useToast` hook) with animated toast stack
- **Brand Palette:** Primary brand burgundy/plum `#49293e`, hover `#3c2232` / `#6b3d5a`, accents `#49293e]/5`, `#49293e]/10`, `#49293e]/20`, border `#49293e]/40`
- **Environment:** `.env` (`VITE_API_BASE_URL`)

---

## Strict Git Operations & Revert Rule
- **NEVER** run any command that reverts, restores, resets, or discards code (`git checkout`, `git restore`, `git reset`, `git revert`, `git clean`, `git stash drop`, etc.) without explicit, direct permission from the USER. All existing and modified code must be strictly preserved.

---

## Strict Shared / Common Component Protection Rule
- **NEVER** modify, refactor, edit, or touch any global shared/common component in `src/components/common/` (e.g. `Table.tsx`, `Button.tsx`, `FormInput.tsx`, `SelectInput.tsx`, `Checkbox.tsx`, `Modal.tsx`, `SearchBar.tsx`, `FilterBar.tsx`, `FilterPanel.tsx`, `PageIntro.tsx`, `Pagination.tsx`, `Loader.tsx`, `EmptyState.tsx`, `StatusBadge.tsx`) or layout components in `src/components/layout/` (`MainLayout.tsx`, `Sidebar.tsx`, `Topbar.tsx`, `Navbar.tsx`) without explicit, direct permission from the USER.
- All feature-specific or page-specific customizations, icon handlers, column renderers, or styling overrides MUST be implemented inside the calling feature/page component (e.g., via props, wrappers, or local Tailwind classes) without altering shared common component files.

---

## Table Data Alignment Rule (CRITICAL GLOBAL STANDARD)
- **All table headings (`<th>`) and their corresponding data cells (`<td>`) MUST be center-aligned by default (use `text-center`) so that data perfectly aligns under the headings.**
- **Exceptions:**
  - **Numeric / Money / Count columns:** MUST be right-aligned (`text-right`).
  - **Long text / Descriptive columns (e.g., full customer name, notes):** May be left-aligned (`text-left`), but ONLY when the corresponding header `<th>` is also explicitly left-aligned.
- **NEVER** use mismatched left-padding or mismatched alignment on headers vs data cells, as it breaks column alignment.
- Ensure every custom `render` function in column definitions conforms to the column's alignment style.

---

## Actual Project Structure — STRICTLY follow this

```
src/
  components/
    common/             # Shared UI primitives: Button, FormInput, SelectInput, Table, Modal, Checkbox, SearchBar, FilterPanel, PageIntro, etc.
    layout/             # App shell: MainLayout, Sidebar, SidebarItem, SidebarDropdown, Topbar, Navbar
  constants/            # System-wide static options: formOptions.ts (countries, connection modes, demo statuses, roles)
  context/              # React contexts: ToastContext.tsx (useToast)
  features/
    auth/               # Authentication, login, OTP verification, password reset, onboarding
    customer/           # Customer (tenant/company) registration, edit, listing, table
    dashboard/          # Analytics dashboard, SalesChart, PurchaseChart, StatCards
    dealer/             # Franchise / Dealer management, DealerList, DealerForm, DealerTable
    employees/          # Employee management, EmployeeList, EmployeeForm, EmployeeTable
    reports/            # Customer & user reports, filter panel, PDF/Excel export helpers
    user/               # System user management, UserList, UserCreation, PasswordChangeForm
  pages/                # Fallback views: NotFoundPage.tsx
  routes/               # Approutes.tsx, ProtectedRoute.tsx
  store/                # Redux store setup: store.ts, authSlice.ts, customerSlice.ts, userSlice.ts
  utils/                # Helpers: api.ts, countryMapper.ts, phonePrefix.ts, validators.ts
  App.css
  index.css             # Tailwind v4 theme configuration and base layers
  main.tsx              # Application entry point
```

---

## Feature Folder Convention
Every feature follows this internal structure — never mix files across layers:

```
features/<feature>/
  components/     # UI components specific to this feature (Forms, Tables, Charts, Modals)
  pages/          # Page components rendered by routes (<Feature>Page.tsx, <Feature>List.tsx)
  services/       # Axios API integration calls (<feature>Api.ts)
  types.ts        # TypeScript interfaces, DTOs, request params, and form data types
  utils/          # Local helpers or validators specific to this feature (optional)
  hooks/          # Feature-specific custom hooks (optional)
  constants.ts    # Constants specific to this feature (optional)
```

**Existing feature domains:**
- `auth` — Authentication, login, OTP verification, onboarding, password reset
- `customer` — Customer (client/company) master data, registration, edit
- `dashboard` — Executive analytics, charts, KPI stat cards
- `dealer` — Dealer/franchise network management
- `employees` — Staff/employee records mapped to dealers and countries
- `reports` — Customer reports, user reports, and data export pipelines
- `user` — System admin/operator accounts and credentials

---

## Routing Rules
- All routes are declared in `src/routes/Approutes.tsx`.
- **Public Routes:**
  - `/` — Login (`LoginPage`)
  - `/onboarding` — Initial onboarding flow (`OnboardingPage`)
  - `/onboarding/company` — Public company registration (`CompanyRegistrationPage`)
  - `/forgot-password` — Password recovery request (`ForgotPasswordPage`)
  - `/verify-otp` — OTP validation (`VerifyOtpPage`)
  - `/reset-password` — Password reset with token (`ResetPasswordPage`)
- **Protected Routes:**
  - Protected under `ProtectedRoute` wrapper component.
  - Rendered inside `MainLayout` shell under path `/dashboard`.
  - `/dashboard` — Dashboard KPIs & Charts
  - `/dashboard/customers` — Customer listing
  - `/dashboard/customers/create` — Create new customer
  - `/dashboard/customers/edit/:id` — Edit customer details
  - `/dashboard/users` — System user accounts list
  - `/dashboard/user/create` — Add new system user
  - `/dashboard/employees` — Employee list and management
  - `/dashboard/dealers` — Dealer / franchise network list
  - `/dashboard/customers-reports` — Customer reporting & export
  - `/dashboard/users-reports` — User reporting & export
  - `*` — Catch-all routes render `NotFoundPage`.

---

## Component Architecture
- Functional components with React hooks only — never class components.
- Explicit TypeScript props interfaces defined directly above the component in the same file.
- File naming: PascalCase `.tsx` for components, camelCase `.ts` for hooks, services, and utility files.
- Export style: Prefer default export for primary page/component files (`export default EmployeeList;`), named exports for types and utilities.

---

## Existing Common Components — ALWAYS reuse, NEVER recreate

These live in `src/components/common/` and are exported through `src/components/common/index.ts`:

| Component       | Purpose & Usage |
|-----------------|-----------------|
| `Table`         | Standard data grid with generic typing `Table<T>`, pagination, empty state, loader, and hover effect |
| `Button`        | Standard buttons with variants (`primary`, `secondary`, `danger`), sizes (`sm`, `md`, `lg`), and animated loading state |
| `FormInput`     | Text, password (with show/hide eye toggle), email, number inputs with floating label, error, and red required asterisk |
| `SelectInput`   | Dropdowns with options array (`SelectOption[]`), error highlight, placeholder, and required indicator |
| `Checkbox`      | Toggle switch style checkbox for boolean states (`isActive`, demo mode, etc.) |
| `Modal`         | Dialog overlay with backdrop, header title, close X button, and ESC keyboard handler |
| `SearchBar`     | Search input field with search magnifying icon and clear button |
| `FilterPanel`   | Filter bar container with flexible children and a dedicated Reset Filters button |
| `PageIntro`     | Page header banner with title, subtitle description, and right-aligned action buttons |
| `Pagination`    | Page navigation controls (Previous, Next, page numbers) |
| `Loader`        | SVG spinner for asynchronous loading states |
| `EmptyState`    | Empty list placeholder with icon, message, and optional CTA button |
| `StatusBadge`   | Visual badge for status indicators (`active` = green, `inactive` = red, `pending` = amber) |

---

## API & HTTP Rules
- **Axios Client:** All API calls MUST use the centralized client from `src/utils/api.ts` — never use raw `fetch` or bare `axios`.
- **Base URL:** Always read from `import.meta.env.VITE_API_BASE_URL`. Never hardcode IP addresses, `localhost`, or port numbers in feature services.
- **Authorization Token:** The Bearer token is automatically attached to requests via the interceptor reading from the Redux store (`store.getState().auth.accessToken`).
- **401 Refresh Flow:** If an access token expires, `src/utils/api.ts` automatically attempts to call `/api/auth/refresh` using `refreshToken`. If refresh fails, credentials in Redux and localStorage are cleared and user is redirected to `/`.
- **Service Files:** Keep all endpoint definitions in `src/features/<feature>/services/<feature>Api.ts`.
- **Response Handling:** Inspect error responses for server error messages (`err?.response?.data?.message || "Operation failed"`) and show human-readable toasts.

---

## State Management Rules (Redux Toolkit)
- **Global Store:** Configured in `src/store/store.ts`.
  - `auth`: Access token, refresh token, session expiry, and current `AuthUser` profile.
  - `customers`: Customer list, global loading state, and error handling.
  - `users`: User list, loading state, and error handling.
- **Synchronized Persistence:** `authSlice` synchronizes authentication tokens and user JSON to `localStorage` (`accessToken`, `refreshToken`, `user`, `sessionExpiresAt`).
- **Feature vs Local State:**
  - Global shared entities (user profile, customer list) go into Redux slices.
  - Transient UI state (modals open/close, active form inputs, temporary filter inputs) MUST remain local component state (`useState`) to prevent unnecessary store overhead.

---

## Form & Input UX Rules

### 1. Autofocus First Field
- Every modal or creation form MUST autofocus the first interactive input field (`autoFocus` prop on `FormInput`).
- When a modal opens, focus should land directly on the first field so the user can begin typing immediately.

### 2. Tab Key Navigation & Reset Button Flow
- Form inputs must follow a logical top-to-bottom, left-to-right Tab order.
- **Reset/Clear buttons:** Secondary actions like "Clear" or "Reset" must use `tabIndex={-1}` so keyboard users tab directly from the last input field to the primary Submit/Save button without accidental reset.

### 3. Required Fields & Validation
- Required fields must display a red asterisk (`<span className="text-red-500 ml-1">*</span>`) next to the label.
- Always validate forms before calling the API using validators from `src/utils/validators.ts`:
  - `isRequired(val)`
  - `isValidEmail(email)`
  - `isValidMobile(mob, countryCode)` using `libphonenumber-js`
- Display inline error messages below or next to the field with red border styling (`border-red-500 bg-red-50`).

### 4. Money & Numeric Fields
- All numeric and monetary input fields must have right-aligned text (`text-right`).
- Labels remain left-aligned for visual consistency.
- Never allow negative values in price, amount, or count inputs unless explicitly supported.

### 5. Active/Inactive Toggle Switches
- Use the standard `Checkbox` component (styled as a toggle switch) for binary status flags:
  ```tsx
  <Checkbox
    label="Is Active"
    checked={form.isActive}
    onChange={(e) => handleChange("isActive", e.target.checked)}
  />
  ```

### 6. Mobile Number Formatting & Internationalization
- Use `src/utils/countryMapper.ts` and `src/utils/phonePrefix.ts` to map selected countries to dial codes and formats.
- Provide country-aware placeholders (e.g., via `MOBILE_PLACEHOLDERS`).

---

## Master Data & List Page Patterns

Every list page in the dashboard (`customers`, `dealers`, `employees`, `users`) follows this unified UX pattern:

1. **Header Banner (`PageIntro`):**
   - Displays page title, concise description, and primary CTA (e.g., "+ Add Customer" or Export buttons).
2. **Filter Section (`FilterPanel`):**
   - Group search inputs, status selects, dealer/country dropdowns.
   - Include a "Reset Filters" action button.
   - Implement debouncing (e.g., 300-400ms) on text search filters to avoid flooding the API.
3. **Table View (`Table`):**
   - Columns: Center-aligned headings and cells (`text-center`) by default.
   - Format statuses with `StatusBadge`.
   - Action buttons:
     - **Edit Button:** `<button title="Edit" className="p-2 rounded-lg text-blue-500 bg-blue-50 hover:bg-blue-500 hover:text-white transition-all duration-200 hover:scale-110"><Pencil size={15} /></button>`
     - **Delete Button:** `<button title="Delete" className="p-2 rounded-lg text-red-500 bg-red-50 hover:bg-red-500 hover:text-white transition-all duration-200 hover:scale-110"><Trash2 size={15} /></button>`
4. **Modals for CRUD:**
   - Create and Edit operations should use `Modal` dialogs wrapping dedicated forms (`CustomerForm`, `EmployeeForm`, `DealerForm`).
   - Destructive actions (Delete, Deactivate) MUST open a confirmation `Modal` — **NEVER use native `window.confirm()`**.
5. **LIFO Sorting:**
   - Always sort records with the newest entries at the top (by created date or descending ID).

---

## Reporting & Data Export Pipeline

Reporting modules (`CustomerReportPage`, `UserReportPage`) in `src/features/reports/` adhere to strict export standards:

- **Dedicated Service Layer:** Reports use specific report APIs (e.g., `src/features/reports/services/customerRptListApi.ts`).
- **Excel Export:**
  - Use `xlsx` / `xlsx-js-style` / `exceljs` (`src/features/reports/utils/exportExcel.ts`).
  - Style header rows with background fills, bold typography, and correct column widths.
  - Format monetary values and dates properly.
- **PDF Export:**
  - Use `jspdf` and `jspdf-autotable` (`src/features/reports/utils/exportPDF.ts`).
  - Include company header, report title, active filter parameters, generation timestamp, and page numbers.
- **Export Trigger Buttons:**
  - Excel: Emerald button (`text-emerald-600 bg-emerald-50 border-emerald-100 hover:bg-emerald-600 hover:text-white`).
  - PDF: Red button (`text-red-500 bg-red-50 border-red-100 hover:bg-red-500 hover:text-white`).

---

## Toast Notification System
- Toast provider lives in `src/context/ToastContext.tsx`. Access via `useToast()` hook:
  ```tsx
  const { showToast } = useToast();
  ```
- **Variants:**
  - `showToast("Operation successful", "success")` — Green toast with checkmark icon
  - `showToast("Error message", "error")` — Red toast with X icon
  - `showToast("Informative note", "info")` — Blue toast with info icon
- Auto-dismiss after 3000ms.
- Always display human-readable strings, never raw error objects or unhandled promises.

---

## Styling & Theme Rules
- **Tailwind CSS v4:** Utilize Tailwind utility classes.
- **Brand Colors:**
  - Primary button & active element: `#49293e` (`hover:bg-[#3c2232]`, `ring-[#49293e]`)
  - Secondary button: `bg-gray-200 text-gray-800 hover:bg-gray-300`
  - Danger button: `bg-red-500 text-white hover:bg-red-600`
  - Subtle borders: `border-gray-200`
- **Responsive Layout:**
  - Fully responsive from mobile (375px) to wide monitors (1920px).
  - Sidebar toggles via mobile menu button on screens `< 1024px`.
  - All tables must be wrapped with `<div className="overflow-x-auto">` to prevent mobile layout clipping.

---

## TypeScript Rules
- Strict mode is enabled.
- **NEVER** use `any` — always define explicit interfaces in `types.ts` or narrow with `unknown`.
- Props interfaces must be typed explicitly.
- Avoid `// @ts-ignore` or `// @ts-nocheck`.

---

## Strict Production Standards
- **No Hardcoded API Endpoints:** Never commit hardcoded `http://localhost:...` or raw server IPs inside components or services. All endpoints must route through `src/utils/api.ts` backed by `VITE_API_BASE_URL`.
- **No Leftover Debugging:** Remove all `console.log` statements and temporary test code before committing.
- **No Silent Failures:** Ensure all asynchronous errors are captured and reported to the user via toast notifications.

---

## Post-Feature Pedagogical Review (Interview Prep)
Whenever a major feature or refactor is completed, provide a summary addressing these 6 categories to deepen understanding and assist with technical interview preparation:

1. **Understand WHAT was built:** Flow of data, key components, and step-by-step functionality.
2. **Understand WHY decisions were made:** Architectural trade-offs, state choices (Redux vs local state), library selections.
3. **Understand EDGE CASES:** Network latency, token expiration, validation boundary cases, empty states.
4. **Understand PERFORMANCE implications:** Debouncing, re-rendering prevention, bundle size, memoization.
5. **Understand HOW TO EXPLAIN it in an interview:** Elevator pitch (2-3 sentences), technical deep dive, and layman explanation.
6. **Understand CONNECTIONS to fundamentals:** JavaScript closures, React 19 hooks, event loop, HTTP interceptors, REST principles.
