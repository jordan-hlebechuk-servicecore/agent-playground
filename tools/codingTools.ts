import { tool } from "ai";
import { z } from "zod";
import { readGuideline } from "../utils";
import path from "path";
import fs from "fs";

const context = {
  projectPath: process.cwd(),
  filesCreated: [] as string[],
};

export const codingTools = {
  webSearch: tool<{ query: string; maxResults: number }, string>({
    description: `Search the web for information. Use when you need up-to-date documentation, API references, or solutions to technical problems.`,
    inputSchema: z.object({
      query: z.string().describe("Search query"),
      maxResults: z
        .number()
        .optional()
        .default(5)
        .describe("Maximum results to return"),
    }),
    execute: async ({
      query,
      maxResults,
    }: {
      query: string;
      maxResults: number;
    }) => {
      const searchUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(
        query
      )}&format=json&no_html=1&skip_disambig=1`;

      try {
        const response = await fetch(searchUrl);
        const data = (await response.json()) as {
          Abstract?: string;
          Heading?: string;
          AbstractURL?: string;
          RelatedTopics?: Array<{ Text?: string; FirstURL?: string }>;
        };

        const results: string[] = [];

        if (data.Abstract) {
          results.push(
            `**${data.Heading}**\n${data.Abstract}\nSource: ${data.AbstractURL}`
          );
        }

        if (data.RelatedTopics) {
          for (const topic of data.RelatedTopics.slice(0, maxResults)) {
            if (topic.Text && topic.FirstURL) {
              results.push(`- ${topic.Text}\n  ${topic.FirstURL}`);
            }
          }
        }

        return results.length > 0
          ? results.join("\n\n")
          : "No results found. Try a different query.";
      } catch (error) {
        return `Search failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`;
      }
    },
  }),

  readWebPage: tool<{ url: string; objective?: string }, string>({
    description: `Read and extract content from a web page. Returns the page content as text.`,
    inputSchema: z.object({
      url: z.string().describe("URL of the web page to read"),
      objective: z
        .string()
        .optional()
        .describe(
          "What information to extract (returns full content if not specified)"
        ),
    }),
    execute: async ({
      url,
      objective,
    }: {
      url: string;
      objective?: string;
    }) => {
      try {
        const response = await fetch(url, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (compatible; Bot/1.0; +http://example.com/bot)",
          },
        });

        if (!response.ok) {
          return `Failed to fetch page: ${response.status} ${response.statusText}`;
        }

        const html = await response.text();
        const textContent = html
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim();

        const content = textContent.slice(0, 10000);

        if (objective) {
          return `Content from ${url} (looking for: ${objective}):\n\n${content}`;
        }

        return `Content from ${url}:\n\n${content}`;
      } catch (error) {
        return `Failed to read page: ${
          error instanceof Error ? error.message : "Unknown error"
        }`;
      }
    },
  }),

  task: tool<{ description: string; prompt: string }, string>({
    description: `Delegate a sub-task to be performed independently. Use for:
- Complex multi-step tasks
- Operations that produce lots of output not needed after completion
- Changes across multiple application layers
Include all necessary context and instructions in the prompt.`,
    inputSchema: z.object({
      description: z.string().describe("Short description of the task"),
      prompt: z.string().describe("Detailed task instructions with context"),
    }),
    execute: async ({
      description,
      prompt,
    }: {
      description: string;
      prompt: string;
    }) => {
      return `Task queued: "${description}"\n\nInstructions:\n${prompt}\n\n[Task execution would be handled by orchestration layer]`;
    },
  }),

  createComponent: tool<
    { name: string; filePath: string; description: string; code: string },
    string
  >({
    description: `Create a new React component file with production-ready code.
Considers: Modern React patterns, TypeScript, proper types, accessibility, error handling.`,
    inputSchema: z.object({
      name: z.string().describe("Component name (PascalCase)"),
      filePath: z.string().describe("Full file path including filename"),
      description: z.string().describe("What the component should do"),
      code: z.string().describe("Complete component code to write"),
    }),
    execute: async ({
      name,
      filePath,
      description,
      code,
    }: {
      name: string;
      filePath: string;
      description: string;
      code: string;
    }) => {
      try {
        await readGuideline("COMPONENT");
      } catch {
        // Guidelines file may not exist
      }

      await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
      await Bun.write(filePath, code);
      context.filesCreated.push(filePath);

      return `Created ${name} component at ${filePath}\nDescription: ${description}`;
    },
  }),

  listCreatedFiles: tool<{}, string>({
    description: "List all files created during this session",
    inputSchema: z.object({}),
    execute: async () => {
      if (context.filesCreated.length === 0) {
        return "No files created yet";
      }
      return context.filesCreated.join("\n");
    },
  }),

  runTests: tool<{ testPath?: string; watch?: boolean }, string>({
    description: `Run tests for the project or specific test files.`,
    inputSchema: z.object({
      testPath: z
        .string()
        .optional()
        .describe("Specific test file or directory to run"),
      watch: z.boolean().optional().describe("Run in watch mode"),
    }),
    execute: async ({
      testPath,
      watch,
    }: {
      testPath?: string;
      watch?: boolean;
    }) => {
      const args = ["bun", "test"];
      if (testPath) args.push(testPath);
      if (watch) args.push("--watch");

      const proc = Bun.spawn(args, {
        stdout: "pipe",
        stderr: "pipe",
        cwd: context.projectPath,
      });

      const stdout = await new Response(proc.stdout).text();
      const stderr = await new Response(proc.stderr).text();
      await proc.exited;

      return stdout + (stderr ? `\nErrors:\n${stderr}` : "");
    },
  }),

  installPackage: tool<{ packages: string[]; dev?: boolean }, string>({
    description: "Install npm packages to the project",
    inputSchema: z.object({
      packages: z.array(z.string()).describe("Package names to install"),
      dev: z.boolean().optional().describe("Install as dev dependency"),
    }),
    execute: async ({
      packages,
      dev,
    }: {
      packages: string[];
      dev?: boolean;
    }) => {
      const args = ["bun", "add", ...packages];
      if (dev) args.push("-D");

      const proc = Bun.spawn(args, {
        stdout: "pipe",
        stderr: "pipe",
        cwd: context.projectPath,
      });

      const stdout = await new Response(proc.stdout).text();
      const stderr = await new Response(proc.stderr).text();
      const exitCode = await proc.exited;

      if (exitCode !== 0) {
        return `Installation failed:\n${stderr}`;
      }

      return `Installed: ${packages.join(", ")}\n${stdout}`;
    },
  }),

  typeCheck: tool<{ path?: string }, string>({
    description: "Run TypeScript type checking on the project",
    inputSchema: z.object({
      path: z.string().optional().describe("Specific path to check"),
    }),
    execute: async ({ path: checkPath }: { path?: string }) => {
      const args = ["npx", "tsc", "--noEmit", "--pretty"];
      if (checkPath) args.push(checkPath);

      const proc = Bun.spawn(args, {
        stdout: "pipe",
        stderr: "pipe",
        cwd: context.projectPath,
      });

      const stdout = await new Response(proc.stdout).text();
      const stderr = await new Response(proc.stderr).text();
      await proc.exited;

      const output = stdout || stderr;
      return output || "No type errors found";
    },
  }),

  lint: tool<{ path?: string; fix?: boolean }, string>({
    description: "Run linter on the project or specific files",
    inputSchema: z.object({
      path: z.string().optional().describe("Specific path to lint"),
      fix: z.boolean().optional().describe("Auto-fix problems"),
    }),
    execute: async ({
      path: lintPath,
      fix,
    }: {
      path?: string;
      fix?: boolean;
    }) => {
      const args = ["npx", "eslint"];
      if (lintPath) args.push(lintPath);
      if (fix) args.push("--fix");

      const proc = Bun.spawn(args, {
        stdout: "pipe",
        stderr: "pipe",
        cwd: context.projectPath,
      });

      const stdout = await new Response(proc.stdout).text();
      const stderr = await new Response(proc.stderr).text();
      await proc.exited;

      return stdout || stderr || "No lint issues found";
    },
  }),

  gitStatus: tool<{}, string>({
    description: "Get the current git status of the repository",
    inputSchema: z.object({}),
    execute: async () => {
      const proc = Bun.spawn(["git", "status", "--short"], {
        stdout: "pipe",
        stderr: "pipe",
        cwd: context.projectPath,
      });

      const stdout = await new Response(proc.stdout).text();
      await proc.exited;

      return stdout || "Working tree clean";
    },
  }),

  gitDiff: tool<{ staged?: boolean; path?: string }, string>({
    description: "Show git diff for uncommitted changes",
    inputSchema: z.object({
      staged: z.boolean().optional().describe("Show only staged changes"),
      path: z.string().optional().describe("Specific file to diff"),
    }),
    execute: async ({
      staged,
      path: diffPath,
    }: {
      staged?: boolean;
      path?: string;
    }) => {
      const args = ["git", "diff"];
      if (staged) args.push("--staged");
      if (diffPath) args.push(diffPath);

      const proc = Bun.spawn(args, {
        stdout: "pipe",
        stderr: "pipe",
        cwd: context.projectPath,
      });

      const stdout = await new Response(proc.stdout).text();
      await proc.exited;

      return stdout || "No changes";
    },
  }),

  mermaid: tool<{ code: string; title?: string }, string>({
    description: `Generate a Mermaid diagram. Use proactively when explaining:
- System architecture or component relationships
- Workflows, data flows, user journeys
- Algorithms or complex processes
- Class hierarchies or entity relationships
- State transitions or event sequences`,
    inputSchema: z.object({
      code: z.string().describe("Mermaid diagram code"),
      title: z.string().optional().describe("Title for the diagram"),
    }),
    execute: async ({ code, title }: { code: string; title?: string }) => {
      const output = title
        ? `## ${title}\n\n\`\`\`mermaid\n${code}\n\`\`\``
        : `\`\`\`mermaid\n${code}\n\`\`\``;
      return output;
    },
  }),
};
