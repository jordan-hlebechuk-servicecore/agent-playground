# Docket Codebase Overview

> **Purpose**: This document provides AI agents with a quick reference to understand the Docket codebase architecture, conventions, and key patterns.

## What is Docket?

Docket is a **Field Service Management Web Application** primarily designed for the roll-off dumpster/waste management industry. It's a React-based web application with a Firebase backend, deployed on Google Cloud Platform.

---

## Repository Structure

```
docket/
├── app/                    # Frontend React application
├── functions/              # Firebase Cloud Functions (backend)
├── docs/                   # Documentation
├── scripts/                # Build and utility scripts
├── internals/              # Internal build tooling
├── .storybook/             # Storybook configuration
└── [config files]          # Various configuration files
```

---

## Frontend (`/app`)

### Tech Stack

- **React 18** with JSX/TSX
- **Redux** + **Redux Toolkit (RTK)** for state management
- **Redux-Saga** for side effects
- **Firebase SDK** for real-time database and auth
- **Semantic UI React** + **Material UI (MUI)** for UI components
- **Kendo React** for advanced grids and inputs
- **Vite** as build tool
- **Styled Components** for styling
- **React Router v5** for navigation

### Entry Points

- **`app/app.jsx`**: Main application entry point, sets up Redux store, routing, and providers
- **`app/containers/App/index.jsx`**: Root App component with routing and global UI elements

---

## State Management

### Redux Store Configuration

Located in `app/rtk/`:

```
app/rtk/
├── rtk.js              # Store creation and persistor export
├── utils/
│   └── createStore.js  # Store configuration with middleware
├── reducers/
│   └── rootReducer.js  # Combines all reducers
├── api/                # RTK Query API slices (Firebase-based)
├── openapi/            # RTK Query slices for REST API endpoints
└── slices/             # Redux Toolkit slices
```

### State Management Patterns

#### 1. Legacy Redux Pattern (Container-based)

Each container in `app/containers/` follows the **ducks pattern**:

```
containers/Jobs/
├── index.jsx           # Main component
├── actions.js          # Action creators
├── constants.js        # Action type constants
├── reducer.js          # Redux reducer
├── saga.js             # Redux-Saga side effects
├── selectors.js        # Reselect memoized selectors
├── Loadable.js         # Code-splitting wrapper
└── components/         # Presentational components
```

#### 2. RTK Query (Modern Pattern)

For API calls, uses RTK Query with two APIs:

**Firebase-based API** (`app/rtk/api/`):

```typescript
// app/rtk/api/api.ts
export const emptySplitApi = createApi({
  baseQuery: fakeBaseQuery(),
  endpoints: () => ({}),
});
```

**REST API (OpenAPI)** (`app/rtk/openapi/`):

```typescript
// app/rtk/openapi/openapi.ts
export const openApi = createApi({
  reducerPath: "openApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.VITE_DOCKET_BACKEND_URL,
    prepareHeaders: async (headers) => await getAuthenticationHeaders(headers),
  }),
  endpoints: () => ({}),
});
```

API slices are located in:

- `app/rtk/api/slices/` - Firebase/Firestore operations
- `app/rtk/openapi/slices/` - REST API endpoints

#### 3. RTK Slices

Modern state management slices in `app/rtk/slices/`:

- `accountIds/` - Account ID state
- `global/` - Global app state
- `sidedeckQueue/` - SideDeck queue management
- `sidedeckV2/` - New SideDeck state management

---

## Containers vs Components

### Containers (`app/containers/`)

**Smart components** connected to Redux store. Each represents a major feature/page:

| Container                  | Purpose                        |
| -------------------------- | ------------------------------ |
| `App/`                     | Root application wrapper       |
| `Jobs/`                    | Job management                 |
| `Customers/`               | Customer management            |
| `Invoices/`                | Invoicing                      |
| `Estimates/`               | Estimates/quotes               |
| `Dispatch/`, `DispatchV2/` | Dispatch and routing           |
| `Employees/`               | Employee management            |
| `Equipment/`               | Equipment/asset management     |
| `Schedule/`                | Scheduling                     |
| `Settings/`                | App settings (nested reducers) |
| `Recurring/`               | Recurring invoices/routes      |
| `Leads/`                   | Lead management                |

