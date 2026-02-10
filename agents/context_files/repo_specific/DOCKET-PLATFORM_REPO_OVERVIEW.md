# Docket Platform Codebase Overview

> **Purpose**: This document provides AI agents with a quick reference to understand the Docket Platform monorepo architecture, conventions, and key patterns.

## What is Docket Platform?

Docket Platform is a **Turborepo-based monorepo** for the Docket Field Service Management system, serving the roll-off dumpster and waste management industry. It contains multiple applications and shared packages, with `docket-backend` as the primary application under active development. The platform runs on Google Cloud Platform with Firebase, PostgreSQL, and Elasticsearch as its data stores.

---

## Repository Structure

```
docket-platform/
├── apps/                       # Applications
│   ├── docket-backend/         # ⭐ Primary backend API (Express + PostgreSQL)
│   ├── docket-api/             # Legacy/secondary API (Express + Firestore)
│   ├── docket-cli/             # CLI tooling for Firestore operations
│   ├── docket-salesdemo/       # Sales demo data regeneration scripts
│   └── web/                    # Firebase hosting config and rules
├── packages/                   # Shared libraries
│   ├── docket-data/            # Shared Firestore schema definitions (Zod + Typesaurus)
│   ├── config-eslint/          # Shared ESLint configuration
│   ├── config-jest/            # Shared Jest configuration
│   ├── config-prettier/        # Shared Prettier configuration
│   ├── config-typescript/      # Shared TypeScript configuration
│   └── decisions/              # Architecture Decision Records (ADRs)
├── docs/                       # Documentation, AI prompts, data model docs
├── scripts/                    # Build/deploy utilities and scaffolding generators
├── .bitbucket/                 # Bitbucket CI config, CODEOWNERS, team definitions
└── [config files]              # Turbo, Docker, Jest, Prettier, Husky, etc.
```

---

## Root-Level Folders (Brief)

### `apps/`

Contains all deployable applications. See detailed breakdowns below.

### `packages/`

Shared internal packages consumed by apps via npm workspaces.

- **`docket-data/`** — Shared Firestore collection schemas using Zod and Typesaurus. Provides validated types for collections like customers, teams, vehicles, notifications, API keys, etc.
- **`config-eslint/`** — Shared ESLint configuration preset.
- **`config-jest/`** — Shared Jest configuration preset (e.g., `@docket/config-jest/node`).
- **`config-prettier/`** — Shared Prettier configuration.
- **`config-typescript/`** — Shared TypeScript configuration.
- **`decisions/`** — Architecture Decision Records documenting key technical decisions.

### `docs/`

Project documentation including AI prompts, data model documentation, and setup guides (`SETUP.md`).

### `scripts/`

Build and utility scripts:

- `generate-cloud-function/` — Scaffolding generator for new Cloud Functions.
- `salesdemo/` — Sales demo environment scripts.
- `install-dependencies.sh` — Dependency installation helper.
- `update-versions.js` — Semantic release version updater.
- `zip-apps-for-deployment.js` — CI/CD deployment packaging.

### `.bitbucket/`

CI/CD configuration for Bitbucket Pipelines, CODEOWNERS file, and team definitions.

---

## Apps Overview (Non-Backend)

### `docket-api/`

A **secondary Express.js API** deployed on GCP via Cloud Functions Framework. Handles service requests, contractor endpoints, auth, and status checks. Uses Firestore as its data store. Structured similarly to `docket-backend` but focused on a smaller set of concerns (service requests, contractors, docs).

### `docket-cli/`

A **CLI tool** (`@docket/docket-cli`) built with Commander.js and tsup. Used for Firestore data operations — listing collections, exporting/importing data to/from local emulators, and preparing data imports.

### `docket-salesdemo/`

A **data regeneration tool** for creating demo environments. Uses Faker.js to generate realistic sales demo data in Firestore for product demos and testing.

### `web/`

**Firebase hosting configuration** — contains Firebase rules (Firestore, Storage, Realtime Database), hosting config, and a minimal Cloud Function entry point. This is the deployment wrapper for the Docket web application.

---

## `docket-backend/` — Full Deep Dive

### What It Is

`docket-backend` is the **primary backend API service** for Docket. It is an Express.js application deployed on Google Cloud Run via the Cloud Functions Framework. It manages the core business logic for field service management including stops, manifests, recurring routes, invoicing, dispatching, customers, employees, vehicles, ACH payments, and more.

### Tech Stack

