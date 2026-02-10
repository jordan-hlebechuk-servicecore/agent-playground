# Docket Customer Portal Codebase Overview

> **Purpose**: This document provides AI agents with a quick reference to understand the Docket Customer Portal codebase architecture, conventions, and key patterns.

## What is Docket Customer Portal?

The Docket Customer Portal is a **customer-facing web application** for the Docket Field Service Management platform. It allows customers of companies using Docket (primarily in the roll-off dumpster/waste management industry) to view their jobs, invoices, estimates, make payments, submit reviews, and manage their account preferences. The portal is accessed via a unique customer URL (e.g., `https://client.yourdocket.com/{customerId}`) and is built with React, Redux, and Firebase.

This is a **separate repository** from the main Docket application (`docket`). It shares the same Firebase backend (Firestore, Auth, Storage) but is deployed independently to Firebase Hosting under the `docket-client` hosting target.

---

## Repository Structure

```
docket-customer-portal/
├── app/                    # Frontend React application
│   ├── components/         # Presentational/reusable UI components
│   ├── containers/         # Smart (Redux-connected) page components
│   ├── constants/          # Route, API, payment, and feature flag constants
│   ├── firebaseConfig/     # Firebase initialization and utilities
│   ├── helpers/            # Authentication helpers
│   ├── schemas/            # Form validation schemas (Zod-based)
│   ├── utils/              # Shared utility functions
│   ├── images/             # Static images and icons
│   ├── tests/              # Global test utilities
│   ├── translations/       # i18n translation files
│   ├── app.js              # Application entry point
│   ├── configureStore.js   # Redux store configuration
│   ├── reducers.js         # Root reducer combiner
│   ├── global-styles.js    # Global CSS styles
│   └── i18n.js             # Internationalization setup
├── functions/              # Firebase Cloud Functions (service account configs only)
├── server/                 # Local Express dev server (HTTPS)
├── internals/              # Build tooling (Webpack, generators, deploy scripts)
├── docs/                   # Documentation
└── [config files]          # Firebase, ESLint, Prettier, Jest, Bitbucket Pipelines
```

---

## Frontend (`/app`)

### Tech Stack

- **React 16** with JSX (class components and functional components)
- **Redux** with **Immutable.js** for state management
- **Redux-Saga** for side effects
- **Firebase SDK 10** (compat mode) for Firestore, Auth, Realtime Database, Storage
- **Redux-Saga-Firebase** for saga-based Firebase operations
- **Semantic UI React** for UI components
- **Webpack 4** as build tool (with Babel 6/7)
- **Styled Components** for some styling
- **CSS Modules** (`*.css` files imported per component)
- **React Router v5** for navigation
- **Immutable.js** for Redux state immutability
- **Axios** for HTTP API calls
- **Leaflet / React-Leaflet** for maps
- **Unleash** for feature flags
- **Bugsnag** for error tracking
- **Zod** for schema validation
- **React Hook Form** for form management (newer code)

### Entry Point

- **`app/app.js`**: Main entry point — sets up Redux store, Unleash feature flags, routing, and renders the app with `ReactDOM.render`.

---

## State Management

### Redux Store Configuration

Located in `app/configureStore.js`:

- Creates store with `redux-saga` middleware and `connected-react-router` middleware
- Uses `Immutable.js` (`fromJS`) for initial state
- Supports dynamic reducer/saga injection via `store.injectedReducers` and `store.injectedSagas`

### Root Reducer

Located in `app/reducers.js`:

```javascript
export default function createReducer(injectedReducers = {}) {
  return combineReducers({
    global: globalReducer, // App-level state
    router: connectRouter(history),
    ...injectedReducers, // Dynamically injected container reducers
  });
}
```

### State Management Pattern (Ducks Pattern)

Every container follows the same structure:

```
containers/[Name]/
├── index.js           # Main component (connected to Redux)
├── actions.js         # Action creators
├── constants.js       # Action type constants
├── reducer.js         # Redux reducer (uses Immutable.js)
├── saga.js            # Redux-Saga side effects
├── selectors.js       # Reselect memoized selectors
├── Loadable.js        # Code-splitting wrapper (react-loadable)
├── messages.js        # i18n messages (optional)
└── styles.css         # Component-specific CSS
```

**Important**: Reducers use **Immutable.js** — state is stored as Immutable Maps, and selectors call `.toJS()` to convert back to plain objects.

---

## Containers (Pages)

### Container Overview

