# Agent Practice — Project Overview

## What This Project Is

A full-stack web application for running custom AI agents through a browser UI. Users select an agent type, enter a prompt, and see the agent's streaming response (text, tool calls, tool results) rendered in real time. The backend uses the Vercel AI SDK with Anthropic's Claude to power the agents, each of which has a configurable set of tools.

## Tech Stack

- **Runtime**: Bun
- **Language**: TypeScript (strict mode, ESNext target)
- **Frontend**: React 19, Vite 5, MUI Material 7, React Router 7
- **Backend**: Express 5 (runs via `bun --watch`)
- **AI**: Vercel AI SDK (`ai` package) with `@ai-sdk/anthropic`
- **Validation**: Zod 4
- **Styling**: MUI `styled` API from `@mui/material/styles` (NOT `styled-components`, NOT plain CSS files)

## Scripts

| Command                | Purpose                                           |
| ---------------------- | ------------------------------------------------- |
| `bun run dev:frontend` | Start Vite dev server on port 5173                |
| `bun run dev:backend`  | Start Express server on port 3001 with hot reload |
| `npx tsc --noEmit`     | Typecheck the entire project                      |

## Project Structure

```
agent-practice/
├── agents/                          # Agent definitions, tools, and context system
│   ├── index.ts                     # runAgent() — main entry point for running agents
│   ├── context/                     # Context loading infrastructure
│   │   ├── types.ts                 # AgentName, AgentContextConfig, LoadedContext
│   │   ├── registry.ts              # Maps agent names → base prompts + context file lists
│   │   ├── loader.ts                # buildSystemPrompt() — reads and injects markdown context
│   │   └── index.ts                 # Barrel export
│   ├── context_files/               # Markdown files loaded into agent system prompts
│   │   ├── AGENT_PRACTICE_OVERVIEW.md
│   │   ├── COMPONENT_GUIDELINES.md
│   │   └── README.md
│   ├── tools/                       # Tool definitions grouped by agent type
│   │   ├── index.ts                 # Barrel export
│   │   ├── codingTools.ts           # webSearch, readWebPage, task, createComponent, etc.
│   │   ├── fileTools.ts             # createFile, editFile, readFile, bash, grep, glob, etc.
│   │   ├── calculatorTools.ts       # add, subtract, multiply, divide
│   │   ├── jiraTools.ts             # JIRA-related agent tools
│   │   ├── gitTools.ts              # Git-related agent tools
│   │   └── bitbucketTools.ts        # Bitbucket-related agent tools
│   └── utils/
│       └── index.ts                 # askUserConfirmation, readGuideline, loggingFetch
├── src/
│   ├── app/                         # React frontend (dashboard SPA)
│   │   ├── index.tsx                # ReactDOM entry point
│   │   ├── index.css                # Global reset styles (only CSS file allowed)
│   │   ├── App.tsx                  # Root component — BrowserRouter + route definitions
│   │   ├── App.styles.ts            # Styled container for App
│   │   ├── types.ts                 # Shared app-level types (AgentStreamChunk, AgentType, etc.)
│   │   ├── layout/                  # App shell / dashboard layout
│   │   │   ├── DashboardLayout/     # Header + Outlet wrapper
│   │   │   │   ├── DashboardLayout.tsx
│   │   │   │   ├── DashboardLayout.styles.ts
│   │   │   │   └── index.ts
│   │   │   ├── Sidebar/             # Collapsible navigation sidebar
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── Sidebar.styles.ts
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   ├── pages/                   # Route-level page components
│   │   │   ├── index.ts             # Barrel export for all pages
│   │   │   ├── AgentRunner/         # /agent — run agents with optional ticket context
│   │   │   │   ├── AgentRunner.tsx
│   │   │   │   ├── AgentRunner.styles.ts
│   │   │   │   ├── useAgentRunner.ts
│   │   │   │   ├── index.ts
│   │   │   │   └── components/
│   │   │   │       ├── AgentSelector/
│   │   │   │       ├── PromptInput/
│   │   │   │       ├── RepoSelector/
│   │   │   │       ├── OutputSection/
│   │   │   │       └── OutputChunks/
│   │   │   ├── MyTickets/           # /tickets — JIRA ticket grid with filters
│   │   │   │   ├── MyTickets.tsx
│   │   │   │   ├── MyTickets.styles.ts
│   │   │   │   ├── useTicketFilters.ts  # Filtering, grouping, sorting logic
│   │   │   │   ├── index.ts
│   │   │   │   └── components/
│   │   │   │       ├── JiraTicketCard/
│   │   │   │       ├── JiraTicketGrid/
│   │   │   │       └── StatusFilter/
│   │   │   └── UserSettings/        # /settings — user preferences (placeholder)
│   │   │       ├── UserSettings.tsx
│   │   │       ├── UserSettings.styles.ts
│   │   │       └── index.ts
│   │   └── components/              # Generic reusable components
│   │       ├── SubmitButton/
│   │       └── StopButton/
│   └── backend/
│       ├── server.ts                # Express app setup, middleware, mount routers
│       └── routes/                  # Route modules
│           ├── health/
│           │   ├── index.ts         # GET /health
│           │   └── endpoints/
│           │       └── getHealth.ts
│           ├── agent/
│           │   ├── index.ts         # POST /run
│           │   └── endpoints/
│           │       └── runAgent.ts
│           ├── jira/
│           │   ├── index.ts         # GET /tickets, GET /tickets/:key
│           │   └── endpoints/
│           │       ├── getTickets.ts
│           │       └── getTicketByKey.ts
│           └── repos/
│               ├── index.ts         # GET /
│               └── endpoints/
│                   ├── getRepos.ts
│                   └── utils/
│                       └── filterRepos.ts
├── index.html                       # Vite HTML entry point
├── vite.config.ts                   # Vite config (React plugin, port 5173)
├── tsconfig.json                    # TypeScript config (strict, bundler resolution)
└── package.json
```