- **TypeScript** with strict compilation
- **Express.js** for REST API routing
- **PostgreSQL 16** as the primary relational database
- **Drizzle ORM** for database schema, migrations, and queries
- **Firestore** for legacy/shared data (teams, users, members)
- **Elasticsearch** for search indexing
- **Meilisearch** for newer search features
- **Firebase Admin SDK** for authentication and App Check
- **Zod** for request/response validation
- **zod-openapi** for OpenAPI spec generation
- **Google Cloud Pub/Sub** for async messaging
- **Google Cloud Document AI** for weight ticket parsing
- **Jest** for testing
- **Terraform** for GCP infrastructure-as-code

### Entry Point

The main application entry is [`src/app.ts`](apps/docket-backend/src/app.ts):

```typescript
const app = express();

app.use(corsMiddleware);
app.use(formDataMiddleware);
app.use(contextMiddleware);

// Public routes
app.use(ROUTES.HEALTH_CHECK, healthCheckRoutes);
app.use(ROUTES.AUTH, loggingMiddleware({...}), authRoutes);

// Authenticated routes
app.use(ROUTES.TEAMS, teamRouters);           // Team-scoped endpoints
app.use(ROUTES.VEHICLES, authenticate, vehiclesRoutes);
app.use(ROUTES.RECURRING_ROUTES_BASE, authenticate, recurringRoutesRoutes);
// ... etc
```

All routes are prefixed with `/v1` via the `BASE_URL` constant.

### Directory Structure

```
apps/docket-backend/
├── src/
│   ├── app.ts                  # Express app entry point
│   ├── routes/                 # HTTP route handlers
│   ├── domain/                 # Business logic layer
│   ├── data-store/             # Data access abstractions
│   ├── db/                     # Drizzle ORM schema, migrations, seeds
│   ├── middleware/             # Express middleware
│   ├── services/               # Shared services and integrations
│   ├── schemas/                # Zod schemas and OpenAPI models
│   ├── functions/              # Cloud Functions (scheduled jobs)
│   ├── constants/              # App constants and enums
│   ├── shared/                 # Shared enums
│   ├── types/                  # TypeScript type definitions
│   ├── utils/                  # Utility functions
│   └── __tests__/              # Top-level integration tests
├── terraform/                  # GCP infrastructure (Cloud Run, Pub/Sub, etc.)
├── migrations-runner/          # Database migration runner
├── scripts/                    # DB init, seeding, doc generation
├── docs/                       # Bruno API collections, generated docs
├── types/                      # Additional type definitions
├── drizzle.config.ts           # Drizzle ORM configuration
├── jest.config.js              # Jest test configuration
└── nodemon.json                # Nodemon dev server configuration
```

---

### Architecture Layers

#### 1. Routes (`src/routes/`)

HTTP route handlers organized by domain. Each route folder contains endpoint definitions and tests.

| Route                   | Purpose                                                            |
| ----------------------- | ------------------------------------------------------------------ |
| `ach/`                  | ACH payment processing (payments, refunds, credits, bulk, polling) |
| `activities/`           | Activity management                                                |
| `activity-configs/`     | Activity configuration templates                                   |
| `adjustment-types/`     | C&R adjustment type definitions                                    |
| `adjustments/`          | Stop/invoice adjustments                                           |
| `attachments/`          | File attachment management                                         |
| `auth/`                 | Authentication endpoints                                           |
| `billing/`              | Billing operations                                                 |
| `container-types/`      | Container type management                                          |
| `contractors/`          | Contractor management                                              |
| `customers/`            | Customer CRUD                                                      |
| `dispatch/`             | Dispatch operations                                                |
| `employees/`            | Employee management                                                |
| `generator/`            | Cron job / scheduled task endpoints                                |
| `health-check/`         | Health check endpoint                                              |
| `importer/`             | Data import (CSV/bulk)                                             |
| `invoices/`             | Invoice management                                                 |
| `manifests/`            | Daily manifest generation and management                           |
| `material-types/`       | Material type management                                           |
| `notes/`                | Notes/comments system                                              |
| `payment-methods/`      | Payment method management                                          |
| `pricing-matrix/`       | Pricing matrix configuration                                       |
| `pubsub/`               | Pub/Sub message handlers                                           |
| `recurring-invoices/`   | Recurring invoice management                                       |
| `recurring-locations/`  | Recurring location management                                      |
| `recurring-routes/`     | Recurring route management                                         |
| `recurring-stops/`      | Recurring stop management                                          |
| `route-tracker/`        | Route tracking                                                     |
| `stops/`                | Stop CRUD and management                                           |
| `teams/`                | Team-scoped sub-router (nests most domain routes)                  |
| `vehicles/`             | Vehicle management                                                 |
| `webhooks/`             | Custom webhook endpoints                                           |
| `weight-ticket-parser/` | Weight ticket OCR via Document AI                                  |

