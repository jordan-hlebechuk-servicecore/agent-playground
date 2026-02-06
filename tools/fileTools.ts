import { tool } from "ai";
import { z } from "zod";
import fs from "fs";
import path from "path";
import { askUserConfirmation } from "../utils";
import { Glob } from "bun";

const fileEditHistory: Map<string, string[]> = new Map();

function saveToHistory(filePath: string, content: string) {
  const history = fileEditHistory.get(filePath) || [];
  history.push(content);
  fileEditHistory.set(filePath, history);
}

export const fileTools = {
  createFile: tool<{ path: string; content: string }, string>({
    description:
      "Create or overwrite a file. Use for new files or when replacing nearly all content of a small file (under ~250 lines). For partial edits to existing files, use `editFile` instead.",
    inputSchema: z.object({
      path: z.string().describe("Absolute path to the file to create"),
      content: z.string().describe("The content to write to the file"),
    }),
    execute: async ({
      path: filePath,
      content,
    }: {
      path: string;
      content: string;
    }) => {
      const dir = path.dirname(filePath);
      await fs.promises.mkdir(dir, { recursive: true });
      await Bun.write(filePath, content);
      return `File created at ${filePath}`;
    },
  }),

  editFile: tool<
    { path: string; old_str: string; new_str: string; replace_all: boolean },
    string
  >({
    description: `Make edits to a text file by replacing specific text. 
- The file must exist (use createFile for new files)
- old_str must exist in the file and be unique (add context lines if needed)
- old_str and new_str must be different
- Set replace_all to true to replace all occurrences
- Returns a diff of changes made`,
    inputSchema: z.object({
      path: z.string().describe("Absolute path to the file to edit"),
      old_str: z.string().describe("Text to search for and replace"),
      new_str: z.string().describe("Text to replace old_str with"),
      replace_all: z
        .boolean()
        .optional()
        .default(false)
        .describe("Replace all occurrences if true"),
    }),
    execute: async ({
      path: filePath,
      old_str,
      new_str,
      replace_all,
    }: {
      path: string;
      old_str: string;
      new_str: string;
      replace_all: boolean;
    }) => {
      if (old_str === new_str) {
        return "Error: old_str and new_str must be different";
      }

      const content = await Bun.file(filePath).text();

      if (!content.includes(old_str)) {
        return `Error: old_str not found in file. Make sure the text exists exactly as specified.`;
      }

      const occurrences = content.split(old_str).length - 1;
      if (!replace_all && occurrences > 1) {
        return `Error: old_str found ${occurrences} times. Set replace_all=true or add more context to make it unique.`;
      }

      saveToHistory(filePath, content);

      const newContent = replace_all
        ? content.replaceAll(old_str, new_str)
        : content.replace(old_str, new_str);

      await Bun.write(filePath, newContent);

      const oldLines = old_str.split("\n");
      const newLines = new_str.split("\n");
      const diff = `--- ${filePath}\n+++ ${filePath}\n${oldLines
        .map((l: string) => `- ${l}`)
        .join("\n")}\n${newLines.map((l: string) => `+ ${l}`).join("\n")}`;

      return `File edited successfully.\n\n${diff}`;
    },
  }),

  undoEdit: tool<{ path: string }, string>({
    description:
      "Undo the last edit made to a file, restoring it to its previous state.",
    inputSchema: z.object({
      path: z.string().describe("Absolute path to the file to undo"),
    }),
    execute: async ({ path: filePath }: { path: string }) => {
      const history = fileEditHistory.get(filePath);
      if (!history || history.length === 0) {
        return "Error: No edit history found for this file";
      }

      const previousContent = history.pop()!;
      fileEditHistory.set(filePath, history);
      await Bun.write(filePath, previousContent);

      return `Restored ${filePath} to previous state`;
    },
  }),

  readFile: tool<{ path: string; read_range?: [number, number] }, string>({
    description: `Read a file or list a directory.
- For files: Returns content with line numbers (e.g., "1: content")
- For directories: Returns list of entries with "/" suffix for subdirectories
- Default returns first 500 lines; use read_range for more
- Use grep to find specific content in large files`,
    inputSchema: z.object({
      path: z.string().describe("Absolute path to the file or directory"),
      read_range: z
        .tuple([z.number(), z.number()])
        .optional()
        .describe("Line range [start, end] (1-indexed). Default: [1, 500]"),
    }),
    execute: async ({
      path: filePath,
      read_range,
    }: {
      path: string;
      read_range?: [number, number];
    }) => {
      const stat = await fs.promises.stat(filePath);

      if (stat.isDirectory()) {
        const entries = await fs.promises.readdir(filePath, {
          withFileTypes: true,
        });
        return entries
          .map((e) => (e.isDirectory() ? `${e.name}/` : e.name))
          .join("\n");
      }

      const content = await Bun.file(filePath).text();
      const lines = content.split("\n");

      const [start, end] = read_range || [1, 500];
      const selectedLines = lines.slice(start - 1, end);

      return selectedLines.map((line, i) => `${start + i}: ${line}`).join("\n");
    },
  }),

  bash: tool<{ command: string; cwd?: string }, string>({
    description: `Execute a shell command.
- Do NOT chain commands with ; or && or use & for background processes
- Do NOT use interactive commands (REPLs, editors, password prompts)
- Environment variables and cd do not persist between commands
- Use cwd parameter for different directories`,
    inputSchema: z.object({
      command: z.string().describe("The shell command to execute"),
      cwd: z.string().optional().describe("Working directory for the command"),
    }),
    execute: async ({ command, cwd }: { command: string; cwd?: string }) => {
      const proc = Bun.spawn(["sh", "-c", command], {
        cwd: cwd || process.cwd(),
        stdout: "pipe",
        stderr: "pipe",
      });

      const stdout = await new Response(proc.stdout).text();
      const stderr = await new Response(proc.stderr).text();
      await proc.exited;

      const output = stdout + (stderr ? `\nSTDERR:\n${stderr}` : "");
      return output.slice(-50000);
    },
  }),

  glob: tool<{ pattern: string; limit?: number }, string>({
    description: `Find files by name patterns. Returns matching file paths sorted by modification time.
Examples:
- **/*.ts - All TypeScript files
- src/**/*.test.ts - Test files under src
- **/*.{js,ts} - JS and TS files`,
    inputSchema: z.object({
      pattern: z.string().describe("Glob pattern like **/*.ts or src/**/*.js"),
      limit: z.number().optional().describe("Maximum results to return"),
    }),
    execute: async ({
      pattern,
      limit,
    }: {
      pattern: string;
      limit?: number;
    }) => {
      const glob = new Glob(pattern);
      const matches: string[] = [];

      for await (const file of glob.scan({
        cwd: process.cwd(),
        onlyFiles: true,
      })) {
        matches.push(file);
      }

      const withStats = await Promise.all(
        matches.map(async (file) => {
          try {
            const stat = await fs.promises.stat(file);
            return { file, mtime: stat.mtimeMs };
          } catch {
            return { file, mtime: 0 };
          }
        })
      );

      withStats.sort((a, b) => b.mtime - a.mtime);
      const results = limit ? withStats.slice(0, limit) : withStats;

      return results.map((r) => r.file).join("\n") || "No files found";
    },
  }),

  grep: tool<
    {
      pattern: string;
      path?: string;
      glob?: string;
      caseSensitive?: boolean;
      literal?: boolean;
    },
    string
  >({
    description: `Search for text patterns in files using ripgrep.
- For exact text matches (variable names, function calls, strings)
- Use path or glob to narrow searches
- Results limited to 100 matches, lines truncated at 200 chars`,
    inputSchema: z.object({
      pattern: z.string().describe("Regex pattern to search for"),
      path: z.string().optional().describe("File or directory to search in"),
      glob: z.string().optional().describe("Glob pattern to filter files"),
      caseSensitive: z.boolean().optional().describe("Case-sensitive search"),
      literal: z
        .boolean()
        .optional()
        .describe("Treat pattern as literal string"),
    }),
    execute: async ({
      pattern,
      path: searchPath,
      glob: globPattern,
      caseSensitive,
      literal,
    }: {
      pattern: string;
      path?: string;
      glob?: string;
      caseSensitive?: boolean;
      literal?: boolean;
    }) => {
      const args = [
        "rg",
        "--max-count=100",
        "--max-columns=200",
        "--line-number",
      ];

      if (!caseSensitive) args.push("-i");
      if (literal) args.push("-F");
      if (globPattern) args.push("-g", globPattern);

      args.push(pattern);
      args.push(searchPath || ".");

      const proc = Bun.spawn(args, { stdout: "pipe", stderr: "pipe" });
      const stdout = await new Response(proc.stdout).text();
      const stderr = await new Response(proc.stderr).text();
      await proc.exited;

      if (stderr && !stdout) return `No matches found or error: ${stderr}`;
      return stdout || "No matches found";
    },
  }),

  finder: tool<{ query: string }, string>({
    description: `Intelligent codebase search for complex, multi-step searches.
Use when:
- Locating code by behavior or concept
- Running multiple sequential searches
- Correlating different areas of codebase
- Filtering broad terms by context

Do NOT use when:
- You know the exact file path (use readFile)
- Looking for specific strings (use grep)`,
    inputSchema: z.object({
      query: z
        .string()
        .describe("Precise engineering query describing what to find"),
    }),
    execute: async ({ query }: { query: string }) => {
      const keywords = query
        .toLowerCase()
        .split(/\s+/)
        .filter((w: string) => w.length > 3);

      const results: string[] = [];

      for (const keyword of keywords.slice(0, 3)) {
        const proc = Bun.spawn(
          ["rg", "-l", "-i", "--max-count=5", keyword, "."],
          { stdout: "pipe", stderr: "pipe" }
        );
        const stdout = await new Response(proc.stdout).text();
        await proc.exited;
        if (stdout) {
          results.push(`Files matching "${keyword}":\n${stdout}`);
        }
      }

      return results.length > 0
        ? results.join("\n---\n")
        : "No matches found. Try different search terms.";
    },
  }),

  getDiagnostics: tool<{ path: string }, string>({
    description:
      "Get diagnostics (errors, warnings) for a file or directory. Runs TypeScript type checking.",
    inputSchema: z.object({
      path: z.string().describe("Path to check for diagnostics"),
    }),
    execute: async ({ path: checkPath }: { path: string }) => {
      const proc = Bun.spawn(["npx", "tsc", "--noEmit", "--pretty"], {
        stdout: "pipe",
        stderr: "pipe",
        cwd: checkPath,
      });

      const stdout = await new Response(proc.stdout).text();
      const stderr = await new Response(proc.stderr).text();
      await proc.exited;

      return stdout || stderr || "No diagnostics found";
    },
  }),

  deleteFile: tool<{ path: string }, string>({
    description: "Delete a file from the filesystem (requires confirmation)",
    inputSchema: z.object({
      path: z.string().describe("Absolute path to the file to delete"),
    }),
    execute: async ({ path: filePath }: { path: string }) => {
      const approved = await askUserConfirmation(`Delete file ${filePath}?`);
      if (!approved) return "Cancelled by user";
      await fs.promises.unlink(filePath);
      return `File deleted: ${filePath}`;
    },
  }),

  createDirectory: tool<{ path: string }, string>({
    description: "Create a directory (creates parent directories if needed)",
    inputSchema: z.object({
      path: z.string().describe("Absolute path to the directory to create"),
    }),
    execute: async ({ path: dirPath }: { path: string }) => {
      await fs.promises.mkdir(dirPath, { recursive: true });
      return `Directory created at ${dirPath}`;
    },
  }),

  listDirectory: tool<{ path: string }, string>({
    description: "List files and subdirectories in a directory",
    inputSchema: z.object({
      path: z.string().describe("Absolute path to the directory"),
    }),
    execute: async ({ path: dirPath }: { path: string }) => {
      const entries = await fs.promises.readdir(dirPath, {
        withFileTypes: true,
      });
      return entries
        .map((e) => (e.isDirectory() ? `${e.name}/` : e.name))
        .join("\n");
    },
  }),

  deleteDirectory: tool<{ path: string }, string>({
    description: "Delete a directory (requires confirmation)",
    inputSchema: z.object({
      path: z.string().describe("Absolute path to the directory to delete"),
    }),
    execute: async ({ path: dirPath }: { path: string }) => {
      const approved = await askUserConfirmation(
        `Delete directory ${dirPath}?`
      );
      if (!approved) return "Cancelled by user";
      await fs.promises.rm(dirPath, { recursive: true });
      return `Directory deleted: ${dirPath}`;
    },
  }),

  renameFile: tool<{ oldPath: string; newPath: string }, string>({
    description: "Rename or move a file",
    inputSchema: z.object({
      oldPath: z.string().describe("Current path to the file"),
      newPath: z.string().describe("New path for the file"),
    }),
    execute: async ({
      oldPath,
      newPath,
    }: {
      oldPath: string;
      newPath: string;
    }) => {
      const dir = path.dirname(newPath);
      await fs.promises.mkdir(dir, { recursive: true });
      await fs.promises.rename(oldPath, newPath);
      return `Renamed ${oldPath} to ${newPath}`;
    },
  }),

  copyFile: tool<{ sourcePath: string; destinationPath: string }, string>({
    description: "Copy a file to a new location",
    inputSchema: z.object({
      sourcePath: z.string().describe("Path to the source file"),
      destinationPath: z.string().describe("Path for the copied file"),
    }),
    execute: async ({
      sourcePath,
      destinationPath,
    }: {
      sourcePath: string;
      destinationPath: string;
    }) => {
      const dir = path.dirname(destinationPath);
      await fs.promises.mkdir(dir, { recursive: true });
      await fs.promises.copyFile(sourcePath, destinationPath);
      return `Copied ${sourcePath} to ${destinationPath}`;
    },
  }),

  copyDirectory: tool<{ sourcePath: string; destinationPath: string }, string>({
    description: "Recursively copy a directory to a new location",
    inputSchema: z.object({
      sourcePath: z.string().describe("Path to the source directory"),
      destinationPath: z.string().describe("Path for the copied directory"),
    }),
    execute: async ({
      sourcePath,
      destinationPath,
    }: {
      sourcePath: string;
      destinationPath: string;
    }) => {
      await fs.promises.cp(sourcePath, destinationPath, { recursive: true });
      return `Copied directory ${sourcePath} to ${destinationPath}`;
    },
  }),

  formatFile: tool<{ path: string }, string>({
    description:
      "Format a file using Prettier (if available) or default formatting",
    inputSchema: z.object({
      path: z.string().describe("Absolute path to the file to format"),
    }),
    execute: async ({ path: filePath }: { path: string }) => {
      const proc = Bun.spawn(["npx", "prettier", "--write", filePath], {
        stdout: "pipe",
        stderr: "pipe",
      });

      const stdout = await new Response(proc.stdout).text();
      const stderr = await new Response(proc.stderr).text();
      const exitCode = await proc.exited;

      if (exitCode !== 0) {
        return `Formatting failed: ${stderr}`;
      }

      return `Formatted ${filePath}`;
    },
  }),
};