## Architecture

### Routing & Layout

The app uses **React Router v7** with a dashboard layout pattern:

- `App.tsx` — defines `BrowserRouter` with all routes nested under `DashboardLayout`
- `DashboardLayout` — provides the app shell:
  - **Collapsible `Sidebar`** (left) — its own component with navigation links to Agent Runner, My Tickets, Settings
  - **Fixed header** (top) — user profile avatar icon linking to Settings
  - **Content area** — renders the active page via React Router `<Outlet />`
- Default route redirects to `/tickets`

**Routes**:
| Path | Page | Description |
|------|------|-------------|
| `/agent` | AgentRunner | Run agents freely, or with ticket context via `?ticket=KEY` |
| `/tickets` | MyTickets | JIRA ticket grid with status filters and type grouping |
| `/settings` | UserSettings | User preferences (placeholder) |

### Ticket → Agent Flow

When a user clicks "Handle Bugfix" on a JIRA ticket in MyTickets, the app navigates to `/agent?ticket=PROJ-123`. The AgentRunner page reads the `ticket` search param, fetches the full ticket from the API via `GET /api/jira/tickets/:key`, pre-selects the bugfix agent type, and displays a ticket context banner. Each ticket card also has a "View in JIRA" button that opens the ticket directly in Atlassian.

### MyTickets Filtering & Grouping

The MyTickets page uses a `useTicketFilters` hook that:
- **Filters** tickets by status via toggle chips (excludes "Done" and "Cancelled" by default)
- **Groups** filtered tickets by type in order: Bug → Task → Story → Sub-task → others
- **Sorts** within each group by priority (Highest first) then status (In Progress → In Review → Code Review → To Do → Open → Backlog)

### Agent System (`agents/`)

**Entry point**: `agents/index.ts` exports `runAgent()` which:

1. Calls `buildSystemPrompt(agent, projectPath)` to assemble the system prompt from base prompt + loaded markdown context files
2. Creates an Anthropic streaming text completion via `streamText()` from the AI SDK
3. Passes the configured tool set based on agent type
4. Streams chunks back via an `onChunk` callback (for server use) or writes to stdout (for CLI use)

**Agent types** are defined in `agents/context/types.ts` as the `AgentName` union type. Currently: `"coding"`, `"calculator"`, `"coding_practice_agent"`.

**Adding a new agent** requires:

1. Add the name to the `AgentName` type in `agents/context/types.ts`
2. Add base prompt and context file list in `agents/context/registry.ts`
3. Add the switch case in `agents/index.ts` with the appropriate tool set
4. Add the option to `AGENT_OPTIONS` in `src/app/types.ts` and update the `AgentType` union

### Context System (`agents/context/`)

The context system injects markdown files into agent system prompts at runtime:

- **`registry.ts`**: `CONTEXT_FILES` maps each agent to an array of filenames to load
- **`loader.ts`**: `buildSystemPrompt()` reads files from two locations:
  1. `agents/context_files/` — bundled context (shared across all projects)
  2. An optional `projectPath` — project-specific context passed at runtime
- Loaded files are appended to the system prompt under a `# Project Context` heading

### Tools (`agents/tools/`)

Tools use the Vercel AI SDK `tool()` function with Zod schemas for input validation.

- **`codingTools.ts`**: webSearch, readWebPage, task, createComponent, listCreatedFiles, runTests, installPackage, typeCheck, lint, gitStatus, gitDiff, mermaid
- **`fileTools.ts`**: createFile, editFile, undoEdit, readFile, bash, glob, grep, finder, getDiagnostics, deleteFile, createDirectory, listDirectory, deleteDirectory, renameFile, copyFile, copyDirectory, formatFile
- **`calculatorTools.ts`**: add, subtract, multiply, divide
- **`jiraTools.ts`**: JIRA-related agent tools
- **`gitTools.ts`**: Git-related agent tools
- **`bitbucketTools.ts`**: Bitbucket-related agent tools

Tools use `Bun.spawn` for shell commands and `Bun.file` / `Bun.write` for file I/O.

### Backend (`src/backend/`)

An Express server with modular route architecture. Each route domain has its own folder with an `index.ts` (router declarations) and an `endpoints/` folder (individual handler functions).

**`server.ts`** — app setup, middleware (JSON parsing, CORS, request logging), mounts route modules:

| Mount point | Router | Endpoints |
|-------------|--------|-----------|
| `/health` | `health/` | `GET /` — health check |
| `/api/agent` | `agent/` | `POST /run` — SSE stream for agent execution |
| `/api/jira` | `jira/` | `GET /tickets` — list tickets, `GET /tickets/:key` — single ticket |
| `/api/repos` | `repos/` | `GET /` — list Bitbucket repositories |

### Frontend (`src/app/`)

A React SPA served by Vite with a dashboard layout and client-side routing.

**State flow**:

1. `DashboardLayout` provides the app shell; `Sidebar` handles navigation
2. Each page manages its own state (e.g., AgentRunner has `useAgentRunner`, MyTickets has `useTicketFilters`)
3. On the AgentRunner page, `useAgentRunner` manages `isLoading`, `output` (array of `AgentStreamChunk`), and `AbortController` for stopping runs
4. On submit, the hook sends a POST to `/api/agent/run` and reads the SSE stream via `ReadableStream`
5. Each parsed chunk is appended to the `output` array, which triggers re-render
6. `OutputSection` groups consecutive `text-delta` chunks and renders via `ChunkRenderer`

**Component organization**:
- **Generic components** (`src/app/components/`) — reusable across pages (SubmitButton, StopButton)
- **Page components** (`src/app/pages/*/components/`) — specific to a page (AgentSelector, OutputSection, JiraTicketGrid, StatusFilter, etc.)
- **Layout components** (`src/app/layout/`) — app shell pieces (DashboardLayout, Sidebar)
- Each component folder: `ComponentName.tsx`, `ComponentName.styles.ts`, `index.ts`, and optionally `useComponentName.ts`