**Team-Scoped Routing Pattern**: Most domain routes are nested under `/v1/teams/:teamId/` via the `teams/` router, which applies authentication and team context middleware before delegating to domain-specific sub-routers.

#### 2. Domain (`src/domain/`)

Contains **business logic** separated from HTTP concerns. Each domain module typically includes:

- Entity service (CRUD operations, business rules)
- Mappers (data transformation)
- Interfaces (contracts)

Key domain modules:

| Module                            | Purpose                                |
| --------------------------------- | -------------------------------------- |
| `orchestrators/`                  | Complex multi-step business operations |
| `orchestrators/route-generation/` | Daily manifest/route generation logic  |
| `orchestrators/pricing/`          | Pricing calculation logic              |
| `orchestrators/stops/`            | Stop lifecycle orchestration           |
| `orchestrators/manifests/`        | Manifest operations                    |
| `orchestrators/recurring-routes/` | Recurring route processing             |
| `activities/`                     | Activity business logic                |
| `customers/`                      | Customer business logic                |
| `invoices/`                       | Invoice business logic                 |
| `recurring-routes/`               | Recurring route business logic         |
| `recurring-stops/`                | Recurring stop business logic          |
| `stops/`                          | Stop business logic                    |
| `manifests/`                      | Manifest business logic                |
| `shared/`                         | Shared domain utilities                |
| `interfaces/`                     | Base entity and service interfaces     |

#### 3. Data Store (`src/data-store/`)

**Repository pattern** abstractions for each data backend:

```
data-store/
├── postgres/           # Drizzle ORM repository base class
│   ├── postgres.repository.ts           # Generic Postgres repository
│   ├── postgres.repository.interface.ts # Repository interface
│   ├── fulltext-search.service.ts       # Full-text search via PG views
│   ├── field-mapper.interface.ts        # Field mapping interface
│   └── view-search.config.ts            # Search view configuration
├── firestore/          # Firestore repository abstractions
│   ├── firestore.repository.interface.ts
│   ├── firestore.interface.ts
│   └── pricing-matrix.service.ts
└── elasticsearch/      # Elasticsearch repository abstractions
    ├── elasticsearch.repository.interface.ts
    ├── elastic-search.interface.ts
    └── docket-field-mapper.ts
```

#### 4. Database (`src/db/`)

**Drizzle ORM** database layer for PostgreSQL:

```
db/
├── tables/             # Drizzle table definitions (schema + relations)
├── views/              # PostgreSQL views for search
├── migrations/         # Generated SQL migrations
├── seeds/              # Seed data
├── connection/         # Database connection configuration
├── helpers/            # Query helpers
├── shared/             # Shared enums (occurrence types, activity types, etc.)
├── scripts/            # DB management scripts (drop, create app user)
├── schema.ts           # Unified schema export
├── index.ts            # DB client export
└── seed.ts             # Seed runner
```

**Key Tables**:

- `teams` — Multi-tenant team/company entities
- `customers` — Customer records
- `employees` — Employee records
- `vehicles` — Vehicle/equipment tracking
- `stops` — Individual service stops
- `manifests` — Daily route manifests (manifest ↔ stops join)
- `invoices` — Invoices with line items
- `activities` — Activity records with configs
- `recurring_routes` — Recurring route templates
- `recurring_stops` — Recurring stop templates
- `recurring_invoices` — Recurring invoice templates
- `adjustment_types` / `adjustments` — C&R adjustment system
- `container_types` / `material_types` — Type configuration
- `locations` — Address/location records
- `notes` — Polymorphic notes system

**Database Views** (used for full-text search):

- `stops_search` — Searchable stop data
- `recurring_stops_search` — Searchable recurring stop data
- `recurring_routes_search` — Searchable recurring route data

**Database Commands**:

```bash
npm run db:generate    # Generate migrations from schema changes
npm run db:migrate     # Run pending migrations
npm run db:push        # Push schema directly to database
npm run db:studio      # Open Drizzle Studio (visual DB browser)
npm run db:seed        # Run seed data
npm run db:reset       # Drop all tables and re-push schema
```

#### 5. Middleware (`src/middleware/`)