| Container        | Route                               | Purpose                                                                                              |
| ---------------- | ----------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `App/`           | Root wrapper                        | Root component with routing, navbar, loading screen, anonymous auth                                  |
| `Dashboard/`     | `/:customerId`                      | **Main customer dashboard** — views jobs, invoices, estimates, dumpster tasks, event tasks, payments |
| `Application/`   | `/docs/:docId`                      | Document/application viewer (Docket Docs) with form submission                                       |
| `FindDashboard/` | `/findDashboard/:teamId`            | Lookup page where customers find their dashboard via email + PIN                                     |
| `CompanyReview/` | `/review/:teamId`                   | Company review/rating submission page                                                                |
| `Review/`        | `/:customerId/review`               | Customer-specific review landing                                                                     |
| `OnOurWayMap/`   | `/onOurWayMap/:taskId`              | Real-time map showing driver/technician en route                                                     |
| `Preferences/`   | `/:customerId/preferences`          | Customer notification preferences (email/text opt-in)                                                |
| `Document/`      | `/:customerId/document/:documentId` | Document viewer                                                                                      |
| `JobDash/`       | (sub-component)                     | Job detail dashboard                                                                                 |
| `Job/`           | (state only)                        | Job-related Redux state (no index.js — used by Dashboard)                                            |
| `Employees/`     | (state only)                        | Employee-related Redux state                                                                         |
| `NotFoundPage/`  | Fallback                            | 404 page                                                                                             |

### Key Route Pattern

The portal is **always accessed in the context of a customer** via their Firestore document ID in the URL:

```
https://client.yourdocket.com/{customerId}
https://client.yourdocket.com/{customerId}/review
https://client.yourdocket.com/{customerId}/preferences
https://client.yourdocket.com/{customerId}/i/{invoiceId}   # Deep-link to invoice
https://client.yourdocket.com/{customerId}/e/{estimateId}  # Deep-link to estimate
https://client.yourdocket.com/{customerId}/j/{jobId}       # Deep-link to job
```

---

## Dashboard Container (Core Feature)

The `Dashboard` container (`app/containers/Dashboard/`) is the **largest and most important** component. It is the main customer experience.

### What it displays (via tabbed tile groups):

- **Invoices** — With pagination, status filtering, payment capabilities
- **Estimates** — Estimate viewing and approval
- **Jobs** — Job history grouped by active/future/unscheduled
- **Dumpster Tasks** — Dumpster-specific task tracking (pickup requests, exchanges)
- **Event Tasks** — Scheduled event tracking

### Data Loading Flow

The Dashboard saga (`Dashboard/saga.js`) orchestrates data loading on mount:

1. Extracts `customerId` from URL
2. Fetches customer document from Firestore (`customers/{customerId}`)
3. Loads company/team data (`teams/{teamId}`)
4. Loads payment gateway config (`ccGatewayPublic/{teamId}`)
5. Sets up real-time listeners for invoices, estimates, jobs, tasks
6. Reports loading progress via `updateAppLoadingPercentage`

### Real-Time Data Sync

The Dashboard uses Firestore `onSnapshot` listeners via `eventChannel` for real-time updates:

- `syncInvoices` — Listens for unpaid, paid, and overpaid invoice changes
- `syncEstimates`, `syncJobs`, `syncDumpsterTasks`, `syncEventTasks` — Count listeners
- Paginated data loading with `startAfter`/`endBefore` cursors

---

## Components (`app/components/`)

### Component Categories

**Payment Components:**

- `AddPaymentWizard/` — Multi-step payment wizard
- `AddCardOnFileWizard/` — Save card on file
- `AddAchOnFileWizard/` — Save ACH bank account on file
- `PaymentForm/` — Payment input form
- `PaymentTable/`, `PaymentMobile/` — Payment display

**Invoice/Estimate Components:**

- `Invoice/` — Invoice detail view
- `InvoiceTable/`, `InvoiceTiles/`, `InvoicesMobile/` — Invoice list views
- `Estimate/` — Estimate detail view
- `EstimateTable/`, `EstimateMobile/` — Estimate list views
- `EditInvoicePropertiesWizard/` — Invoice editing

**Job Components:**

- `JobTable/`, `JobTiles/`, `JobsMobile/` — Job list views
- `JobActionCard/` — Job quick-action card
- `JobBilling/` — Job billing details
- `JobMap/` — Job location map
- `JobStatus/` — Job status indicator
- `JobTimecard/` — Job timecard display
- `TasksMobile/` — Task list mobile view