## Styling Conventions

**IMPORTANT**: This project uses MUI's `styled` API exclusively. Do NOT use:

- Plain `.css` files (except `index.css` for global resets)
- `styled-components` package directly
- Inline `sx` props for complex styles (move them into styled containers)

**Pattern**: Use a single styled container per component with nested className selectors:

```tsx
// ComponentName.styles.ts
import { styled } from "@mui/material/styles";
import { Box } from "@mui/material";

export const StyledComponentContainer = styled(Box)`
  display: flex;
  padding: 16px;

  .Title {
    font-size: 18px;
    font-weight: 600;
  }

  .Content {
    color: #333;
  }
`;

// ComponentName.tsx
import { Box, Typography } from "@mui/material";
import { StyledComponentContainer } from "./ComponentName.styles";

export const ComponentName = () => (
  <StyledComponentContainer>
    <Typography className="Title">Hello</Typography>
    <Box className="Content">World</Box>
  </StyledComponentContainer>
);
```

**Exception**: When styling MUI components that have high-specificity internal styles (e.g., `Chip`, `Button`), create a directly styled version of that component with props rather than relying on parent className selectors:

```tsx
// Example: styled Chip with a custom prop
export const StyledStatusChip = styled(Chip)<{ excluded: boolean }>`
  background: ${({ excluded }) => (excluded ? "#f5f5f5" : "#667eea")};
`;
```

**Naming**: All styled containers use the `Styled` prefix (e.g., `StyledHeaderContainer`, `StyledAppContainer`).

## Component Guidelines

Refer to `agents/context_files/COMPONENT_GUIDELINES.md` for detailed folder structure and architecture standards. Key points:

- **Generic/reusable components** go in `src/app/components/`
- **Page-specific components** go in `src/app/pages/<PageName>/components/`
- **Layout components** go in `src/app/layout/`
- Each component folder: `ComponentName.tsx`, `useComponentName.ts` (if needed), `types.ts`, `ComponentName.styles.ts`, `index.ts`
- Separate logic (hooks) from presentation (JSX)
- `index.ts` exports only the main component, never subcomponents

## Key Types

```ts
// Agent stream chunk sent via SSE
interface AgentStreamChunk {
  type: "text-delta" | "tool-call" | "tool-result" | "finish" | "error";
  text?: string;
  toolName?: string;
  input?: unknown;
  output?: unknown;
  message?: string;
}

// Available agent types
type AgentType = "coding" | "calculator" | "coding_practice_agent" | "bugfix";

// JIRA ticket
interface JiraTicket {
  key: string;
  summary: string;
  description: unknown;
  status: string;
  type: string;
  priority: string;
  assignee: string;
  created: string;
  updated: string;
  url: string;
}

// Bitbucket repository
interface RepoOption {
  slug: string;
  name: string;
  cloneUrl: string;
}
```

## Environment

Requires a `.env` file with:

| Variable | Purpose |
|----------|---------|
| `ANTHROPIC_API_KEY` | Anthropic API key for Claude |
| `ATLASSIAN_USER_EMAIL` | Atlassian account email (shared for JIRA + Bitbucket) |
| `ATLASSIAN_API_TOKEN` | Atlassian API token (shared for JIRA + Bitbucket) |
| `JIRA_BASE_URL` | JIRA instance URL (e.g., `https://myorg.atlassian.net`) |
| `BITBUCKET_BASE_URL` | Bitbucket API base URL (default: `https://api.bitbucket.org/2.0`) |
| `BITBUCKET_WORKSPACE` | Bitbucket workspace slug |

- Bun runtime for backend (uses Bun APIs: `Bun.file`, `Bun.write`, `Bun.spawn`)
- Frontend dev server: port 5173
- Backend server: port 3001