| Middleware                | Purpose                                                 |
| ------------------------- | ------------------------------------------------------- |
| `auth.ts`                 | Firebase ID token verification + App Check validation   |
| `authorize/`              | Role-based authorization with custom claims             |
| `service-account/`        | Service account validation (importer, all-teams access) |
| `context.ts`              | Request context injection                               |
| `cors.ts`                 | CORS configuration                                      |
| `form-data.ts`            | Multipart form data parsing                             |
| `file-upload.ts`          | File upload handling                                    |
| `logger/`                 | Structured request logging                              |
| `pubsub-unwrap.ts`        | Pub/Sub message unwrapping                              |
| `require-pubsub-auth.ts`  | Pub/Sub OIDC authentication                             |
| `verify-custom-claims.ts` | Firebase custom claims verification                     |

**Authentication Flow**:

1. `authenticate` middleware verifies Firebase ID token
2. Service accounts and Pub/Sub requests bypass App Check
3. Regular users undergo App Check verification (unless feature-flagged off)
4. `authorize` middleware checks role-based access via custom claims
5. `requireServiceAccount` enforces service-account-only access for internal endpoints

#### 6. Services (`src/services/`)

Shared integrations and utilities:

| Service                 | Purpose                                      |
| ----------------------- | -------------------------------------------- |
| `ach/`                  | ACH payment processing                       |
| `attachments/`          | File attachment handling                     |
| `auth/`                 | Authentication helpers                       |
| `company/`              | Company/team data access                     |
| `context/`              | Request context management                   |
| `csv/`                  | CSV import/export                            |
| `customers/`            | Customer service operations                  |
| `dates/`                | Date/timezone utilities                      |
| `dispatch/`             | Dispatch service                             |
| `elasticsearch/`        | Elasticsearch client and operations          |
| `errors/`               | Error handling and formatting                |
| `firebase/`             | Firebase Admin SDK (auth, App Check, logger) |
| `importer/`             | Bulk data import service                     |
| `invoices/`             | Invoice service operations                   |
| `jsonl/`                | JSONL file processing                        |
| `locations/`            | Location/geocoding                           |
| `logger/`               | Structured logging                           |
| `mappers/`              | Data transformation mappers                  |
| `meilisearch/`          | Meilisearch client                           |
| `payment-methods/`      | Payment method management                    |
| `pubsub/`               | Google Cloud Pub/Sub publisher               |
| `storage/`              | Google Cloud Storage                         |
| `teams/`                | Team data access                             |
| `webhooks/`             | Webhook dispatch                             |
| `weight-ticket-parser/` | Document AI weight ticket OCR                |
| `zodHelpers/`           | Zod schema utilities                         |
| `feature-flag.ts`       | Feature flag evaluation                      |

#### 7. Schemas (`src/schemas/`)

**Zod-based validation schemas** and OpenAPI documentation:

```
schemas/
├── endpoints/          # Request/response schemas per endpoint
├── models/             # Data model schemas
│   └── firestore/      # Firestore document type definitions
├── openapi/            # OpenAPI spec generation
├── pricing-matrix/     # Pricing matrix schemas
├── recurrence/         # Recurrence pattern schemas
└── utils/              # Schema utilities
```

#### 8. Functions (`src/functions/`)

**Google Cloud Functions** for scheduled/background tasks:

- `generate-daily-manifests-scheduler/` — Scheduled function to generate daily route manifests

#### 9. Infrastructure (`terraform/`)

**Terraform** configuration for GCP deployment:

- `cloud_run.tf` — Cloud Run service definition
- `api.tf` — API Gateway configuration
- `pubsub.tf` — Pub/Sub topics and subscriptions
- `scheduler.tf` — Cloud Scheduler jobs
- `storage.tf` — Cloud Storage buckets
- `vpc.tf` — VPC networking
- `function.tf` — Cloud Function definitions
- `artifact_registry.tf` — Container registry

---

### Multi-Tenancy

Docket Backend is **multi-tenant**. Most operations are scoped to a `teamId`:

- Routes under `/v1/teams/:teamId/` automatically extract team context
- The `context` middleware injects team, user, and member information into the request
- Database queries filter by `teamId` at the repository level
- Service accounts can have `allTeamsAccess` for cross-tenant operations (importers, generators)

---

### Development

```bash
# Start dev server (with nodemon hot-reload)
npm run dev

# Start targeting staging
npm run stage

# Run tests
npm run test

# Database management
npm run db:generate    # Generate migration from schema changes
npm run db:push        # Push schema to database
npm run db:studio      # Visual database browser

# API documentation (Bruno)
npm run bruno          # Run Bruno API tests locally
npm run bruno-staging  # Run Bruno API tests against staging
```

### Testing

