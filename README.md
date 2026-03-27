# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

src/
├── App.tsx
├── index.css
├── main.tsx
│
├── components/
│   ├── common/
│   │   ├── Button.tsx
│   │   ├── Checkbox.tsx
│   │   ├── EmptyState.tsx
│   │   ├── FormInput.tsx
│   │   ├── Loader.tsx
│   │   ├── Modal.tsx
│   │   ├── Pagination.tsx
│   │   ├── SearchBar.tsx
│   │   ├── SelectInput.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── Table.tsx
│   │   └── index.ts
│   └── layout/
│       ├── MainLayout.tsx
│       ├── Navbar.tsx
│       ├── Sidebar.tsx
│       ├── SidebarDropdown.tsx
│       ├── SidebarItem.tsx
│       └── Topbar.tsx
│
├── context/
│   └── ToastContext.tsx
│
├── features/
│   ├── auth/
│   │   ├── components/
│   │   │   ├── EmailForm.tsx
│   │   │   ├── LoginForm.tsx
│   │   │   ├── OtpForm.tsx
│   │   │   ├── OtpInput.tsx
│   │   │   └── ResetPasswordForm.tsx
│   │   ├── pages/
│   │   │   ├── ForgotPasswordPage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   ├── ResetPasswordPage.tsx
│   │   │   └── VerifyOtpPage.tsx
│   │   └── services/
│   │       └── authApi.ts
│   │
│   ├── customer/
│   │   ├── components/
│   │   │   ├── CustomerForm.tsx
│   │   │   └── CustomerTable.tsx
│   │   ├── pages/
│   │   │   ├── CustomerListPage.tsx
│   │   │   └── CustomerRegistrationPage.tsx
│   │   ├── services/
│   │   │   └── customerApi.ts
│   │   ├── utils/
│   │   │   ├── countryMapper.ts
│   │   │   ├── customerValidation.ts
│   │   │   └── formatters.ts
│   │   └── types.ts
│   │
│   ├── dashboard/
│   │   ├── components/
│   │   │   ├── PurchaseChart.tsx
│   │   │   ├── SalesChart.tsx
│   │   │   └── StatCard.tsx
│   │   └── pages/
│   │       └── DashboardPage.tsx
│   │
│   ├── reports/
│   │   ├── pages/
│   │   │   └── ReportsPage.tsx
│   │   ├── services/
│   │   │   └── customerRptListApi.ts
│   │   └── utils/
│   │       ├── customerReport.ts
│   │       ├── exportExcel.ts
│   │       ├── exportPDF.ts
│   │       ├── reportHelpers.ts
│   │       └── userReport.ts
│   │
│   └── user/
│       ├── components/
│       │   ├── UserForm.tsx
│       │   └── UserTable.tsx
│       ├── pages/
│       │   ├── UserCreationPage.tsx
│       │   └── UserList.tsx
│       ├── services/
│       │   └── userApi.ts
│       └── types.ts
│
├── routes/
│   ├── Approutes.tsx
│   └── ProtectedRoute.tsx
│
├── store/
│   ├── customerSlice.ts
│   ├── store.ts
│   └── userSlice.ts
│
└── utils/
    └── validators.ts
    |__ api.ts