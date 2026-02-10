# Backend & Frontend Setup

This project now includes a TypeScript backend API server and a React TypeScript frontend.

## Architecture

### Backend (`src/backend/server.ts`)
- **Framework**: Express.js
- **Language**: TypeScript
- **Port**: 3001 (default, configurable via `PORT` env var)
- **Endpoints**:
  - `GET /health` - Health check
  - `POST /api/agent/run` - Run an agent with Server-Sent Events (SSE)

### Frontend (`src/app/`)
- **Framework**: React 19
- **Language**: TypeScript
- **Build Tool**: Vite
- **Port**: 5173 (default)
- **Components**:
  - `AgentInput` - Main component for sending prompts to the agent

## Setup Instructions

### 1. Install Dependencies
All dependencies have been installed. If needed, run:
```bash
bun install
```

### 2. Environment Variables
Create a `.env` file in the root directory with:
```env
# Anthropic API Key (required)
ANTHROPIC_API_KEY=your-api-key-here

# Server Port (optional, defaults to 3001)
PORT=3001
```

### 3. Running the Project

#### Option A: Run Both Backend and Frontend (Recommended)

**Terminal 1 - Backend:**
```bash
npm run dev:backend
# or
bun run dev:backend
```

**Terminal 2 - Frontend:**
```bash
npm run dev:frontend
# or
bun run dev:frontend
```

The frontend will automatically open in your browser at `http://localhost:5173`.

#### Option B: Run Just the Backend

```bash
npm run dev:backend
# or
bun run dev:backend
```

Then manually visit `http://localhost:3001/health` to verify it's running.

#### Option C: Run Just the Frontend

```bash
npm run dev:frontend
# or
bun run dev:frontend
```

Note: The frontend will fail to connect to the agent without the backend running.

## API Documentation

### POST /api/agent/run

Runs an agent with streaming responses using Server-Sent Events (SSE).

**Request Body:**
```json
{
  "agent": "coding" | "calculator",
  "userInput": "Your prompt here",
  "debug": false
}
```

**Response:**
Server-Sent Events stream with chunks of type:

```typescript
interface AgentStreamChunk {
  type: "text-delta" | "tool-call" | "tool-result" | "finish" | "error";
  text?: string;           // For text-delta
  toolName?: string;       // For tool-call
  input?: unknown;         // For tool-call
  output?: unknown;        // For tool-result
  message?: string;        // For error
}
```

**Example:**
```bash
curl -X POST http://localhost:3001/api/agent/run \
  -H "Content-Type: application/json" \
  -d '{
    "agent": "calculator",
    "userInput": "What is 25 plus 17?",
    "debug": false
  }'
```

## Key Changes to Agent System

The `runAgent` function in `agents/index.ts` has been modified to:

1. **Accept `userInput` as a required parameter** instead of reading from stdin
2. **Support an optional `onChunk` callback** to stream results to external consumers
3. **Return a Promise** for better async handling
4. **Export the function** for use in other modules

### Function Signature:
```typescript
export async function runAgent({
  agent: "coding" | "calculator",
  userInput: string,
  debug?: boolean,
  onChunk?: (chunk: AgentStreamChunk) => void
}): Promise<void>
```

## Frontend Features

The `AgentInput` component provides:

- **Agent Selection**: Choose between "Coding Agent" and "Calculator Agent"
- **Text Input**: Enter your prompt in a textarea
- **Real-time Streaming**: See agent responses as they stream in
- **Output Formatting**:
  - Text deltas displayed as plain text
  - Tool calls highlighted with tool name and input
  - Tool results displayed with formatted output
  - Finish event indicates completion
  - Error messages displayed prominently
- **Responsive Design**: Works on desktop and mobile
- **Auto-scroll**: Output automatically scrolls to the latest message

## Troubleshooting

### Frontend can't connect to backend
- Ensure the backend is running on port 3001
- Check that `http://localhost:3001/api/agent/run` is accessible
- Verify CORS is enabled (it is by default)

### Agent not producing output
- Verify your `ANTHROPIC_API_KEY` is set correctly
- Check that you're using one of the valid agent types: "coding" or "calculator"
- Look at backend console for error messages

### Port conflicts
- Backend: Set `PORT` environment variable (e.g., `PORT=3002`)
- Frontend: Modify `vite.config.ts` `server.port` setting

## Production Build

For production deployment:

```bash
# Build the frontend
npm run build:frontend

# Build the backend (if needed)
npm run build:backend

# Start the backend
npm start:backend
```

The built frontend will be in the `dist/` directory after building with Vite.