- **Jest** with `TZ=UTC` forced for consistent date handling
- Test files are co-located: `__tests__/` directories alongside source code
- Top-level integration tests in `src/__tests__/`
- Coverage reports generated via `--coverage` flag

---

## Key Infrastructure

### Docker (Local Development)

The root `docker-compose.yml` provides:

- **PostgreSQL 16** (Alpine) on port `5432` — database: `docket_dev`, user: `docket_user`

### CI/CD (Bitbucket Pipelines)

- **Staging**: Auto-deploys on `main` branch pushes
- **Production**: Deploys via Git tags (pattern: `v<version>-<tag-type>`)
- Pipeline bundles both `docket-api` and `docket-backend`, uploads to GCS, then applies Terraform

### Environment Variables

- Root `.env.example` — global vars (Firebase service account paths, Node env)
- `apps/docket-backend/.env.dist` — backend-specific vars (DB connection, ES, Meilisearch)
- Firebase service account JSON files in project root (never committed)

---

## Monorepo Tooling

| Tool                 | Purpose                                              |
| -------------------- | ---------------------------------------------------- |
| **Turborepo**        | Task orchestration, caching, dependency-aware builds |
| **npm workspaces**   | Package linking (`packages/*`, `apps/*`)             |
| **Husky**            | Git hooks (commitlint on commit messages)            |
| **Commitlint**       | Enforces conventional commit format                  |
| **Semantic Release** | Automated versioning and changelog generation        |
| **Prettier**         | Code formatting                                      |

### Key Commands

```bash
npm run build          # Build all packages/apps (Turbo)
npm run dev            # Start all apps in dev mode
npm run test           # Run all tests
npm run lint           # Lint all packages
npm run format         # Format all code
npm run clean          # Clean all build artifacts
npm run cli:install    # Install Docket CLI globally
```

---

## Quick Reference: Where to Find Things

| Looking for...             | Location                                             |
| -------------------------- | ---------------------------------------------------- |
| Backend API route          | `apps/docket-backend/src/routes/[domain]/`           |
| Business logic             | `apps/docket-backend/src/domain/[entity]/`           |
| Complex operations         | `apps/docket-backend/src/domain/orchestrators/`      |
| Database table schema      | `apps/docket-backend/src/db/tables/`                 |
| Database migrations        | `apps/docket-backend/src/db/migrations/`             |
| Database views             | `apps/docket-backend/src/db/views/`                  |
| Postgres repository        | `apps/docket-backend/src/data-store/postgres/`       |
| Firestore repository       | `apps/docket-backend/src/data-store/firestore/`      |
| Elasticsearch repository   | `apps/docket-backend/src/data-store/elasticsearch/`  |
| Middleware                 | `apps/docket-backend/src/middleware/`                |
| Shared services            | `apps/docket-backend/src/services/`                  |
| Zod schemas                | `apps/docket-backend/src/schemas/`                   |
| Route constants            | `apps/docket-backend/src/constants/routes.ts`        |
| Feature flags              | `apps/docket-backend/src/constants/feature-flags.ts` |
| Firestore schemas (shared) | `packages/docket-data/src/schema/`                   |
| Terraform infra            | `apps/docket-backend/terraform/`                     |
| API docs (Bruno)           | `apps/docket-backend/docs/bruno/`                    |
| Architecture decisions     | `packages/decisions/adr/`                            |
| Legacy API endpoints       | `apps/docket-api/src/routes/`                        |
| CLI commands               | `apps/docket-cli/src/`                               |

---

## Tips for AI Agents

1. **`docket-backend` is the primary project** — most new features and changes happen here.
2. **Multi-tenant by design** — almost everything is scoped by `teamId`. Routes nest under `/v1/teams/:teamId/`.
3. **Three data stores** — PostgreSQL (primary, via Drizzle), Firestore (legacy/shared), and Elasticsearch (search). Check `data-store/` for repository patterns.
4. **Domain layer separates concerns** — routes handle HTTP, domain handles business logic, data-store handles persistence.
5. **Orchestrators for complex flows** — route generation, pricing, manifest creation live in `domain/orchestrators/`.
6. **Zod everywhere** — request validation, response typing, and OpenAPI generation all use Zod schemas.
7. **Test co-location** — tests live in `__tests__/` directories next to the code they test.
8. **Drizzle ORM** — use `db:generate` after schema changes, `db:push` for local dev, `db:migrate` for production.
9. **Feature flags** — check `constants/feature-flags.ts` and `services/feature-flag.ts` for flagged features.
10. **Bruno for API testing** — API collections in `docs/bruno/` can be run locally or against staging.