**Customer Components:**

- `EditCustomerWizard/` — Customer info editing
- `ContactInfo/`, `ContactInfoForm/` — Contact information display/edit
- `AddressCard/`, `AddressForm/`, `Address/` — Address display/edit

**Ordering:**

- `OrderDumpsterWizard/` — Dumpster ordering flow

**Common/Layout:**

- `Navbar/` — Top navigation bar (company branded)
- `DocketSidebar/` — Side panel
- `Header/`, `Footer/` — Page header/footer
- `DocketConfirm/` — Confirmation dialog
- `DocketBusyDialog/` — Loading/busy overlay
- `DocketPIN/` — PIN entry component
- `DocketFileViewer/` — File preview viewer
- `DocketMap/` — Leaflet map component
- `DocketActionsMenu/` — Action dropdown menu
- `ReviewLanding/` — Review submission page
- `RichTextEditor/` — Rich text editing
- `ErrorBoundary/` — React error boundary
- `LoadingIndicator/` — Loading spinner

**Flex Component Library (Custom):**
Located in `app/components/common/`, prefixed with `Flex`:

- `FlexBox` — Flexbox layout container
- `FlexButton` — Styled button
- `FlexCard` — Card component
- `FlexDialog` — Dialog/modal
- `FlexDoc` — Document renderer
- `FlexDropdown` — Dropdown select
- `FlexForm`, `FlexFormField` — Form components
- `FlexIcon` — Icon wrapper
- `FlexInput` — Text input
- `FlexLabel` — Text label
- `FlexList` — List component
- `FlexLoader` — Loading indicator
- `FlexNavigator` — Navigation component
- `FlexNotice` — Notice/alert
- `FlexPageNavigator` — Pagination
- `FlexPopup` — Popup/tooltip
- `FlexSearch` — Search input
- `FlexSwitcher` — Tab/toggle switcher
- `FlexTable` — Data table
- `NumberInput`, `PriceInput` — Numeric inputs
- `SignatureCaptureModal` — Signature pad
- `DragDropOverlay`, `Draggable`, `Droppable` — Drag and drop

---

## Authentication

### Authentication Flow

The portal supports two authentication methods:

1. **PIN-based Authentication** (Legacy): Customers access their dashboard via `FindDashboard` by entering their email + 4-digit PIN, which calls `/httpApiFindDashboard` to validate and redirect.

2. **Anonymous Authentication with Custom Token** (Modern): Controlled by the `ANONYMOUS_AUTHENTICATION` feature flag. The flow:
   - App detects a `customerId` in the URL
   - Calls `doAnonymousLoginWithCustomerId(customerId)` in the App saga
   - `fetchDocketToken` sends a POST to the Docket backend (`/v1/auth/docket-token`) with `X-cid` and `X-role` headers
   - Receives a Firebase custom JWT token
   - Signs into Firebase with `signInWithCustomToken(token)`
   - Token auto-refreshes every 55 minutes via `tokenExpiryWatcher` saga

### Firebase Auth Utilities

Located in `app/firebaseConfig/auth.js`:

- Standard email/password auth functions
- `doSignInWithCustomToken` — Custom token login
- `doAnonymousLoginWithCustomerId` — Combined token fetch + Firebase sign-in

---

## Payment System

### Supported Payment Gateways

Defined in `app/constants/payments.js`:

- **Payrix** — Primary gateway (dynamically loads PayFields script)
- **Card Connect** — Legacy gateway
- **Stripe** — Alternative gateway
- **Authorize.net** — Alternative gateway

### Payment Types

- **Credit/Debit Card** — Via `AddCardOnFileWizard` and `AddPaymentWizard`
- **ACH (Bank Transfer)** — Via `AddAchOnFileWizard` with account types: personal/business checking/savings

### Payment Gateway Loading

The App saga loads the payment gateway config from Firestore (`ccGatewayPublic/{teamId}`) and dynamically injects the appropriate payment processor's JavaScript SDK into the page `<head>`.

---

## Firebase Configuration

### Firebase Setup (`app/firebaseConfig/`)

```
app/firebaseConfig/
├── firebase.js     # Firebase app initialization, emulator config, App Check
├── auth.js         # Auth utilities (sign in, sign out, custom token)
├── db.js           # Realtime Database utilities
├── storage.js      # Storage utilities
└── index.js        # Re-exports
```

### Key Exports

