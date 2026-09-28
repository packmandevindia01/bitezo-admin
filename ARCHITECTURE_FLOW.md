# Feature Architecture & Data Flow Guide (Client-Bitezo Standard)

This document establishes the standardized 5-layer feature architecture adopted in **Bitezo Admin** (modeled after the architecture in `client-bitezo`).

This separation ensures clean separation of concerns, high readability, isolated testing, and effortless debugging.

---

## 1. Feature Directory Structure

Every feature under `src/features/<feature>/` strictly follows this 5-layer structure:

```
src/features/<feature>/
├── components/          # Layer 4: Pure UI presentation (Forms, Tables, Modals, StatCards)
│   ├── <Feature>Form.tsx
│   └── <Feature>Table.tsx
├── hooks/               # Layer 3: Domain logic, state orchestrators, API coordination
│   └── use<Feature>Manager.ts
├── pages/               # Layer 5: Route containers & page layouts
│   └── <Feature>ListPage.tsx
├── services/            # Layer 1: HTTP calls, Axios endpoint wrappers, response mapping
│   └── <feature>Api.ts
├── types.ts             # Layer 2: TypeScript domain models, DTOs, and request contracts
└── utils/               # (Optional) Local formatters or validation helpers
```

---

## 2. The 5 Architecture Layers

```mermaid
flowchart TD
    subgraph UI_Layer ["5. Pages & Route Shell"]
        PAGE["<Feature>ListPage.tsx<br/>(Route Orchestrator)"]
    end

    subgraph State_Layer ["3. Custom Hooks (Domain Engine)"]
        HOOK["use<Feature>Manager.ts<br/>(State, Debounce, Modals, Mutations)"]
    end

    subgraph Presentation_Layer ["4. Components (Pure UI)"]
        TABLE["<Feature>Table.tsx"]
        FORM["<Feature>Form.tsx"]
    end

    subgraph Data_Layer ["1. Services & API"]
        API["<feature>Api.ts<br/>(Axios Client & Endpoints)"]
        STORE["Redux Store (Slice)<br/>(Global Cache, if shared)"]
    end

    subgraph Types_Layer ["2. Contracts & Types"]
        TYPES["types.ts<br/>(DTOs, Models, Payloads)"]
    end

    PAGE -->|Calls & consumes| HOOK
    PAGE -->|Passes props & callbacks to| TABLE
    PAGE -->|Passes props & callbacks to| FORM
    HOOK -->|Triggers HTTP requests| API
    HOOK -->|Reads/Dispatches (when needed)| STORE
    API -->|Typed by| TYPES
    FORM -->|Typed by| TYPES
    TABLE -->|Typed by| TYPES
    HOOK -->|Typed by| TYPES
```

### Layer 1: Services (`services/<feature>Api.ts`)
- **Responsibility:** Communicate with the backend via centralized Axios (`src/utils/api.ts`).
- **Rules:**
  - Never put React state, hooks, or UI logic in services.
  - Automatically handles authorization Bearer tokens and 401 token refresh through Axios interceptors.
  - Handles backend response mapping (e.g. PascalCase `DealerId` vs camelCase `dealerId`).
- **Example:**
  ```ts
  export const getDealers = async (params?: DealerFilterParams): Promise<Dealer[]> => {
    const res = await api.get("/api/dealers", { params });
    return res.data;
  };
  ```

---

### Layer 2: Contracts & Types (`types.ts`)
- **Responsibility:** Type safety for API payloads, domain entities, and component props.
- **Rules:**
  - Strictly **NO `any`** types allowed.
  - Separate DTOs/Payloads (e.g., `CreateDealerPayload`, `UpdateDealerPayload`) from UI representations (`Dealer`, `DealerFormData`).
- **Example:**
  ```ts
  export interface Dealer {
    dealerId: number;
    name: string;
    mobNo: string;
    email: string;
    countryId?: number;
    isActive: boolean;
    createdDate: string;
  }
  ```

---

### Layer 3: Custom Domain Hooks (`hooks/use<Feature>Manager.ts`)
- **Responsibility:** The "brain" of the feature.
- **What belongs in the hook:**
  1. **Data state:** records list, loading flags, error state.
  2. **Filter state:** search inputs, dropdown selections, debounced filter effects (300–500ms).
  3. **Modal UI state:** `createOpen`, `editOpen`, `deleteId`, active entity being edited.
  4. **CRUD Actions:** `handleCreate`, `handleEdit`, `handleUpdate`, `handleDelete`, `handleResetFilters`.
  5. **Notification handling:** displaying human-friendly toasts via `useToast()`.
- **What does NOT belong in the hook:**
  - JSX, HTML elements, CSS Tailwind classes, or DOM event handlers.
- **Example:**
  ```ts
  export const useDealerManager = () => {
    const { showToast } = useToast();
    const [dealers, setDealers] = useState<Dealer[]>([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({ dealerName: "", countryId: "All" });
    // ... effects, debounce, CRUD handlers ...
    return { dealers, loading, filters, setFilters, handleCreate, handleEdit, ... };
  };
  ```

