import { tool } from "ai";
import { z } from "zod";
import path from "path";
import fs from "fs";

const WORKSPACE_DIR = process.env.AGENT_WORKSPACE_DIR || "/tmp/agent-workspaces";

export const gitTools = {
  cloneRepo: tool<{ repoUrl: string; repoName: string; branch?: string }, string>({
    description: "Clone a git repository into the agent workspace. Returns the local path of the cloned repo.",
    inputSchema: z.object({
      repoUrl: z.string().describe("Git clone URL of the repository"),
      repoName: z.string().describe("Name for the local directory"),
      branch: z.string().optional().describe("Branch to clone (defaults to default branch)"),
    }),
    execute: async ({ repoUrl, repoName, branch }: { repoUrl: string; repoName: string; branch?: string }) => {
      const repoPath = path.join(WORKSPACE_DIR, repoName);

      await fs.promises.mkdir(WORKSPACE_DIR, { recursive: true });

      if (fs.existsSync(repoPath)) {
        const pullProc = Bun.spawn(["git", "pull"], {
          cwd: repoPath,
          stdout: "pipe",
          stderr: "pipe",
        });
        await pullProc.exited;
        return `Repository already exists at ${repoPath}, pulled latest changes.`;
      }

      const args = ["git", "clone"];
      if (branch) args.push("-b", branch);
      args.push(repoUrl, repoPath);

      const proc = Bun.spawn(args, { stdout: "pipe", stderr: "pipe" });
      const stderr = await new Response(proc.stderr).text();
      const exitCode = await proc.exited;

      if (exitCode !== 0) {
        return `Clone failed: ${stderr}`;
      }

      return `Cloned ${repoUrl} to ${repoPath}`;
    },
  }),

  createBranch: tool<{ repoPath: string; branchName: string }, string>({
    description: "Create and checkout a new git branch in a repository.",
    inputSchema: z.object({
      repoPath: z.string().describe("Local path to the repository"),
      branchName: z.string().describe("Name of the new branch"),
    }),
    execute: async ({ repoPath, branchName }: { repoPath: string; branchName: string }) => {
      const proc = Bun.spawn(["git", "checkout", "-b", branchName], {
        cwd: repoPath,
        stdout: "pipe",
        stderr: "pipe",
      });

      const stdout = await new Response(proc.stdout).text();
      const stderr = await new Response(proc.stderr).text();
      const exitCode = await proc.exited;

      if (exitCode !== 0) {
        return `Failed to create branch: ${stderr}`;
      }

      return `Created and checked out branch "${branchName}" in ${repoPath}`;
    },
  }),

  commitChanges: tool<{ repoPath: string; message: string }, string>({
    description: "Stage all changes and create a git commit.",
    inputSchema: z.object({
      repoPath: z.string().describe("Local path to the repository"),
      message: z.string().describe("Commit message"),
    }),
    execute: async ({ repoPath, message }: { repoPath: string; message: string }) => {
      const addProc = Bun.spawn(["git", "add", "-A"], {
        cwd: repoPath,
        stdout: "pipe",
        stderr: "pipe",
      });
      await addProc.exited;

      const commitProc = Bun.spawn(["git", "commit", "-m", message], {
        cwd: repoPath,
        stdout: "pipe",
        stderr: "pipe",
      });

      const stdout = await new Response(commitProc.stdout).text();
      const stderr = await new Response(commitProc.stderr).text();
      const exitCode = await commitProc.exited;

      if (exitCode !== 0) {
        return `Commit failed: ${stderr}`;
      }

      return `Committed: ${stdout.trim()}`;
    },
  }),

  pushBranch: tool<{ repoPath: string; branchName: string }, string>({
    description: "Push a branch to the remote repository.",
    inputSchema: z.object({
      repoPath: z.string().describe("Local path to the repository"),
      branchName: z.string().describe("Branch name to push"),
    }),
    execute: async ({ repoPath, branchName }: { repoPath: string; branchName: string }) => {
      const proc = Bun.spawn(["git", "push", "-u", "origin", branchName], {
        cwd: repoPath,
        stdout: "pipe",
        stderr: "pipe",
      });

      const stdout = await new Response(proc.stdout).text();
      const stderr = await new Response(proc.stderr).text();
      const exitCode = await proc.exited;

      if (exitCode !== 0) {
        return `Push failed: ${stderr}`;
      }

      return `Pushed branch "${branchName}" to origin`;
    },
  }),

  getGitLog: tool<{ repoPath: string; count?: number }, string>({
    description: "Get recent git log entries for a repository.",
    inputSchema: z.object({
      repoPath: z.string().describe("Local path to the repository"),
      count: z.number().optional().default(10).describe("Number of log entries"),
    }),
    execute: async ({ repoPath, count = 10 }: { repoPath: string; count?: number }) => {
      const proc = Bun.spawn(
        ["git", "log", `--oneline`, `-${count}`],
        { cwd: repoPath, stdout: "pipe", stderr: "pipe" }
      );

      const stdout = await new Response(proc.stdout).text();
      await proc.exited;

      return stdout || "No commits found";
    },
  }),

  getCurrentBranch: tool<{ repoPath: string }, string>({
    description: "Get the current branch name of a repository.",
    inputSchema: z.object({
      repoPath: z.string().describe("Local path to the repository"),
    }),
    execute: async ({ repoPath }: { repoPath: string }) => {
      const proc = Bun.spawn(["git", "branch", "--show-current"], {
        cwd: repoPath,
        stdout: "pipe",
        stderr: "pipe",
      });

      const stdout = await new Response(proc.stdout).text();
      await proc.exited;

      return stdout.trim() || "Detached HEAD";
    },
  }),
};