```javascript
import {
  rsf,
  db,
  auth,
  storage,
  firestore,
  firebase,
  appCheck,
} from "firebaseConfig";
// rsf = Redux Saga Firebase instance (for saga-based Firestore/DB operations)
// db = Firebase Realtime Database
// auth = Firebase Auth
// storage = Firebase Storage
// firestore = Firestore instance (compat API)
// appCheck = Firebase App Check (reCAPTCHA Enterprise)
```

### Environment Detection

```javascript
const isProduction = window.location.hostname === "client.yourdocket.com";
```

- **Production**: `client.yourdocket.com` → Firebase project `docket-3257f`
- **Staging**: `client.docket.works` → Firebase project `docket-dev-237ce`
- **Local**: `localhost:4443` → Configurable (dev by default, can point to prod)

### Firebase Emulator Support

Enabled via `WITH_EMULATED_FIREBASE=true` environment variable:

- Auth: port 9099
- Realtime Database: port 9000
- Firestore: port 8080
- Functions: port 5001
- Storage: port 9199

---

## API Communication

### API Configuration (`app/constants/api.js`)

```javascript
// Base URL switches based on hostname
switch (window.location.hostname) {
  case "client.yourdocket.com":
    BASE_URL = "https://app.yourdocket.com"; // Main Docket app
    DOCKET_BACKEND_ROOT = DOCKET_BACKEND_ROOT_PROD; // Production Cloud Functions
    break;
  case "client.docket.works":
    BASE_URL = "https://app.docket.works"; // Staging Docket app
    break;
  case "localhost":
    BASE_URL = "https://app.docket.works"; // Default to staging
    break;
}
```

### API Calls

- **Axios instance** (`API`): Used for direct HTTP calls to the main Docket backend (e.g., `httpApiFindDashboard`)
- **Firestore direct access**: Most data is read directly from Firestore via `rsf.firestore` (Redux Saga Firebase)
- **Docket Backend**: Token auth endpoint at `/v1/auth/docket-token`

---

## Feature Flags

### Unleash Integration

Configured in `app/app.js` and `app/utils/unleashClient.js`:

```javascript
import { isFeatureEnabled } from "utils/unleashClient";
import { FeatureFlags } from "constants/feature-flags";

const isEnabled = isFeatureEnabled(FeatureFlags.ANONYMOUS_AUTHENTICATION);
```

### Current Feature Flags

Defined in `app/constants/feature-flags.js`:
| Flag | Purpose |
|------|---------|
| `DOC-3954-client-dashboard-ach` | ACH payment support in client dashboard |
| `Docket_client-portal_DOC-2964` | Card Connect payment method management |
| `Docket_web-app_DOC-5153` | Anonymous authentication |

---

## Theming

### ThemeController

Located in `app/components/common/theme/`:

- Dynamically applies company branding (colors, logo) from the company's Firestore data
- Uses CSS custom properties (e.g., `--primary-color`)
- Accessed globally via `window.themeController`
- Updated when company data loads: `window.themeController.update(company)`

---

## Key Utilities

### Location: `app/utils/`

| Utility                    | Purpose                                                         |
| -------------------------- | --------------------------------------------------------------- |
| `CommonFunctionsUtils.js`  | Shared business logic (map-to-array conversion, image resize)   |
| `EntityUtils.js`           | Entity manipulation, search matching, feature config extraction |
| `SettingsUtils.js`         | Company settings helpers (colors, branding)                     |
| `BillingUtils.js`          | Billing/payment calculations                                    |
| `PaymentUtils.js`          | Payment processing utilities                                    |
| `PinStorageUtils.js`       | PIN session storage management                                  |
| `ColorUtils.js`            | Color manipulation                                              |
| `TimeUtils.js`             | Time/date formatting                                            |
| `StateUtils.js`            | Redux state utilities                                           |
| `CDN.js`                   | CDN URL helpers                                                 |
| `firestore.js`             | Firestore document transform utilities                          |
| `unleashClient.js`         | Unleash feature flag client wrapper                             |
| `injectSaga.js`            | Dynamic saga injection HOC                                      |
| `injectReducer.js`         | Dynamic reducer injection HOC                                   |
| `tablesort.js`             | Table sorting utilities                                         |
| `recurringJobScheduler.js` | Recurring job schedule calculations                             |
| `history.js`               | Browser history instance                                        |

### Sub-directories

- `utils/ach/` — ACH-specific utilities
- `utils/hereApi/` — HERE Maps API integration

---

## Dev Server (`/server`)

