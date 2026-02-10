# Agent Practice — Project Overview

## What This Project Is

A full-stack web application for running custom AI agents through a browser UI. Users select an agent type, enter a prompt, and see the agent's streaming response (text, tool calls, tool results) rendered in real time. The backend uses the Vercel AI SDK with Anthropic's Claude to power the agents, each of which has a configurable set of tools.

## Tech Stack

- **Runtime**: Bun
- **Language**: TypeScript (strict mode, ESNext target)
- **Frontend**: React 19, Vite 5, MUI Material 7
- **Backend**: Express 5 (runs via `bun --watch`)
- **AI**: Vercel AI SDK (`ai` package) with `@ai-sdk/anthropic`
- **Validation**: Zod 4
- **Styling**: MUI `styled` API from `@mui/material/styles` (NOT `styled-components`, NOT plain CSS files)

## Scripts

| Command | Purpose |
|---|---|
| `bun run dev:frontend` | Start Vite dev server on port 5173 |
| `bun run dev:backend` | Start Express server on port 3001 with hot reload |
| `npx tsc --noEmit` | Typecheck the entire project |

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
│   │   └── AGENT_PRACTICE_OVERVIEW.md
│   ├── agent_files/                 # Static reference files for tools (e.g., guidelines)
│   │   └── COMPONENT_GUIDELINES.md
│   ├── tools/                       # Tool definitions grouped by agent type
│   │   ├── index.ts                 # Barrel export
│   │   ├── codingTools.ts           # webSearch, readWebPage, task, createComponent, etc.
│   │   ├── fileTools.ts             # createFile, editFile, readFile, bash, grep, glob, etc.
│   │   └── calculatorTools.ts       # add, subtract, multiply, divide
│   └── utils/
│       └── index.ts                 # askUserConfirmation, readGuideline, loggingFetch
├── src/
│   ├── app/                         # React frontend
│   │   ├── index.tsx                # ReactDOM entry point
│   │   ├── index.css                # Global reset styles (only CSS file allowed)
│   │   ├── App.tsx                  # Root component — layout, state, agent selection
│   │   ├── App.styles.ts            # Styled container for App layout
│   │   └── components/
│   │       ├── types.ts             # AgentStreamChunk, AgentType, AGENT_OPTIONS
│   │       ├── useAgentRunner.ts    # Hook: SSE streaming, abort control, output state
│   │       ├── Header/              # App header with title/subtitle
│   │       ├── AgentSelector/       # Dropdown to pick agent type
│   │       ├── PromptInput/         # Multi-line text input for user prompt
│   │       ├── SubmitButton/        # Submit button with loading state
│   │       ├── StopButton/          # Abort button shown during agent runs
│   │       ├── OutputSection/       # Output container with auto-scroll
│   │       └── OutputChunks/        # Renderers for each chunk type (text, tool-call, etc.)
│   └── backend/
│       └── server.ts                # Express server — /api/agent/run SSE endpoint
├── index.html                       # Vite HTML entry point
├── vite.config.ts                   # Vite config (React plugin, port 5173)
├── tsconfig.json                    # TypeScript config (strict, bundler resolution)
└── package.json
```

## Architecture

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
4. Add the option to `AGENT_OPTIONS` in `src/app/components/types.ts` and update the `AgentType` union

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

Tools use `Bun.spawn` for shell commands and `Bun.file` / `Bun.write` for file I/O.

### Backend (`src/backend/server.ts`)

An Express server with one main endpoint:

- **`POST /api/agent/run`**: Accepts `{ agent, userInput, projectPath?, debug? }`, sets up Server-Sent Events, calls `runAgent()` with a chunk handler that writes SSE `data:` lines, and ends the response when the agent finishes.
- **`GET /health`**: Health check.

### Frontend (`src/app/`)

A React SPA served by Vite.

**State flow**:
1. `App.tsx` holds `userInput`, `agentType` state
2. `useAgentRunner` hook manages `isLoading`, `output` (array of `AgentStreamChunk`), and `AbortController` for stopping runs
3. On submit, the hook sends a POST to `/api/agent/run` and reads the SSE stream via `ReadableStream`
4. Each parsed chunk is appended to the `output` array, which triggers re-render
5. `OutputSection` groups consecutive `text-delta` chunks and renders via `ChunkRenderer`

**Component structure**: Each component lives in its own folder with `ComponentName.tsx`, `ComponentName.styles.ts`, and `index.ts`. Complex components may also have `useComponentName.ts` for logic separation.

## Styling Conventions

**IMPORTANT**: This project uses MUI's `styled` API exclusively. Do NOT use:
- Plain `.css` files (except `index.css` for global resets)
- `styled-components` package directly
- Inline `sx` props for complex styles (move them into styled containers)

**Pattern**: Use a single styled container per component with nested className selectors:

```tsx
// ComponentName.styles.ts
import { styled } from '@mui/material/styles';
import { Box } from '@mui/material';

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
import { Box, Typography } from '@mui/material';
import { StyledComponentContainer } from './ComponentName.styles';

export const ComponentName = () => (
  <StyledComponentContainer>
    <Typography className="Title">Hello</Typography>
    <Box className="Content">World</Box>
  </StyledComponentContainer>
);
```

**Naming**: All styled containers use the `Styled` prefix (e.g., `StyledHeaderContainer`, `StyledAppContainer`).

## Component Guidelines

Refer to `agents/agent_files/COMPONENT_GUIDELINES.md` for detailed folder structure and architecture standards. Key points:

- Reusable components go in root `/components` organized by type (buttons/, cards/, etc.)
- Location-specific components go in that location's `/components` folder
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
type AgentName = "coding" | "calculator" | "coding_practice_agent";
```

## Environment

- Requires a `.env` file with `ANTHROPIC_API_KEY`
- Bun runtime for backend (uses Bun APIs: `Bun.file`, `Bun.write`, `Bun.spawn`)
- Node.js 18 is available but Vite runs through Bun
- Frontend dev server: port 5173
- Backend server: port 3001
