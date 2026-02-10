# Agent Context Files

Place markdown files in this directory to provide context to your agents.

Files placed here are automatically loaded into the agent's system prompt based on the agent's configuration in `agents/context/registry.ts`.

## Supported file names

The following file names are recognized by default for the **coding** agent:

- `AGENTS.md` — Project-specific agent instructions and conventions
- `AGENT.md` — Alternative agent instructions file
- `CLAUDE.md` — Claude-specific instructions and preferences
- `README.md` — Project overview and documentation (this file is excluded by default)

## How it works

1. When an agent runs, the context loader checks this directory for files matching the agent's configured `contextFiles` list.
2. If a `projectPath` is provided, it also scans that directory for the same file names.
3. Matched files are concatenated into the agent's system prompt under a `# Project Context` section.

## Adding context for a new codebase

Create a markdown file (e.g., `AGENTS.md`) in this directory with instructions specific to the codebase you want the agent to work on. The file will be automatically picked up on the next agent run.

## Customizing which files are loaded per agent

Edit `agents/context/registry.ts` to modify the `CONTEXT_FILES` mapping for each agent type.