An Express.js HTTPS dev server:

- Runs on port defined by `APP_DEV_PORT` environment variable (default: 4443)
- Uses self-signed SSL certificates (`localhost.key`, `localhost.cert`)
- Webpack dev middleware for hot reloading
- Access at `https://localhost:4443/{customerId}`

---

## Build & Deployment

### Build Tool

**Webpack 4** with Babel, configured in `internals/webpack/`:

- `webpack.base.babel.js` — Shared config
- `webpack.dev.babel.js` — Development build (used for staging)
- `webpack.prod.babel.js` — Production build
- `webpack.dll.babel.js` — DLL plugin for faster builds

### Build Commands

```bash
yarn start                # Start dev server (HTTPS, port 4443)
yarn run build-staging    # Build for staging
yarn run build-prod       # Build for production
yarn test                 # Run Jest tests
```

### Deployment (Bitbucket Pipelines)

Defined in `bitbucket-pipelines.yml`:

- **Staging**: Pushes to `master` → builds staging → deploys to Firebase Hosting (`docket-client-dev`)
- **Production**: Manual trigger via `deployProduction` custom pipeline → builds production → deploys to Firebase Hosting (`docket-client`)
- Uses `atlassian/firebase-deploy` pipe for Firebase deployment

### Firebase Hosting

Configured in `firebase.json`:

- SPA rewrite: All routes → `/index.html`
- Cache control: No-cache for HTML/SW files, immutable for static assets
- Hosting target: `client` (maps to `docket-client` or `docket-client-dev`)

---

## Testing

### Framework

- **Jest 29** for unit/component tests
- **React Testing Library** (preferred) and legacy Enzyme (avoid)
- **Babel 7** for test transpilation (separate from prod Babel 6)
- Test files co-located in `containers/[Name]/tests/` directories

### Running Tests

```bash
yarn test           # Run all tests
yarn test:watch     # Watch mode
yarn test:coverage  # Coverage report
```

---

## Common Patterns

### Container HOC Composition

```jsx
import { compose } from "recompose";
import injectSaga from "utils/injectSaga";
import injectReducer from "utils/injectReducer";

export default compose(
  injectReducer({ key: "dashboard", reducer }),
  injectSaga({ key: "dashboard", saga }),
  withRouter,
  connect(mapStateToProps, mapDispatchToProps)
)(Dashboard);
```

### Selectors with Immutable.js

```javascript
const selectDashboardDomain = (state) => state.dashboard || initialState;
const makeSelectDashboard = () =>
  createSelector(selectDashboardDomain, (substate) => substate.toJS());
```

### Firestore Operations via Redux-Saga-Firebase

```javascript
// Read a document
const snapshot = yield call(rsf.firestore.getDocument, `customers/${id}`);
const data = snapshot.data();

// Real-time sync
yield fork(rsf.firestore.syncDocument, `teams/${teamId}`, {
  successActionCreator: actions.loadCompany,
  transform: firestoreUtils.documentTransform,
});

// Write a document
yield call(rsf.firestore.setDocument, `tasks/${id}`, data);
```

### Firestore Modular API (Newer Code)

```javascript
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  onSnapshot,
} from "@firebase/firestore";

const queryRef = query(
  collection(firestore, "invoices"),
  where("customerId", "==", customerId),
  where("active", "==", true),
  orderBy("createdOn", "desc")
);
```

### Code Splitting

```javascript
// containers/Dashboard/Loadable.js
import Loadable from "react-loadable";
import LoadingIndicator from "components/LoadingIndicator";

export default Loadable({
  loader: () => import("./index"),
  loading: LoadingIndicator,
});
```

---

## Key Files to Know