---

### Layer 4: Presentation Components (`components/`)
- **Responsibility:** Render HTML and styles according to props passed from the page.
- **Rules:**
  - Components are as "dumb" as possible: they receive data via props and call callback props (`onSubmit`, `onEdit`, `onDelete`).
  - Table alignments follow **Rule 19**: headers `<th>` and data cells `<td>` are `text-center` by default, `text-right` for numbers/currency.
  - Action buttons follow standard styles (Pencil icon for Edit, Trash2 icon for Delete).
- **Example:**
  ```tsx
  <DealerTable
    dealers={dealers}
    loading={loading}
    onAdd={() => setCreateOpen(true)}
    onEdit={handleEdit}
  />
  ```

---

### Layer 5: Route Pages (`pages/<Feature>ListPage.tsx`)
- **Responsibility:** The route container that brings everything together.
- **Rules:**
  - Calls `use<Feature>Manager()` at the top.
  - Renders `PageIntro`, `FilterPanel`, the feature table, and `Modal` dialogs.
  - Contains **minimal** inline logic; acts purely as the presentation coordinator.
  - Typically fewer than 100 lines of declarative JSX.
- **Example:**
  ```tsx
  const DealerListPage = () => {
    const { dealers, loading, filters, setFilters, createOpen, setCreateOpen, ... } = useDealerManager();
    return (
      <div className="space-y-6">
        <PageIntro title="Dealers" description="..." />
        <FilterPanel onReset={handleResetFilters}>...</FilterPanel>
        <DealerTable dealers={dealers} loading={loading} onAdd={() => setCreateOpen(true)} />
        <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Add Dealer">
          <DealerForm onSubmit={handleCreate} isEdit={false} />
        </Modal>
      </div>
    );
  };
  ```

---

## 3. Standard Request & Data Flow Lifecycle

```
[User Action: Search / Filter]
       │
       ▼
1. User types in FilterPanel input
       │
       ▼
2. Page triggers `setFilters(...)` on custom hook
       │
       ▼
3. Hook's debounced `useEffect` waits 400ms to avoid API flooding
       │
       ▼
4. Hook sets `loading = true` and invokes `api.ts` service method
       │
       ▼
5. Axios attaches Bearer token from Redux; sends HTTP request
       │
       ▼
6. Backend responds:
   ├── Success (200/201):
   │     Hook updates records state (`setDealers(data)`)
   │     Hook sets `loading = false`
   │     Page re-renders table with fresh data
   └── Failure (400/500/Network):
         Axios catches error or triggers 401 refresh
         Hook catches error and calls `showToast("Error message", "error")`
         Hook sets `loading = false`
```

---

## 4. Current Bitezo-Admin Feature Matrix

| Feature | Hook (`hooks/`) | Page (`pages/`) | Service (`services/`) | Presentation Components (`components/`) |
| :--- | :--- | :--- | :--- | :--- |
| **Employees** | `useEmployeeManager.ts` | `EmployeeListPage.tsx` | `employeeApi.ts` | `EmployeeForm.tsx`, `EmployeeTable.tsx` |
| **Dealer** | `useDealerManager.ts` | `DealerListPage.tsx` | `dealerApi.ts` | `DealerForm.tsx`, `DealerTable.tsx` |
| **User** | `useUserManager.ts` | `UserList.tsx`, `UserCreationPage.tsx` | `userApi.ts` | `UserForm.tsx`, `UserTable.tsx`, `PasswordChangeForm.tsx` |
| **Customer** | `useCustomerManager.ts` | `CustomerListPage.tsx`, `CustomerRegistrationPage.tsx` | `customerApi.ts` | `CustomerForm.tsx`, `CustomerTable.tsx` |
| **Dashboard** | `useDashboardData.ts` | `DashboardPage.tsx` | `dashboardApi.ts` | `StatCard.tsx`, `SalesChart.tsx`, `PurchaseChart.tsx` |
| **Reports** | `useCustomerReport.ts` | `CustomerReportPage.tsx`, `UserReportPage.tsx` | `customerRptListApi.ts` | `ReportFilters.tsx`, `ReportHeader.tsx` |
| **Auth** | `useAuth.ts` | `LoginPage.tsx`, `VerifyOtpPage.tsx`, etc. | `authApi.ts` | `LoginForm.tsx`, `OtpForm.tsx`, `EmailForm.tsx`, `ResetPasswordForm.tsx` |

---

## 5. How to Debug Quickly

1. **Bug in UI layout or styling?**
   - Check `components/<Component>.tsx` directly.
   - Verify table column alignment (`text-center` default, `text-right` for numbers).
2. **Bug in filter debounce, modal opening/closing, or form submission state?**
   - Check `hooks/use<Feature>Manager.ts`. No need to touch JSX!
3. **Bug in API endpoint URL, query parameter serialization, or response casing?**
   - Check `services/<feature>Api.ts`.
4. **Type mismatch or missing field?**
   - Check `types.ts`. All DTOs and interfaces are centralized here.