### Components (`app/components/`)

**Presentational components**, reusable UI pieces. Key patterns:

- **Wizard components**: `Add*Wizard/`, `Edit*Wizard/` - Multi-step forms
- **Table components**: `*Table/` - Data tables
- **Form components**: `*Form/` - Input forms
- **Mobile variants**: `*Mobile/` - Mobile-optimized versions
- **Docket-prefixed**: `Docket*/` - Core UI components (modals, dialogs, inputs)

---

## SideDeck System

The **SideDeck** is Docket's slide-out panel system for displaying forms, details, and wizards.

### Architecture

```
app/
├── components/SideDeck/          # SideDeck UI component
├── containers/App/SideDeck/      # SideDeck content definitions
│   ├── withSideDeck.jsx          # HOC providing sidedeck functions (LARGE FILE)
│   ├── customers.jsx             # Customer-related sidedeck content
│   ├── jobs.jsx                  # Job-related sidedeck content
│   ├── invoices.jsx              # Invoice-related sidedeck content
│   └── ... (domain-specific files)
├── contexts/sideDeck/            # SideDeck React context
└── rtk/slices/sidedeckV2/        # Modern SideDeck state (Redux)
```

### How It Works

1. **Content Pools**: SideDeck has multiple pools (`POOL_MAIN`, `POOL_SECONDARY`, `POOL_AUX`) for layered content
2. **`withSideDeck` HOC**: Wraps components to provide sidedeck functions via props
3. **Push/Pop Pattern**: Content is pushed onto a stack and popped when closed

### Opening SideDeck Content

```jsx
// Push content to sidedeck
props.pushSideDeckContent({
  clazz: EditJobWizard, // Component to render
  width: 600, // Panel width
  icon: "briefcase", // Icon
  title: "Edit Job", // Title
  key: slideoutConstants.EDIT_JOB, // Unique key
  pool: POOL_SECONDARY, // Which pool
  props: (localProps) => ({
    // Props for component
    job: job,
    onSave: () => localProps.closeActiveSideDeckContent(),
  }),
});
```

### SideDeck V2 (Modern)

Uses Redux slice for state management:

```typescript
// app/rtk/slices/sidedeckV2/slice.ts
dispatch(editRecurringRoute({ routeId, teamId }));
dispatch(closeActiveSidedeckContent());
```

---

## Backend (`/functions`)

### Tech Stack

- **Firebase Cloud Functions** (v1 and v2)
- **Express.js** for REST API
- **Firestore** as primary database
- **Firebase Realtime Database** for specific use cases
- **Firebase Storage** for file storage
- **Pub/Sub** for async messaging
- **Node.js 20**

### Structure

```
functions/
├── api/                    # REST API routes
│   └── v1/                 # Versioned API
│       ├── router.v2.js    # Main Express router (v2 functions)
│       ├── privateRouter.js # Authenticated routes
│       ├── publicRouter.js  # Public routes
│       └── [domain]/        # Domain-specific routes
├── db/                     # Firestore triggers
├── http/                   # HTTP-triggered functions
├── Crons/                  # Scheduled functions
├── pubsub/                 # Pub/Sub triggered functions
├── Services/               # Shared services (Firebase init)
├── middleware/             # Express middleware
├── EntityEffectsEngine/    # Entity side-effects system
├── utils/                  # Utility functions
└── index.js                # Function exports
```

### Function Naming Convention

Functions are auto-discovered by file extension:

- `*.f.js` - Cloud Functions v1
- `*.v2.js` - Cloud Functions v2

```javascript
// functions/index.js
exportFunctions({
  searchGlob: "./**/*.{v2,f}.js",
  // ...
});
```

### REST API Structure

The main API router (`functions/api/v1/router.v2.js`) mounts:

- `/api/public/*` and `/public/*` → Public routes
- `/api/*` and `/*` → Authenticated routes

Each domain has its own route file:

```
functions/api/v1/
├── customers/     # Customer endpoints
├── jobs/          # Job endpoints
├── invoices/      # Invoice endpoints
├── tasks/         # Task endpoints
├── employees/     # Employee endpoints
├── billing/       # Billing/payment endpoints
└── ... (etc)
```

### Authentication

The `privateRouter.js` supports three auth methods:

1. **Bearer Token**: Firebase ID token
2. **Basic Auth**: Base64(email:password)
3. **API Key**: `X-API-KEY` + `X-APP-ID` headers

### Firestore Triggers (`functions/db/`)

Triggers for database changes:

```
functions/db/
├── customers/     # Customer document triggers
├── invoices/      # Invoice triggers
├── task/          # Task triggers
├── payments/      # Payment triggers
└── ... (etc)
```

### Cron Jobs (`functions/Crons/`)

Scheduled Cloud Functions for recurring tasks:

- Invoice processing
- Notification sending
- Data sync
- Trial expiration checks

---

## Firebase Configuration

### Frontend Config (`app/firebaseConfig/`)

```
app/firebaseConfig/
├── firebase.js     # Firebase app initialization
├── auth.js         # Auth utilities
├── db.js           # Realtime Database utilities
├── storage.js      # Storage utilities
└── index.js        # Exports
```

### Key Exports

```javascript
import { rsf, db, auth, storage, firestore, fs } from "firebaseConfig";
// rsf = Redux Saga Firebase instance
// db = Realtime Database
// firestore = Firestore (namespaced API)
// fs = Firestore (modular API)
```

### Environment Detection

```javascript
// app/helpers/environment.js
isLocalhost();
isEmulatedEnvironment();
isProduction();
```

---

## DEUCE Component Library

A custom component library in `app/DEUCE_Library/`:

```
DEUCE_Library/
├── theme/         # Color system, spacing, MUI theme
├── components/    # Reusable UI components
├── utils/         # Utility functions
└── index.ts       # Main exports
```

### Component Naming

All DEUCE components are prefixed with `Deuce`:

- `DeuceButton`
- `DeuceInput`
- `DeuceDropDown`
- `DeuceDialog`
- `DeuceMap`
- etc.

### Usage

```tsx
import { DeuceButton, DeuceInput, deuceTheme } from "app/DEUCE_Library";
```

---

## Feature Flags

### Unleash Integration

Located in `app/unleash/`:

```typescript
import { useFlag } from "@unleash/proxy-client-react";
import {
  useWithFeatureFlag,
  FEATURE_FLAGS,
} from "app/utils/featureFlags/featureFlags";

// Usage
const isEnabled = useWithFeatureFlag(FEATURE_FLAGS.SOME_FEATURE);
```

---

## Key Utilities

### Location: `app/utils/`

| Utility                   | Purpose                  |
| ------------------------- | ------------------------ |
| `CommonFunctionsUtils.js` | Shared business logic    |
| `EntityUtils.js`          | Entity manipulation      |
| `SettingsUtils.js`        | Company settings helpers |
| `BillingUtils.js`         | Billing calculations     |
| `TaskUtils.jsx`           | Task-related utilities   |
| `firestore.js`            | Firestore utilities      |
| `injectSaga.jsx`          | Saga injection HOC       |

---

## Routing

### Route Definitions

Located in `app/constants/routes.ts`:

```typescript
export const JOBS = "/jobs";
export const CUSTOMERS = "/customers";
export const INVOICES = "/invoices";
// etc.
```

### Route Configuration

Routes are defined in `app/containers/App/components/RoutesCreator/`:

```jsx
<Route path={routes.JOBS} component={Jobs} />
```

---

## Testing

### Frontend

- **Jest** for unit tests
- **React Testing Library** for component tests
- **Playwright** for E2E tests

### Backend

- **Jest** for unit tests
- Test files co-located with source: `*.test.js`

### Running Tests

```bash
# Frontend tests
yarn test

# E2E tests
yarn playwright test
```

---

## Contexts

React Context providers in `app/contexts/`:

| Context       | Purpose                         |
| ------------- | ------------------------------- |
| `auth/`       | Authentication state            |
| `sideDeck/`   | SideDeck access                 |
| `modal/`      | Modal management                |
| `dateRange/`  | Date range selection            |
| `attention/`  | Attention/notification overlays |
| `support/`    | Support portal                  |
| `refContext/` | DOM references                  |

---

## Common Patterns

### Saga Injection

Containers inject their sagas dynamically:

```jsx
import injectSaga from "utils/injectSaga";
import saga from "./saga";

const withSaga = injectSaga({ key: "jobs", saga });
export default compose(withSaga, connect(mapState, mapDispatch))(Jobs);
```

### Selectors with Reselect

```javascript
import { createSelector } from "reselect";

const selectJobsDomain = (state) => state.jobs;
export const selectJobs = () =>
  createSelector(selectJobsDomain, (jobs) => jobs.items);
```

### Component HOC Composition

```jsx
import { compose } from "recompose";

export default compose(
  withRouter,
  withSideDeck,
  connect(mapStateToProps, mapDispatchToProps),
  injectSaga({ key: "jobs", saga })
)(JobsComponent);
```

---

## Key Files to Know

| File                                           | Purpose                    |
| ---------------------------------------------- | -------------------------- |
| `app/app.jsx`                                  | App entry point            |
| `app/containers/App/index.jsx`                 | Root component             |
| `app/containers/App/SideDeck/withSideDeck.jsx` | SideDeck HOC (very large!) |
| `app/rtk/rtk.js`                               | Redux store                |
| `app/rtk/reducers/rootReducer.js`              | All reducers combined      |
| `app/firebaseConfig/firebase.js`               | Firebase initialization    |
| `functions/index.js`                           | Cloud Functions entry      |
| `functions/api/v1/router.v2.js`                | Main API router            |
| `functions/api/v1/privateRouter.js`            | Auth middleware            |

---

## Environment Variables

### Frontend (Vite)

Prefixed with `VITE_`:

- `VITE_DOCKET_BACKEND_URL` - API base URL
- `VITE_APP_CHECK_DEV_DEBUG_TOKEN` - App Check debug token

### Backend

Located in `functions/.env*` files:

- `.env` - Default
- `.env.local` - Local development
- `.env.docket-dev-237ce` - Staging
- `.env.docket-3257f` - Production

---

## Project IDs

- **Production**: `docket-3257f`
- **Staging/Dev**: `docket-dev-237ce`

---

## Quick Reference: Where to Find Things

| Looking for...        | Location                                                |
| --------------------- | ------------------------------------------------------- |
| Page/view component   | `app/containers/[Name]/`                                |
| Reusable UI component | `app/components/[Name]/`                                |
| API endpoint          | `functions/api/v1/[domain]/`                            |
| Firestore trigger     | `functions/db/[collection]/`                            |
| Scheduled job         | `functions/Crons/`                                      |
| Redux state           | `app/containers/[Name]/reducer.js` or `app/rtk/slices/` |
| API slice (REST)      | `app/rtk/openapi/slices/`                               |
| API slice (Firebase)  | `app/rtk/api/slices/`                                   |
| Routes                | `app/constants/routes.ts`                               |
| Feature flags         | `app/unleash/featureFlags.tsx`                          |
| DEUCE components      | `app/DEUCE_Library/components/`                         |
| Utility functions     | `app/utils/`                                            |
| Firebase config       | `app/firebaseConfig/`                                   |

---

## Tips for AI Agents

1. **SideDeck is complex**: The `withSideDeck.jsx` file is very large (1700+ lines). Use targeted searches.
2. **Dual API pattern**: Check both `rtk/api/` and `rtk/openapi/` for API operations.
3. **Legacy + Modern**: Codebase mixes legacy patterns (sagas, HOCs) with modern (RTK, hooks).
4. **Domain-specific files**: Many features have domain files in `containers/App/SideDeck/` (e.g., `jobs.jsx`, `customers.jsx`).
5. **Firebase is central**: Most data flows through Firestore. Check `firebaseConfig/` for setup.
6. **Check for TypeScript**: Some newer files use `.ts`/`.tsx`, older ones use `.js`/`.jsx`.