| File                                    | Purpose                                        |
| --------------------------------------- | ---------------------------------------------- |
| `app/app.js`                            | App entry point, Unleash setup, Redux Provider |
| `app/configureStore.js`                 | Redux store creation with saga middleware      |
| `app/reducers.js`                       | Root reducer with dynamic injection            |
| `app/containers/App/index.js`           | Root component with routing and auth           |
| `app/containers/App/saga.js`            | App-level sagas (auth, gateway loading)        |
| `app/containers/Dashboard/index.js`     | **Main dashboard (very large!)**               |
| `app/containers/Dashboard/saga.js`      | Dashboard data loading and real-time sync      |
| `app/containers/Dashboard/selectors.js` | Dashboard state selectors                      |
| `app/firebaseConfig/firebase.js`        | Firebase initialization, emulators, App Check  |
| `app/firebaseConfig/auth.js`            | Auth utilities including anonymous login       |
| `app/helpers/tokenAuth.js`              | Docket backend token fetching                  |
| `app/constants/api.js`                  | API base URL and Axios instance                |
| `app/constants/feature-flags.js`        | Feature flag definitions                       |
| `app/constants/payments.js`             | Payment type constants                         |
| `app/utils/unleashClient.js`            | Feature flag client utility                    |
| `app/utils/firestore.js`                | Firestore document transformation helpers      |
| `app/components/common/index.js`        | Flex component library exports                 |
| `server/index.js`                       | HTTPS dev server                               |
| `internals/webpack/`                    | Webpack build configuration                    |
| `bitbucket-pipelines.yml`               | CI/CD pipeline configuration                   |

---

## Project IDs

- **Production**: `docket-3257f` (hosting: `docket-client`, domain: `client.yourdocket.com`)
- **Staging/Dev**: `docket-dev-237ce` (hosting: `docket-client-dev`, domain: `client.docket.works`)

---

## Environment Variables

Set in `.env` (copied from `.env.dist`):

- `APP_DEV_PORT` — Local dev server port
- `WITH_EMULATED_FIREBASE` — Enable Firebase emulators (`true`/`false`)
- `APP_CHECK_DEBUG_TOKEN` — Firebase App Check debug token
- `FIREBASE_ENV` — Environment (`production` or not)
- `UNLEASH_HTTP_ENDPOINT` — Unleash proxy URL
- `UNLEASH_CLIENT_KEY` — Unleash client API key

---

## Quick Reference: Where to Find Things

| Looking for...          | Location                                                        |
| ----------------------- | --------------------------------------------------------------- |
| Page/view component     | `app/containers/[Name]/`                                        |
| Reusable UI component   | `app/components/[Name]/`                                        |
| Flex component library  | `app/components/common/`                                        |
| Redux state for a page  | `app/containers/[Name]/reducer.js`                              |
| Data loading logic      | `app/containers/[Name]/saga.js`                                 |
| State selectors         | `app/containers/[Name]/selectors.js`                            |
| Firebase initialization | `app/firebaseConfig/firebase.js`                                |
| Auth utilities          | `app/firebaseConfig/auth.js` + `app/helpers/tokenAuth.js`       |
| API configuration       | `app/constants/api.js`                                          |
| Routes                  | `app/containers/App/index.js` (inline Switch)                   |
| Route constants         | `app/constants/routes.js`                                       |
| Feature flags           | `app/constants/feature-flags.js` + `app/utils/unleashClient.js` |
| Payment constants       | `app/constants/payments.js` + `app/constants/ach.js`            |
| Utility functions       | `app/utils/`                                                    |
| Webpack config          | `internals/webpack/`                                            |
| Deploy scripts          | `internals/deploy/`                                             |
| CI/CD pipeline          | `bitbucket-pipelines.yml`                                       |
| Test files              | `app/containers/[Name]/tests/`                                  |

---

## Tips for AI Agents

1. **Dashboard is huge**: `app/containers/Dashboard/index.js` is 2000+ lines. Use targeted searches rather than reading the whole file.
2. **Immutable.js everywhere**: Redux state uses `fromJS()` and selectors use `.toJS()`. Never forget this when reading/writing reducers.
3. **Two Firestore APIs**: The codebase mixes Firestore compat API (`rsf.firestore.*`) with the modular API (`collection`, `query`, `where`, etc.). Newer code prefers the modular API.
4. **Customer-centric URL**: Every dashboard route starts with `/:customerId`. The customer ID is a Firestore document ID extracted from the URL path.
5. **No backend in this repo**: The `functions/` directory only contains service account JSON files. All Cloud Functions are in the main `docket` repository.
6. **Class + Functional components**: Older containers (Dashboard, App, FindDashboard) use class components. Newer ones (Application, Review, Preferences) use functional components with hooks.
7. **Dynamic injection**: Reducers and sagas are injected at runtime via `injectReducer` and `injectSaga` HOCs, not statically registered.
8. **Payment gateway is dynamic**: The payment processor SDK (Payrix, etc.) is loaded at runtime based on the company's Firestore config.
9. **Theming is per-company**: Colors and branding come from the company's Firestore document and are applied via `ThemeController`.
10. **Feature flags gate features**: Check `feature-flags.js` and `unleashClient.js` before assuming a feature is always active.
